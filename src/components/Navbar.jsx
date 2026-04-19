import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import idaatLogo from '../assets/idaat logo.png';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { name: 'الرئيسية', path: '/' },
        { name: 'الكتب', path: '/books' },
        { name: 'الإضاءات', path: '/articles' },
        { name: 'الفيديوهات', path: '/videos' },
        { name: 'الاستشارات', path: '/consultations' },
        { name: 'فريق العمل', path: '/team' },
        // { name: 'مشروع التلاوة', path: '/quran' }, // Delayed
        { name: 'تواصل معنا', path: '/contact' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="logo">
                    <img
                        src={idaatLogo}
                        alt=""
                        className="logo-img"
                        
                        decoding="async"
                        aria-hidden
                    />
                    <span className="logo-text">سبيل الإضاءات</span>
                </Link>

                {/* Desktop Menu */}
                <div className="nav-links desktop-only">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Menu Overlay */}
                <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
