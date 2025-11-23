import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    Video,
    Users,
    Mail,
    LogOut
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const menuItems = [
        { name: 'لوحة التحكم', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'الكتب', path: '/admin/books', icon: BookOpen },
        { name: 'الإضاءات', path: '/admin/articles', icon: FileText },
        { name: 'الفيديوهات', path: '/admin/videos', icon: Video },
        { name: 'الاستشارات', path: '/admin/consultations', icon: Users },
        { name: 'الرسائل', path: '/admin/contacts', icon: Mail },
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>سبيل الإضاءات</h2>
                    <p className="user-name">مرحباً، {user?.username}</p>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
