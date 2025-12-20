import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { addressApi, paymentApi, orderApi } from "../api";

const CheckoutPaymentPage = ({
  cartItems = [],
  authToken,
  userName = "",
  onLogout,
  cartCount = 0,
  selectedOutlet,
  selectedAddressId,
  pickupSlot,
  onOrderPlaced,
}) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("virtual-account");
  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { subtotal, totalItems } = useMemo(() => {
    const total = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);
    const count = cartItems.reduce((sum, item) => sum + item.qty, 0);
    return { subtotal: total, totalItems: count };
  }, [cartItems]);

  const deliveryFee = 15000;
  const taxRate = 0.1;
  const deliveryFeeValue = subtotal > 100000 ? 0 : deliveryFee;
  const taxAmount = Math.round(subtotal * taxRate);
  const finalTotal = subtotal + deliveryFeeValue + taxAmount;

  useEffect(() => {
    if (!authToken) return;
    (async () => {
      try {
        const data = await addressApi.list(authToken);
        setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
      } catch (err) {
        console.error("Gagal memuat alamat:", err);
      }
    })();
  }, [authToken]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  const handleConfirm = async () => {
    if (!authToken) {
      setError("Sesi login berakhir, silakan login ulang.");
      return;
    }
    if (!selectedAddressId) {
      setError("Pilih alamat penjemputan terlebih dahulu.");
      return;
    }
    if (!selectedOutlet) {
      setError("Pilih outlet terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const formattedItems = cartItems.map((item) => {
        const isLayanan = !item.type || item.type === "Layanan";
        return {
          layanan_id: isLayanan ? item.id : null,
          produk_id: !isLayanan ? item.id : null,
          qty: parseInt(item.qty, 10),
        };
      });

      const payload = {
        items: formattedItems,
        deliveryFee: deliveryFeeValue,
        taxRate,
        address_id: selectedAddressId,
        outlet_id: selectedOutlet?.id,
        pickup_slot: pickupSlot,
      };

      const orderRes = await orderApi.create(authToken, payload);
      const orderId = orderRes.orderId;
      const payRes = await paymentApi.createMock(authToken, orderId);
      const token = payRes.payment?.token;
      await paymentApi.confirmMock(authToken, token, paymentMethod);

      if (onOrderPlaced) onOrderPlaced();
      navigate(`/payment/success?orderId=${orderId}`);
    } catch (err) {
      console.error("Order Error:", err);
      setError(err.message || "Gagal memproses pesanan. Cek koneksi atau coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-address-page">
      <Navbar
        cartCount={cartCount}
        cartItems={cartItems}
        isLoggedIn={Boolean(authToken)}
        userName={userName}
        onLogout={onLogout}
      />

      <div className="checkout-address-container">
        {/* Breadcrumb */}
        <div className="checkout-breadcrumb">
          <span className="step-badge">Step 3</span>
          <span>Informasi Pickup</span>
          <span className="step-arrow">→</span>
          <span>Layanan</span>
          <span className="step-arrow">→</span>
          <span className="active-step">Pembayaran</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">Proses Pembayaran</h1>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="checkout-main-card p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Metode Pembayaran</h3>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="virtual-account">Virtual Account (Mock)</option>
                <option value="ewallet">E-Wallet (Mock)</option>
                <option value="credit-card">Kartu Kredit (Mock)</option>
              </select>
            </div>

            <div className="checkout-main-card p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Ringkasan Alamat & Outlet</h3>
              <div className="text-sm text-slate-700 space-y-2">
                <div className="border rounded-lg p-3">
                  <p className="font-semibold">Outlet</p>
                  <p>{selectedOutlet ? `${selectedOutlet.nama} • Ongkir mulai Rp ${Number(selectedOutlet.min_biaya || 0).toLocaleString("id-ID")}` : "Belum dipilih"}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="font-semibold">Alamat penjemputan</p>
                  {selectedAddress ? (
                    <>
                      <p>{selectedAddress.alamat}</p>
                      {selectedAddress.phone && <p className="text-slate-500">Telp: {selectedAddress.phone}</p>}
                    </>
                  ) : (
                    <p className="text-red-600">Alamat belum dipilih.</p>
                  )}
                </div>
                <div className="border rounded-lg p-3">
                  <p className="font-semibold">Slot jemput</p>
                  <p>{pickupSlot || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-main-card p-4 h-fit">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Ringkasan Pembayaran</h2>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} item)</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>PPN (10%)</span>
                <span>Rp {taxAmount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Pengiriman</span>
                <span className={deliveryFeeValue === 0 ? "text-green-600" : ""}>
                  {deliveryFeeValue === 0 ? "Gratis" : `Rp ${deliveryFeeValue.toLocaleString("id-ID")}`}
                </span>
              </div>
              <div className="pt-2 border-t flex justify-between font-bold text-xl text-slate-900">
                <span>Total Pembayaran</span>
                <span>Rp {finalTotal.toLocaleString("id-ID")}</span>
              </div>
            </div>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="checkout-btn-next w-full mt-6 justify-center"
            >
              {isSubmitting ? "Memproses..." : "Konfirmasi & Bayar"}
              <i className="fas fa-check"></i>
            </button>
            <button
              onClick={() => navigate("/checkout/services")}
              className="checkout-btn-back w-full mt-3 justify-center"
            >
              <i className="fas fa-arrow-left"></i>
              Kembali ke Layanan
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPaymentPage;
