import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import CartPage from "./components/CartPage";
import ModalAuth from "./components/ModalAuth";
import { authApi } from "./api";
import AdminPage from "./components/AdminPage";
import AdminOrdersPage from "./components/AdminOrdersPage";
import PaymentSuccess from "./components/PaymentSuccess";
import CheckoutPaymentPage from "./components/CheckoutPaymentPage";
import NotFound from "./components/NotFound";
import OrderStatusPage from "./components/OrderStatusPage";
import PartnerRegistration from "./components/partner/PartnerRegistration";
import PartnerDashboard from "./components/partner/PartnerDashboard";
import PartnerOrders from "./components/partner/PartnerOrders";
import PartnerItemsPage from "./components/partner/PartnerItemsPage";
import SearchPage from "./components/search/SearchPage";
import OutletDetailPage from "./components/search/OutletDetailPage";

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
  const [selectedOutlet, setSelectedOutlet] = useState(() => {
    const saved = localStorage.getItem("selectedOutlet");
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    const saved = localStorage.getItem("selectedAddressId");
    return saved ? Number(saved) : null;
  });
  const [pickupSlot, setPickupSlot] = useState(() => localStorage.getItem("pickupSlot") || "08:00 - 10:00");
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
    setSelectedAddressId(null);
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
              userRole={user?.role || ""}
              selectedOutlet={selectedOutlet}
              setSelectedOutlet={(outlet) => {
                setSelectedOutlet(outlet);
                localStorage.setItem("selectedOutlet", JSON.stringify(outlet));
              }}
            />
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
                userRole={user?.role || ""}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment/success"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} onRequireAuth={requireLogin}>
              <PaymentSuccess authToken={authToken} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout/payment"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} onRequireAuth={requireLogin}>
              <CheckoutPaymentPage
                authToken={authToken}
                cartItems={cartItems}
                selectedOutlet={selectedOutlet}
                selectedAddressId={selectedAddressId}
                pickupSlot={pickupSlot}
                onOrderPlaced={handleOrderPlaced}
                userName={user?.nama || ""}
                onLogout={handleLogout}
                cartCount={cartCount}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout/address"
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
                selectedOutlet={selectedOutlet}
                setSelectedOutlet={(outlet) => {
                  setSelectedOutlet(outlet);
                  localStorage.setItem("selectedOutlet", JSON.stringify(outlet));
                }}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={(id) => {
                  setSelectedAddressId(id);
                  localStorage.setItem("selectedAddressId", id ?? "");
                }}
                pickupSlot={pickupSlot}
                setPickupSlot={(slot) => {
                  setPickupSlot(slot);
                  localStorage.setItem("pickupSlot", slot);
                }}
                showItemsPanel={false}
                showAddressPanel
                showPaymentCTA={false}
                showSummaryTotals={false}
                nextPath="/checkout/services"
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout/services"
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
                selectedOutlet={selectedOutlet}
                setSelectedOutlet={(outlet) => {
                  setSelectedOutlet(outlet);
                  localStorage.setItem("selectedOutlet", JSON.stringify(outlet));
                }}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={(id) => {
                  setSelectedAddressId(id);
                  localStorage.setItem("selectedAddressId", id ?? "");
                }}
                pickupSlot={pickupSlot}
                setPickupSlot={(slot) => {
                  setPickupSlot(slot);
                  localStorage.setItem("pickupSlot", slot);
                }}
                showItemsPanel
                showAddressPanel={false}
                showPaymentCTA
                nextPath="/checkout/payment"
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} onRequireAuth={requireLogin}>
              {user?.role === "admin" || user?.role === "superadmin" ? (
                <AdminPage
                  userName={user?.nama || ""}
                  userRole={user?.role || "admin"}
                  onLogout={handleLogout}
                  authToken={authToken}
                />
              ) : (
                <Navigate to="/" replace />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} onRequireAuth={requireLogin}>
              {user?.role === "admin" || user?.role === "superadmin" ? (
                <AdminOrdersPage authToken={authToken} userName={user?.nama || ""} userRole={user?.role} />
              ) : (
                <Navigate to="/" replace />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/status"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} onRequireAuth={requireLogin}>
              <OrderStatusPage authToken={authToken} />
            </ProtectedRoute>
          }
        />

        {/* Partner Routes */}
        <Route
          path="/partner/register"
          element={
            <PartnerRegistration
              token={authToken}
              isLoggedIn={isLoggedIn}
              onRequireAuth={requireLogin}
            />
          }
        />

        <Route
          path="/partner/dashboard"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} onRequireAuth={requireLogin}>
              {user?.role === "partner" || user?.role === "admin" ? (
                <PartnerDashboard token={authToken} />
              ) : (
                <Navigate to="/partner/register" replace />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/partner/orders"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} onRequireAuth={requireLogin}>
              {user?.role === "partner" || user?.role === "admin" ? (
                <PartnerOrders token={authToken} />
              ) : (
                <Navigate to="/partner/register" replace />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/partner/items"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} onRequireAuth={requireLogin}>
              {user?.role === "partner" || user?.role === "admin" ? (
                <PartnerItemsPage token={authToken} />
              ) : (
                <Navigate to="/partner/register" replace />
              )}
            </ProtectedRoute>
          }
        />

        {/* Search Routes */}
        <Route
          path="/search"
          element={
            <SearchPage
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              cartCount={cartCount}
              cartItems={cartItems}
              userName={user?.nama || ""}
              openModal={openModal}
              userRole={user?.role || ""}
            />
          }
        />

        <Route
          path="/outlet/:id"
          element={
            <OutletDetailPage
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              onAddToCart={handleAddToCart}
              cartCount={cartCount}
              cartItems={cartItems}
              userName={user?.nama || ""}
              openModal={openModal}
              userRole={user?.role || ""}
              token={authToken}
            />
          }
        />

        <Route path="*" element={<NotFound />} />

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
