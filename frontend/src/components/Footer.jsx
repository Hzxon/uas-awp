import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="beach-footer">
            {/* Beach Sketch Illustration */}
            <div className="beach-sketch-container">
                <svg className="beach-sketch" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice">
                    {/* Sky gradient - starts transparent to blend with page */}
                    <defs>
                        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#fefefe" stopOpacity="0" />
                            <stop offset="30%" stopColor="#fef3c7" stopOpacity="0.3" />
                            <stop offset="60%" stopColor="#fde68a" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#fcd34d" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>
                    <rect fill="url(#skyGrad)" width="1440" height="400" />

                    {/* Sun */}
                    <circle cx="1300" cy="60" r="40" fill="none" stroke="#92400e" strokeWidth="2" />
                    <circle cx="1300" cy="60" r="35" fill="none" stroke="#92400e" strokeWidth="1" strokeDasharray="5,5" />

                    {/* Clouds - sketch style */}
                    <g stroke="#92400e" strokeWidth="1.5" fill="none">
                        <path d="M100,50 Q120,30 150,40 Q180,25 210,45 Q230,35 240,50" />
                        <path d="M400,70 Q430,50 460,60 Q490,45 520,65" />
                        <path d="M700,40 Q720,25 750,35 Q780,20 810,40 Q840,30 860,45" />
                    </g>

                    {/* Birds */}
                    <g stroke="#92400e" strokeWidth="1.5" fill="none">
                        <path d="M200,80 Q210,70 220,80" />
                        <path d="M230,75 Q240,65 250,75" />
                        <path d="M600,60 Q610,50 620,60" />
                        <path d="M630,55 Q640,45 650,55" />
                        <path d="M1100,90 Q1110,80 1120,90" />
                    </g>

                    {/* Ocean waves - background */}
                    <path d="M0,180 Q60,170 120,180 Q180,190 240,180 Q300,170 360,180 Q420,190 480,180 Q540,170 600,180 Q660,190 720,180 Q780,170 840,180 Q900,190 960,180 Q1020,170 1080,180 Q1140,190 1200,180 Q1260,170 1320,180 Q1380,190 1440,180 L1440,200 L0,200 Z" fill="none" stroke="#0891b2" strokeWidth="1.5" />
                    <path d="M0,195 Q80,185 160,195 Q240,205 320,195 Q400,185 480,195 Q560,205 640,195 Q720,185 800,195 Q880,205 960,195 Q1040,185 1120,195 Q1200,205 1280,195 Q1360,185 1440,195" fill="none" stroke="#0891b2" strokeWidth="1" />

                    {/* Beach/Sand area */}
                    <path d="M0,200 Q200,210 400,200 Q600,190 800,200 Q1000,210 1200,200 Q1400,190 1440,200 L1440,400 L0,400 Z" fill="#fde68a" stroke="none" />

                    {/* Sand texture lines */}
                    <g stroke="#d97706" strokeWidth="0.5" opacity="0.3">
                        <path d="M50,220 L100,220" />
                        <path d="M200,240 L280,240" />
                        <path d="M400,225 L450,225" />
                        <path d="M600,235 L680,235" />
                        <path d="M800,220 L860,220" />
                        <path d="M1000,230 L1080,230" />
                        <path d="M1200,215 L1260,215" />
                    </g>

                    {/* Palm Tree 1 - Left */}
                    <g stroke="#92400e" strokeWidth="2" fill="none">
                        <path d="M80,320 Q85,280 90,200" />
                        <path d="M90,200 Q60,180 30,190" />
                        <path d="M90,200 Q70,170 50,175" />
                        <path d="M90,200 Q100,170 95,160" />
                        <path d="M90,200 Q120,175 140,180" />
                        <path d="M90,200 Q130,190 150,200" />
                    </g>
                    {/* Coconuts */}
                    <circle cx="88" cy="205" r="5" fill="none" stroke="#92400e" strokeWidth="1.5" />
                    <circle cx="95" cy="208" r="4" fill="none" stroke="#92400e" strokeWidth="1.5" />

                    {/* Palm Tree 2 - Right */}
                    <g stroke="#92400e" strokeWidth="2" fill="none">
                        <path d="M1350,350 Q1355,300 1360,220" />
                        <path d="M1360,220 Q1330,200 1300,210" />
                        <path d="M1360,220 Q1340,190 1320,195" />
                        <path d="M1360,220 Q1370,190 1365,180" />
                        <path d="M1360,220 Q1390,195 1410,200" />
                        <path d="M1360,220 Q1400,210 1420,220" />
                    </g>

                    {/* Beach Umbrella 1 */}
                    <g stroke="#92400e" strokeWidth="1.5" fill="none">
                        <path d="M300,320 L300,250" />
                        <path d="M250,250 Q300,220 350,250" />
                        <path d="M260,250 L300,230 L340,250" />
                    </g>

                    {/* Beach Chair 1 */}
                    <g stroke="#92400e" strokeWidth="1.5" fill="none">
                        <path d="M320,320 L335,290 L380,290 L395,320" />
                        <path d="M335,290 L330,260 L375,260 L380,290" />
                    </g>

                    {/* Beach Hut / Tiki Bar */}
                    <g stroke="#92400e" strokeWidth="1.5" fill="none">
                        <rect x="500" y="260" width="100" height="60" />
                        <path d="M480,260 L550,220 L620,260" />
                        {/* Thatch roof lines */}
                        <path d="M490,255 L550,225 L610,255" />
                        <path d="M500,250 L550,230 L600,250" />
                        {/* Door and window */}
                        <rect x="535" y="285" width="30" height="35" />
                        <rect x="510" y="275" width="15" height="15" />
                        <path d="M510,282 L525,282" />
                        <path d="M517,275 L517,290" />
                        {/* Sign */}
                        <rect x="580" y="270" width="15" height="10" />
                    </g>

                    {/* Surfboards */}
                    <g stroke="#92400e" strokeWidth="1.5" fill="none">
                        <ellipse cx="180" cy="280" rx="8" ry="35" transform="rotate(-15 180 280)" />
                        <ellipse cx="200" cy="285" rx="7" ry="30" transform="rotate(-10 200 285)" />
                    </g>

                    {/* Beach Ball */}
                    <g stroke="#92400e" strokeWidth="1.5" fill="none">
                        <circle cx="700" cy="300" r="15" />
                        <path d="M685,300 Q700,290 715,300" />
                        <path d="M685,300 Q700,310 715,300" />
                    </g>

                    {/* Boat in water */}
                    <g stroke="#0891b2" strokeWidth="1.5" fill="none" transform="translate(900, 170)">
                        <path d="M0,20 Q25,30 50,20 Q60,10 50,0 L10,0 Q0,10 0,20" />
                        <path d="M25,0 L25,-30" />
                        <path d="M25,-30 L50,-10 L25,-5" />
                    </g>

                    {/* Sailboat 2 */}
                    <g stroke="#0891b2" strokeWidth="1" fill="none" transform="translate(1100, 160)">
                        <path d="M0,15 Q15,20 30,15 Q35,8 30,0 L5,0 Q0,8 0,15" />
                        <path d="M15,0 L15,-20" />
                        <path d="M15,-20 L28,-5 L15,-2" />
                    </g>

                    {/* Seashells */}
                    <g stroke="#92400e" strokeWidth="1" fill="none">
                        <path d="M420,310 Q425,300 435,305 Q440,315 430,320 Q420,315 420,310" />
                        <path d="M850,330 Q855,320 865,325 Q870,335 860,340 Q850,335 850,330" />
                        <path d="M1150,315 Q1160,310 1165,320 Q1160,330 1150,325 Q1145,320 1150,315" />
                    </g>

                    {/* Starfish */}
                    <g stroke="#92400e" strokeWidth="1" fill="none" transform="translate(780, 340)">
                        <path d="M0,-10 L2,-3 L10,-3 L4,2 L6,10 L0,5 L-6,10 L-4,2 L-10,-3 L-2,-3 Z" />
                    </g>

                    {/* Crab */}
                    <g stroke="#92400e" strokeWidth="1" fill="none" transform="translate(650, 350)">
                        <ellipse rx="12" ry="8" />
                        <path d="M-12,-4 Q-20,-10 -25,-5" />
                        <path d="M12,-4 Q20,-10 25,-5" />
                        <circle cx="-5" cy="-3" r="2" />
                        <circle cx="5" cy="-3" r="2" />
                    </g>

                    {/* People silhouettes - simple sketch */}
                    <g stroke="#92400e" strokeWidth="1.5" fill="none">
                        {/* Person 1 - standing */}
                        <circle cx="250" cy="295" r="6" />
                        <path d="M250,301 L250,325" />
                        <path d="M250,305 L240,315" />
                        <path d="M250,305 L260,315" />
                        <path d="M250,325 L242,340" />
                        <path d="M250,325 L258,340" />

                        {/* Person 2 - walking */}
                        <circle cx="950" cy="290" r="5" />
                        <path d="M950,295 L950,315" />
                        <path d="M950,300 L942,308" />
                        <path d="M950,300 L958,310" />
                        <path d="M950,315 L944,330" />
                        <path d="M950,315 L956,330" />
                    </g>

                    {/* Wave foam at shore */}
                    <g stroke="#0891b2" strokeWidth="1" fill="none" opacity="0.6">
                        <path d="M0,205 Q30,200 60,205 Q90,210 120,205 Q150,200 180,205 Q210,210 240,205 Q270,200 300,205" />
                        <path d="M400,203 Q430,198 460,203 Q490,208 520,203 Q550,198 580,203" />
                        <path d="M700,205 Q730,200 760,205 Q790,210 820,205 Q850,200 880,205" />
                        <path d="M1000,203 Q1030,198 1060,203 Q1090,208 1120,203 Q1150,198 1180,203" />
                        <path d="M1300,205 Q1330,200 1360,205 Q1390,210 1420,205 Q1430,202 1440,205" />
                    </g>

                    {/* Footprints */}
                    <g fill="#d97706" opacity="0.3">
                        <ellipse cx="350" cy="340" rx="4" ry="7" />
                        <ellipse cx="360" cy="345" rx="4" ry="7" />
                        <ellipse cx="370" cy="340" rx="4" ry="7" />
                        <ellipse cx="380" cy="345" rx="4" ry="7" />
                    </g>
                </svg>
            </div>

            {/* Footer Content */}
            <div className="footer-content-overlay">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <img src="/logo.png" alt="WashFast Logo" className="h-9 w-9 rounded-xl" />
                                <h3 className="text-xl font-bold text-slate-800">WashFast</h3>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                Laundry on-demand yang cepat, higienis, dan wangi konsisten.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-slate-800 mb-3">Navigasi</h4>
                            <ul className="space-y-2 text-sm text-slate-700">
                                <li><a href="#beranda" className="hover:text-teal-600 transition-colors">Beranda</a></li>
                                <li><a href="#layanan-lengkap" className="hover:text-teal-600 transition-colors">Semua Layanan</a></li>
                                <li><a href="#produk-lengkap" className="hover:text-teal-600 transition-colors">Katalog Produk</a></li>
                                <li><a href="#beranda" className="hover:text-teal-600 transition-colors">Tentang Kami</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-slate-800 mb-3">Bantuan</h4>
                            <ul className="space-y-2 text-sm text-slate-700">
                                <li><a href="#" className="hover:text-teal-600 transition-colors">FAQ</a></li>
                                <li><a href="#" className="hover:text-teal-600 transition-colors">Kontak</a></li>
                                <li><a href="#" className="hover:text-teal-600 transition-colors">Kebijakan Privasi</a></li>
                                <li><a href="#" className="hover:text-teal-600 transition-colors">Syarat & Ketentuan</a></li>
                                <li><a href="/partner/register" className="hover:text-teal-600 transition-colors font-medium">🤝 Daftar Jadi Mitra</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-slate-800 mb-3">Ikuti Kami</h4>
                            <div className="flex space-x-3 text-slate-700">
                                <a href="#" className="hover:text-teal-600 transition-colors"><i className="fab fa-facebook-f text-lg"></i></a>
                                <a href="#" className="hover:text-rose-500 transition-colors"><i className="fab fa-instagram text-lg"></i></a>
                                <a href="#" className="hover:text-green-600 transition-colors"><i className="fab fa-whatsapp text-lg"></i></a>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-slate-600 border-t border-amber-300/50 pt-6">
                        <p>&copy; {currentYear} WashFast Laundry. Semua hak dilindungi.</p>
                        <div className="flex gap-4 mt-3 md:mt-0">
                            <a href="#" className="hover:text-teal-600 transition-colors">Privasi</a>
                            <a href="#" className="hover:text-teal-600 transition-colors">Ketentuan</a>
                            <a href="#" className="hover:text-teal-600 transition-colors">Pusat Bantuan</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
