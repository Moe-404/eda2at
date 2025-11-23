import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-content">
                    <h3>سبيل الإضاءات</h3>
                    <p>منصة إسلامية شاملة لنشر العلم والمعرفة</p>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة لسبيل الإضاءات</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
