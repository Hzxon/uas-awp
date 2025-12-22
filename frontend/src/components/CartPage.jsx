import React, { useMemo, useState, useEffect, useCallback } from 'react'; // FIX: Tambah useEffect
import { Link, useNavigate, useLocation } from 'react-router-dom'; // FIX: Tambah useLocation
import Navbar from './Navbar';
import Footer from './Footer';
import CheckoutModal from './CheckoutModal';
import ExitConfirmationModal from './ExitConfirmationModal';
import { orderApi, addressApi, paymentApi, outletApi } from '../api';
import AddressFormPanel from './AddressFormPanel';
import OutletMapView from './OutletMapView';
// import { format } from '../../../backend/src/config/db';

const CartPage = ({
  cartItems,
  onUpdateQuantity,
  isLoggedIn,
  userName,
  onLogout,
  cartCount,
  authToken,
  onOrderPlaced,
  selectedOutlet,
  setSelectedOutlet,
  selectedAddressId,
  setSelectedAddressId,
  pickupSlot,
  setPickupSlot,
  showItemsPanel = true,
  showAddressPanel = true,
  showPaymentCTA = true,
  showSummaryTotals = true,
  nextPath = "/checkout/address",
}) => {

  const navigate = useNavigate();
  const location = useLocation(); // FIX: Gunakan useLocation

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [targetSection, setTargetSection] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("virtual-account");
  const [isAddrLoading, setIsAddrLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [addressForm, setAddressForm] = useState({
    label: "Rumah",
    nama_penerima: "",
    phone: "",
    alamat: "",
    catatan: "",
    is_default: true,
    lat: "",
    lng: "",
  });
  const slots = [
    "08:00 - 10:00",
    "10:00 - 12:00",
    "13:00 - 15:00",
    "15:00 - 17:00",
  ];
  const [outlets, setOutlets] = useState([]);

  const handleOpenCheckout = useCallback(() => {
    setValidationMessage("");

    if (cartItems.length === 0) {
      setValidationMessage("Keranjang masih kosong! Silakan pilih layanan terlebih dahulu dari halaman utama.");
      return;
    }
    if (!isLoggedIn) {
      setValidationMessage("Silakan login dahulu untuk melanjutkan pembayaran.");
      return;
    }
    if (!selectedOutlet) {
      setValidationMessage("Pilih outlet terlebih dahulu.");
      return;
    }
    if (!selectedAddressId) {
      setValidationMessage("Pilih atau tambah alamat penjemputan terlebih dahulu.");
      return;
    }
    if (!showAddressPanel && nextPath) {
      navigate(nextPath);
      return;
    }
    if (!showPaymentCTA && nextPath) {
      navigate(nextPath);
      return;
    }
    setIsCheckoutModalOpen(true);
  }, [cartItems.length, isLoggedIn, selectedOutlet, showAddressPanel, showPaymentCTA, nextPath, navigate, selectedAddressId]);

  // 🌟 EFEK BARU: Membuka Modal Checkout Otomatis dari Navigasi 🌟
  useEffect(() => {
    // Cek apakah state 'openCheckout' ada
    if (location.state?.openCheckout) {
      handleOpenCheckout();

      // Hapus state agar modal tidak muncul lagi setelah navigasi
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [handleOpenCheckout, location.pathname, location.state, navigate]);

  const handleNavAttempt = (id) => {
    if (isCheckoutModalOpen) {
      setTargetSection(id);
      setIsExitModalOpen(true);
      return;
    }
    // Jika tidak sedang checkout, langsung navigasi tanpa modal
    navigate('/', { state: { targetId: id } });
  };

  const handleConfirmExit = () => {
    setIsExitModalOpen(false);
    navigate('/', { state: { targetId: targetSection } });
  };

  const { subtotal, totalItems } = useMemo(() => {
    const total = cartItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const count = cartItems.reduce((sum, item) => sum + item.qty, 0);
    return { subtotal: total, totalItems: count };
  }, [cartItems]);

  const deliveryFee = 15000;
  const taxRate = 0.1;
  const deliveryFeeValue = subtotal > 100000 ? 0 : deliveryFee;
  const taxAmount = Math.round(subtotal * taxRate);
  const finalTotal = subtotal + deliveryFeeValue + taxAmount;

  const refreshAddresses = useCallback(async () => {
    if (!authToken) return;
    setIsAddrLoading(true);
    try {
      const data = await addressApi.list(authToken);
      const list = Array.isArray(data.addresses) ? data.addresses : [];
      setAddresses(list);
      const defaultAddress = list.find((a) => a.is_default) || list[0];
      if (defaultAddress && !selectedAddressId) setSelectedAddressId(defaultAddress.id);
    } catch (err) {
      console.error("Gagal memuat alamat:", err);
    } finally {
      setIsAddrLoading(false);
    }
  }, [authToken, selectedAddressId, setSelectedAddressId]);

  useEffect(() => {
    if (authToken) {
      refreshAddresses();
    }
  }, [authToken, refreshAddresses]);

  useEffect(() => {
    (async () => {
      try {
        const data = await outletApi.list();
        setOutlets(Array.isArray(data.outlets) ? data.outlets : []);
        if (!selectedOutlet && data.outlets?.length) {
          setSelectedOutlet(data.outlets[0]);
        }
      } catch (err) {
        console.error("Gagal memuat outlet:", err);
      }
    })();
  }, [selectedOutlet, setSelectedOutlet]);

  useEffect(() => {
    setAddressForm((prev) => ({ ...prev, nama_penerima: userName || prev.nama_penerima }));
  }, [userName]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      if (isEditingAddress && editingAddressId) {
        // Update existing address
        await addressApi.update(authToken, editingAddressId, addressForm);
        setIsEditingAddress(false);
        setEditingAddressId(null);
      } else {
        // Create new address
        const res = await addressApi.create(authToken, addressForm);
        if (res.address?.id) setSelectedAddressId(res.address.id);
      }
      setCheckoutError("");
      setIsAddingAddress(false);
      setAddressForm({
        label: "Rumah",
        nama_penerima: userName || "",
        phone: "",
        alamat: "",
        catatan: "",
        is_default: true,
        lat: "",
        lng: "",
      });
      await refreshAddresses();
    } catch (err) {
      alert(err.message || "Gagal menyimpan alamat");
    }
  };

  const handleEditAddress = (addr) => {
    setAddressForm({
      label: addr.label || "Rumah",
      nama_penerima: addr.nama_penerima || "",
      phone: addr.phone || "",
      alamat: addr.alamat || "",
      catatan: addr.catatan || "",
      is_default: addr.is_default || false,
      lat: addr.lat || "",
      lng: addr.lng || "",
    });
    setEditingAddressId(addr.id);
    setIsEditingAddress(true);
    setIsAddingAddress(false);
  };

  const handleDeleteAddress = async (id) => {
    try {
      await addressApi.remove(authToken, id);
      await refreshAddresses();
      if (selectedAddressId === id) {
        setSelectedAddressId(null);
      }
    } catch (err) {
      alert(err.message || "Gagal menghapus alamat");
    }
  };

  const handleCancelAddressForm = () => {
    setIsAddingAddress(false);
    setIsEditingAddress(false);
    setEditingAddressId(null);
    setAddressForm({
      label: "Rumah",
      nama_penerima: userName || "",
      phone: "",
      alamat: "",
      catatan: "",
      is_default: true,
      lat: "",
      lng: "",
    });
  };

  // --- BAGIAN UTAMA YANG DIPERBAIKI ---
  const handleConfirmOrder = async () => {
    if (!authToken) {
      alert("Sesi login berakhir, silakan login kembali.");
      return;
    }
    if (!selectedAddressId) {
      alert("Pilih atau tambah alamat penjemputan terlebih dahulu.");
      setIsCheckoutModalOpen(false);
      setIsAddingAddress(true);
      return;
    }

    setCheckoutError("");
    setIsSubmitting(true);
    try {
      // 1. TRANSFORMASI DATA (MAPPING CERDAS)
      const formattedItems = cartItems.map((item) => {
        // Deteksi tipe item: Apakah 'Layanan' atau 'Produk'?
        // Default ke 'Layanan' jika properti type tidak ada untuk keamanan
        const isLayanan = !item.type || item.type === 'Layanan';

        return {
          // table database ngehandle layanan sekaligus produk
          layanan_id: isLayanan ? item.id : null,
          produk_id: !isLayanan ? (item.productId || item.id) : null,
          qty: parseInt(item.qty, 10),
        };
      });

      // 2. SIAPKAN PAYLOAD LENGKAP
      const payload = {
        items: formattedItems,
        deliveryFee: deliveryFeeValue,
        taxRate,
        address_id: selectedAddressId,
        outlet_id: selectedOutlet?.id,
        pickup_slot: pickupSlot,
      };

      // 3. KIRIM KE API
      const orderRes = await orderApi.create(authToken, payload);
      const orderId = orderRes.orderId;

      const payRes = await paymentApi.createMock(authToken, orderId);
      const token = payRes.payment?.token;
      await paymentApi.confirmMock(authToken, token, paymentMethod);

      setIsCheckoutModalOpen(false);
      if (onOrderPlaced) onOrderPlaced();
      navigate(`/payment/success?orderId=${orderId}`);
    } catch (err) {
      console.error("Order Error:", err);
      setCheckoutError(err.message || "Gagal memproses pesanan. Cek koneksi atau coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };
  // ------------------------------------

  const isAddressOnly = showAddressPanel && !showItemsPanel;

  if (isAddressOnly) {
    return (
      <div className="checkout-address-page">
        <Navbar
          cartCount={cartCount}
          cartItems={cartItems}
          isLoggedIn={isLoggedIn}
          userName={userName}
          onLogout={onLogout}
          onNavigating={handleNavAttempt}
        />

        <div className="checkout-address-container">
          {/* Breadcrumb */}
          <div className="checkout-breadcrumb">
            <span className="step-badge">Step 1</span>
            <span className="active-step">Informasi Pickup</span>
            <span className="step-arrow">→</span>
            <span>Layanan</span>
            <span className="step-arrow">→</span>
            <span>Pembayaran</span>
          </div>

          {/* Main Card */}
          <div className="checkout-main-card">
            {/* Header */}
            <div className="checkout-header">
              <div className="checkout-header-content">
                <h1>Alamat Pickup & Kontak</h1>
              </div>
              <div className="checkout-header-icon">
                <i className="fas fa-map-marked-alt"></i>
              </div>
            </div>

            {/* Body */}
            <div className="checkout-body">
              {/* Outlet & Slot Selection */}
              <div className="checkout-grid">
                <div className="checkout-field">
                  <label>Outlet</label>
                  <select
                    value={selectedOutlet?.id || ""}
                    onChange={(e) => {
                      const outlet = outlets.find((o) => o.id === Number(e.target.value));
                      setSelectedOutlet(outlet || null);
                      localStorage.setItem("selectedOutlet", JSON.stringify(outlet || null));
                    }}
                  >
                    <option value="" disabled>Pilih outlet</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nama} (ongkir mulai Rp {Number(o.min_biaya || 0).toLocaleString('id-ID')})
                      </option>
                    ))}
                  </select>
                  <p className="field-hint">Pengiriman akan dihitung berdasarkan jarak outlet dan alamat pickup.</p>
                  {!selectedOutlet && (
                    <p className="text-xs text-red-600">Harap pilih outlet untuk lanjut.</p>
                  )}
                </div>

                <div className="checkout-field">
                  <label>Slot Jemput</label>
                  <select
                    value={pickupSlot}
                    onChange={(e) => {
                      setPickupSlot(e.target.value);
                      localStorage.setItem("pickupSlot", e.target.value);
                    }}
                  >
                    {slots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Outlet Map */}
              <OutletMapView
                outlets={outlets}
                selectedOutlet={selectedOutlet}
                onSelectOutlet={(outlet) => {
                  setSelectedOutlet(outlet);
                  localStorage.setItem("selectedOutlet", JSON.stringify(outlet));
                }}
                height="350px"
              />

              {/* Address Form Panel */}
              <div style={{ marginTop: '1.5rem' }}>
                <AddressFormPanel
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  setSelectedAddressId={(id) => {
                    setSelectedAddressId(id);
                    localStorage.setItem("selectedAddressId", id ?? "");
                  }}
                  addressForm={addressForm}
                  setAddressForm={setAddressForm}
                  onSubmit={handleAddAddress}
                  onCancel={handleCancelAddressForm}
                  isAdding={isAddingAddress}
                  isEditing={isEditingAddress}
                  isLoading={isAddrLoading}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                />
              </div>

              {/* Footer Actions */}
              <div className="checkout-footer">
                <Link to="/" className="checkout-btn-back">
                  <i className="fas fa-arrow-left"></i>
                  Kembali
                </Link>
                <div className="checkout-footer-right">
                  {validationMessage && (
                    <div className="checkout-validation-message">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{validationMessage}</span>
                    </div>
                  )}
                  <button onClick={handleOpenCheckout} className="checkout-btn-next">
                    Lanjut ke Layanan
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />

        <ExitConfirmationModal
          isOpen={isExitModalOpen}
          onClose={() => setIsExitModalOpen(false)}
          onConfirmExit={handleConfirmExit}
        />
      </div>
    );
  }

  return (
    <div className="checkout-address-page">
      <Navbar
        cartCount={cartCount}
        cartItems={cartItems}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogout={onLogout}
        onNavigating={handleNavAttempt}
      />

      <div className="checkout-address-container">
        {/* Breadcrumb */}
        <div className="checkout-breadcrumb">
          <span className="step-badge">Step 2</span>
          <span>Informasi Pickup</span>
          <span className="step-arrow">→</span>
          <span className="active-step">Layanan</span>
          <span className="step-arrow">→</span>
          <span>Pembayaran</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <i className="fas fa-shopping-basket text-teal-600"></i> Keranjang Belanja Anda
        </h1>

        {showItemsPanel && cartItems.length === 0 ? (
          <div className="checkout-main-card">
            <i className="fas fa-box-open text-6xl text-slate-400 mb-4"></i>
            <p className="text-xl text-slate-600 mb-4">Keranjang Anda masih kosong.</p>
            <Link to="/" className="text-teal-600 font-semibold hover:text-teal-800 transition duration-150">
              &larr; Lanjut Berbelanja
            </Link>
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-8 ${showItemsPanel ? "lg:grid-cols-3" : ""}`}>
            {showItemsPanel && (
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center bg-white p-4 rounded-xl shadow-md justify-between">
                    <div className="flex items-center space-x-4 w-1/2">
                      <i className={`text-3xl ${item.type === 'Layanan' ? 'fas fa-tshirt text-blue-500' : 'fas fa-box text-green-500'}`}></i>
                      <div>
                        <h2 className="font-semibold text-gray-800">{item.name}</h2>
                        <p className="text-sm text-gray-500">Rp {item.price.toLocaleString('id-ID')} / {item.unit || 'unit'}</p>
                      </div>
                    </div>

                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="bg-gray-100 hover:bg-red-100 text-red-500 px-3 py-1 text-xl transition duration-150">
                        -
                      </button>
                      <span className="px-3 py-1 font-medium text-gray-800">{item.qty}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="bg-gray-100 hover:bg-green-100 text-green-500 px-3 py-1 text-xl transition duration-150">
                        +
                      </button>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-bold text-blue-700 w-24 text-right">
                        Rp {(item.qty * item.price).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="checkout-main-card p-6 h-fit sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Ringkasan Pesanan</h2>

              <div className="mb-4 border rounded-lg p-3">
                <span className="text-sm font-semibold text-gray-800">Outlet</span>
                <select
                  value={selectedOutlet?.id || ""}
                  onChange={(e) => {
                    const outlet = outlets.find((o) => o.id === Number(e.target.value));
                    setSelectedOutlet(outlet || null);
                    localStorage.setItem("selectedOutlet", JSON.stringify(outlet || null));
                  }}
                  className="mt-2 w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="" disabled>Pilih outlet</option>
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nama} (ongkir mulai Rp {Number(o.min_biaya || 0).toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
                {!selectedOutlet && (
                  <p className="text-xs text-red-600 mt-1">Harap pilih outlet untuk lanjut.</p>
                )}
              </div>

              {showAddressPanel && (
                <AddressFormPanel
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  setSelectedAddressId={setSelectedAddressId}
                  addressForm={addressForm}
                  setAddressForm={setAddressForm}
                  onSubmit={handleAddAddress}
                  onCancel={handleCancelAddressForm}
                  isAdding={isAddingAddress}
                  isEditing={isEditingAddress}
                  isLoading={isAddrLoading}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                />
              )}

              {showSummaryTotals && (
                <>
                  <div className="mb-4 border rounded-lg p-3">
                    <span className="text-sm font-semibold text-gray-800">Metode pembayaran</span>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-2 w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="virtual-account">Virtual Account (Mock)</option>
                      <option value="ewallet">E-Wallet (Mock)</option>
                      <option value="credit-card">Kartu Kredit (Mock)</option>
                    </select>
                  </div>

                  <div className="mb-4 border rounded-lg p-3">
                    <span className="text-sm font-semibold text-gray-800">Slot jemput</span>
                    <select
                      value={pickupSlot}
                      onChange={(e) => setPickupSlot(e.target.value)}
                      className="mt-2 w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      {slots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3 text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal ({totalItems} item)</span>
                      <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PPN (10%)</span>
                      <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Biaya Pengiriman</span>
                      <span className={deliveryFeeValue === 0 ? "text-green-600" : ""}>
                        {deliveryFeeValue === 0 ? "Gratis" : `Rp ${deliveryFeeValue.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-gray-200 flex justify-between font-bold text-xl text-gray-800">
                      <span>Total Pembayaran</span>
                      <span>Rp {finalTotal.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={handleOpenCheckout}
                className="checkout-btn-next w-full mt-6 justify-center">
                {showAddressPanel ? (showPaymentCTA ? "Proses Pembayaran" : "Lanjut ke Layanan") : "Lanjut ke Pembayaran"}
                <i className="fas fa-arrow-right"></i>
              </button>
              <Link to="/" className="w-full mt-3 inline-block text-center text-slate-600 hover:text-slate-800 font-medium">
                &larr; Lanjut Belanja
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />

      {showAddressPanel && showPaymentCTA && (
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          cartItems={cartItems}
          subtotal={subtotal}
          finalTotal={finalTotal}
          deliveryFee={deliveryFeeValue}
          taxAmount={taxAmount}
          taxRate={taxRate}
          onConfirmOrder={handleConfirmOrder}
          userName={userName}
          isSubmitting={isSubmitting}
          address={addresses.find((a) => a.id === selectedAddressId)}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          errorMessage={checkoutError}
          outlet={selectedOutlet}
          pickupSlot={pickupSlot}
        />
      )}

      <ExitConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirmExit={handleConfirmExit}
      />
    </div>
  );
};

export default CartPage;
