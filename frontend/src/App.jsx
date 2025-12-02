import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import CartPage from "./components/CartPage";
import ModalAuth from "./components/ModalAuth";
import { authApi } from "./api";

const ProtectedRoute = ({ isLoggedIn, onRequireAuth, children }) => {
  useEffect(() => {
    if (!isLoggedIn && onRequireAuth) {
      onRequireAuth();
    }
  }, [isLoggedIn, onRequireAuth]);

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("authToken") || "");
  const [cartItems, setCartItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("login");
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    if (!authToken) {
      setUser(null);
      return;
    }

    let active = true;

    (async () => {
      try {
        const { user: profile } = await authApi.me(authToken);
        if (active) {
          setUser(profile);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("authToken");
        if (active) {
          setAuthToken("");
          setUser(null);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [authToken]);

  const openModal = useCallback((type = "login") => {
    setModalType(type);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleAuthSuccess = ({ token, user: profile }) => {
    setAuthToken(token);
    localStorage.setItem("authToken", token);
    setUser(profile);
    closeModal();
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken("");
    setCartItems([]);
    localStorage.removeItem("authToken");
    alert("Anda telah keluar.");
  };

  const handleAddToCart = (item) => {
    if (!isLoggedIn) {
      openModal("login");
      return;
    }

    const normalizedItem = {
      ...item,
      unit: item.unit || (item.type === "Layanan" ? "kg" : "pcs"),
    };

    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === normalizedItem.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === normalizedItem.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...normalizedItem, qty: 1 }];
    });
    alert(`Berhasil menambahkan 1x ${item.name} ke keranjang!`);
  };

  const handleUpdateQuantity = (id, change) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + change;
            if (newQty <= 0) return null;
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const handleOrderPlaced = () => setCartItems([]);

  const requireLogin = useCallback(() => openModal("login"), [openModal]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              onAddToCart={handleAddToCart}
              cartCount={cartCount}
              userName={user?.nama || ""}
              openModal={openModal}
            />
          }
        />

                {/* Halaman Cart (Dilindungi) */}
                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute isLoggedIn={isLoggedIn}>
                            <CartPage 
                                isLoggedIn={isLoggedIn} // Perlu agar navbar muncul
                                userName={userName} // Perlu agar navbar muncul
                                onLogout={handleLogout} // Perlu agar navbar muncul
                                cartCount={cartCount} // Perlu agar navbar muncul
                                cartItems={cartItems} 
                                onUpdateQuantity={handleUpdateQuantity}
                            />
                        </ProtectedRoute>
                    }
                />
                
                {/* Halaman Profil dan rute lainnya... */}
                 <Route
                    path="/profile"
                    element={
                        <ProtectedRoute isLoggedIn={isLoggedIn}>
                             <LandingPage 
                                isLoggedIn={isLoggedIn} 
                                onLogout={handleLogout} 
                                onAddToCart={handleAddToCart} 
                                cartCount={cartCount} 
                                userName={userName}
                                openModal={openModal} 
                                // Asumsi ProfilePage adalah versi LandingPage dengan konten yang berbeda atau dialihkan ke halaman lain
                            />
                        </ProtectedRoute>
                    }
                />
            </Routes>

      {isModalOpen && (
        <ModalAuth
          type={modalType}
          onClose={closeModal}
          onLoginSuccess={handleAuthSuccess}
          onRegisterSuccess={handleAuthSuccess}
          setModalType={setModalType}
        />
      )}
    </Router>
  );
};

export default App;
