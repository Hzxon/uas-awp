import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import CartPage from './components/CartPage'; 
import ModalAuth from './components/ModalAuth'; 


const ProtectedRoute = ({ isLoggedIn, children }) => {
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />; 
    }
    return children;
};

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [userName, setUserName] = useState(''); 
    const [cartItems, setCartItems] = useState([]); 
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [modalType, setModalType] = useState('login');

    const handleLogin = (name) => {
        setIsLoggedIn(true);
        setUserName(name);
        setIsModalOpen(false); // Tutup modal setelah login
    };

    const handleRegister = (name) => {
        // Setelah register sukses, langsung arahkan ke login (atau login otomatis)
        setUserName(name);
        setModalType('login'); // Ganti ke form login
        alert(`Pendaftaran ${name} berhasil! Silakan Login.`);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserName(''); 
        alert("Anda telah keluar.");
    };

    // --- LOGIKA MODAL ---
    const openModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);


    // --- LOGIKA KERANJANG ---
    const handleAddToCart = (item) => {
        if (!isLoggedIn) {
            openModal('login');
            return;
        }

        setCartItems(prev => {
            const existingItem = prev.find(i => i.id === item.id);
            if (existingItem) {
                // Jika item sudah ada, tambah kuantitas
                return prev.map(i => 
                    i.id === item.id ? { ...i, qty: i.qty + 1 } : i
                );
            } else {
                // Jika item baru, tambahkan ke list
                return [...prev, { ...item, qty: 1 }];
            }
        });
        alert(`Berhasil menambahkan 1x ${item.name} ke keranjang!`);
    };

    const handleUpdateQuantity = (id, change) => {
        setCartItems(prev => {
            return prev.map(item => {
                if (item.id === id) {
                    const newQty = item.qty + change;
                    if (newQty <= 0) return null; // Akan difilter
                    return { ...item, qty: newQty };
                }
                return item;
            }).filter(item => item !== null); // Hapus item jika qty <= 0
        });
    };
    
    // Hitung total item untuk Navbar
    const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

    return (
        <Router>
            <Routes>
                {/* Landing Page (Halaman utama) */}
                <Route 
                    path="/" 
                    element={
                        <LandingPage 
                            isLoggedIn={isLoggedIn} 
                            onLogout={handleLogout} 
                            onAddToCart={handleAddToCart} 
                            cartCount={cartCount} 
                            userName={userName}
                            openModal={openModal} // Meneruskan fungsi open modal
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

            {/* Modal Otentikasi Pop-up */}
            {isModalOpen && (
                <ModalAuth
                    type={modalType}
                    onClose={closeModal}
                    onLoginSuccess={handleLogin}
                    onRegisterSuccess={handleRegister}
                    setModalType={setModalType}
                />
            )}
        </Router>
    );
};

export default App;