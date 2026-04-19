import React from 'react';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import './Footer.css';

const TiktokIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.14-1.65 1.08-3.16 2.53-4.11C5.63 8.13 7.83 7.42 10.01 7.7c0-.67 0-1.34.01-2.01-.66-.07-1.32-.09-1.98-.07-2.11.02-4.22.89-5.78 2.35-1.52 1.42-2.44 3.43-2.52 5.5-.07 1.74.37 3.49 1.24 4.99 1.09 1.9 2.87 3.38 4.96 3.94 2.38.65 5.02.26 7.06-1.24 1.66-1.19 2.84-2.96 3.24-4.93.14-.75.2-1.52.19-2.29V.02h-3.89z" />
    </svg>
);

const SOCIAL_LINKS = [
    { href: 'https://www.facebook.com/profile.php?id=61576707039463', label: 'فيسبوك', Icon: Facebook },
    { href: 'https://www.instagram.com/k.m.iddaat/', label: 'إنستغرام', Icon: Instagram },
    { href: 'https://www.tiktok.com/@iddaat2', label: 'تيك توك', Icon: TiktokIcon },
    { href: 'https://www.youtube.com/@iddaat-b5p6o', label: 'يوتيوب', Icon: Youtube },
];

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-content">
                    <h3>سبيل الإضاءات</h3>
                    <p>منصة إسلامية شاملة لنشر العلم والمعرفة</p>
                </div>
                <nav className="footer-social" aria-label="وسائل التواصل الاجتماعي">
                    <ul className="footer-social-list">
                        {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                            <li key={href}>
                                <a
                                    href={href}
                                    className="footer-social-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    title={label}
                                >
                                    <Icon className="footer-social-icon" aria-hidden />
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة لسبيل الإضاءات</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
