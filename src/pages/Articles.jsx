import React, { useEffect, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import './Articles.css';

const Articles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/articles`);
            const data = await response.json();
            setArticles(data);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const openArticle = (article) => {
        setSelectedArticle(article);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeArticle = () => {
        setSelectedArticle(null);
        document.body.style.overflow = 'auto';
    };

    if (loading) {
        return (
            <div className="articles-page">
                <div className="container">
                    <div className="section-title">
                        <h1>الإضاءات</h1>
                    </div>
                    <p style={{ textAlign: 'center', padding: '2rem' }}>جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="articles-page">
            <div className="container">
                <div className="section-title">
                    <h1>الإضاءات</h1>
                </div>

                {articles.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        لا توجد إضاءات متاحة حالياً
                    </p>
                ) : (
                    <div className="articles-list">
                        {articles.map((article) => (
                            <article key={article.id} className="article-card">
                                <div className="article-content">
                                    <h3>{article.title}</h3>
                                    <div className="article-meta">
                                        <span>{new Date(article.published_date).toLocaleDateString('ar-SA')}</span>
                                        <span>•</span>
                                        <span>{article.author}</span>
                                    </div>
                                    <p>{article.excerpt || article.content.substring(0, 150) + '...'}</p>
                                    <button className="read-more" onClick={() => openArticle(article)}>
                                        اقرأ المزيد <ArrowLeft size={16} />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {/* Article Modal */}
            {selectedArticle && (
                <div className="article-modal" onClick={closeArticle}>
                    <div className="article-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={closeArticle}>
                            <X size={24} />
                        </button>
                        <div className="modal-header">
                            <h2>{selectedArticle.title}</h2>
                            <div className="article-meta">
                                <span>{new Date(selectedArticle.published_date).toLocaleDateString('ar-SA')}</span>
                                <span>•</span>
                                <span>{selectedArticle.author}</span>
                            </div>
                        </div>
                        <div className="modal-body">
                            <p style={{ whiteSpace: 'pre-wrap' }}>{selectedArticle.content}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Articles;
