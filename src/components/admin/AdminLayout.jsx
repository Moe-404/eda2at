import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    Video,
    Users,
    Mail,
    LogOut,
    UserSquare2,
    Menu,
    X,
} from 'lucide-react';
import './AdminLayout.css';

const menuItems = [
    { name: 'لوحة التحكم', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'الكتب', path: '/admin/books', icon: BookOpen },
    { name: 'الإضاءات', path: '/admin/articles', icon: FileText },
    { name: 'الفيديوهات', path: '/admin/videos', icon: Video },
    { name: 'الاستشارات', path: '/admin/consultations', icon: Users },
    { name: 'الرسائل', path: '/admin/contacts', icon: Mail },
    { name: 'فريق العمل', path: '/admin/team', icon: UserSquare2 },
];

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="admin-layout">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar} aria-hidden />
            )}

            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
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
                                onClick={closeSidebar}
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
                <button
                    className="mobile-sidebar-btn"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="فتح القائمة"
                >
                    <Menu size={22} />
                </button>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
