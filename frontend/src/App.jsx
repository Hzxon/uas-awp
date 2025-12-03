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
    if (!authToken) return;

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

  const handleOrderPlaced = useCallback(() => setCartItems([]), []);
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
              cartItems={cartItems}
              userName={user?.nama || ""}
              openModal={openModal}
            />
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} onRequireAuth={requireLogin}>
              <CartPage
                isLoggedIn={isLoggedIn}
                userName={user?.nama || ""}
                onLogout={handleLogout}
                cartCount={cartCount}
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                authToken={authToken}
                onOrderPlaced={handleOrderPlaced}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} onRequireAuth={requireLogin}>
              <LandingPage
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              onAddToCart={handleAddToCart}
              cartCount={cartCount}
              cartItems={cartItems}
              userName={user?.nama || ""}
              openModal={openModal}
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
