import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { BookOpen, FileText, Video, Users, Mail, Clock } from 'lucide-react';
import { Skeleton } from '../../components/Skeleton';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        books: 0,
        articles: 0,
        videos: 0,
        consultations: 0,
        consultationsPending: 0,
        contacts: 0,
        contactsNew: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [books, articles, videos, consultations, contacts] = await Promise.all([
                api.get('/books?limit=1'),
                api.get('/articles?limit=1'),
                api.get('/videos?limit=1'),
                api.get('/consultations'),
                api.get('/contact'),
            ]);

            const totalFrom = (res) =>
                typeof res.data?.pagination?.total === 'number'
                    ? res.data.pagination.total
                    : Array.isArray(res.data)
                        ? res.data.length
                        : Array.isArray(res.data?.data)
                            ? res.data.data.length
                            : 0;

            const consultationsList = Array.isArray(consultations.data)
                ? consultations.data
                : consultations.data?.data || [];
            const contactsList = Array.isArray(contacts.data)
                ? contacts.data
                : contacts.data?.data || [];

            setStats({
                books: totalFrom(books),
                articles: totalFrom(articles),
                videos: totalFrom(videos),
                consultations: consultationsList.length,
                consultationsPending: consultationsList.filter((c) => c.status === 'pending').length,
                contacts: contactsList.length,
                contactsNew: contactsList.filter((c) => c.status === 'new').length,
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
        {
            title: 'الاستشارات',
            value: stats.consultations,
            icon: Users,
            color: '#7c3aed',
            badge: stats.consultationsPending > 0 ? `${stats.consultationsPending} قيد الانتظار` : null,
        },
        {
            title: 'الرسائل',
            value: stats.contacts,
            icon: Mail,
            color: '#dc2626',
            badge: stats.contactsNew > 0 ? `${stats.contactsNew} جديدة` : null,
        },
    ];

    return (
        <div>
            <div className="admin-header">
                <h1>لوحة التحكم</h1>
                <p>إحصائيات عامة عن المحتوى</p>
            </div>

            <div className="stats-grid">
                {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="stat-card">
                            <Skeleton width={64} height={64} radius="12px" />
                            <div style={{ flex: 1, display: 'grid', gap: 8 }}>
                                <Skeleton width="60%" height="1rem" />
                                <Skeleton width="30%" height="1.6rem" />
                            </div>
                        </div>
                    ))
                    : statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.title} className="stat-card">
                                <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                                    <Icon size={32} color="white" />
                                </div>
                                <div className="stat-info">
                                    <h3>{stat.title}</h3>
                                    <p className="stat-value">{stat.value}</p>
                                    {stat.badge && (
                                        <span className="stat-badge">
                                            <Clock size={12} /> {stat.badge}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default AdminDashboard;
