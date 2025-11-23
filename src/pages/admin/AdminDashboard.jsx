import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { BookOpen, FileText, Video, Users, Mail } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        books: 0,
        articles: 0,
        videos: 0,
        consultations: 0,
        contacts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [books, articles, videos, consultations, contacts] = await Promise.all([
                api.get('/books'),
                api.get('/articles'),
                api.get('/videos'),
                api.get('/consultations'),
                api.get('/contact')
            ]);

            setStats({
                books: books.data.length,
                articles: articles.data.length,
                videos: videos.data.length,
                consultations: consultations.data.length,
                contacts: contacts.data.length
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { title: 'الكتب', value: stats.books, icon: BookOpen, color: '#044d29' },
        { title: 'الإضاءات', value: stats.articles, icon: FileText, color: '#c5a059' },
        { title: 'الفيديوهات', value: stats.videos, icon: Video, color: '#1f2937' },
        { title: 'الاستشارات', value: stats.consultations, icon: Users, color: '#7c3aed' },
        { title: 'الرسائل', value: stats.contacts, icon: Mail, color: '#dc2626' },
    ];

    if (loading) {
        return <div className="admin-header"><p>جاري التحميل...</p></div>;
    }

    return (
        <div>
            <div className="admin-header">
                <h1>لوحة التحكم</h1>
                <p>إحصائيات عامة عن المحتوى</p>
            </div>

            <div className="stats-grid">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.title} className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                                <Icon size={32} color="white" />
                            </div>
                            <div className="stat-info">
                                <h3>{stat.title}</h3>
                                <p className="stat-value">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminDashboard;
