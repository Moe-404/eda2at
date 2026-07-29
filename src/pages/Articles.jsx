import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import SEO from '../components/SEO';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { CardGridSkeleton } from '../components/Skeleton';
import { categoryLabel } from '../constants/categories';
import './Articles.css';

const Articles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const t = setTimeout(() => setPage(1), 400);
        return () => clearTimeout(t);
    }, [search, category]);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ page, limit: 12, status: 'published' });
                if (search) params.set('search', search);
                if (category) params.set('category', category);
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const res = await fetch(`${apiUrl}/articles?${params}`, {
                    signal: controller.signal,
                });
                const json = await res.json();
                const rows = Array.isArray(json) ? json : json.data || [];
                setArticles(rows);
                setTotalPages(json.pagination?.totalPages || 1);
            } catch (err) {
                if (err.name !== 'AbortError') setArticles([]);
            } finally {
                setLoading(false);
            }
        };
        load();
        return () => controller.abort();
    }, [page, search, category]);

    // Modal functions removed

    return (
        <div className="articles-page">
            <SEO
                title="الإضاءات"
                description="مقالات وإضاءات شرعية إصلاحية تعالج قضايا معاصرة بمنهج علمي منضبط."
                keywords="إضاءات, مقالات إسلامية, فقه, عقيدة, تزكية"
            />
            <div className="container">
                <div className="section-title">
                    <h1>الإضاءات</h1>
                </div>

                <SearchBar
                    search={search}
                    onSearchChange={setSearch}
                    category={category}
                    onCategoryChange={setCategory}
                    placeholder="ابحث في الإضاءات..."
                />

                {loading ? (
                    <CardGridSkeleton count={6} />
                ) : articles.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                        لا توجد إضاءات مطابقة للبحث
                    </p>
                ) : (
                    <>
                        <div className="articles-list">
                            {articles.map((article) => (
                                <article key={article.id} className="article-card">
                                    {article.cover_url && (
                                        <div className="article-cover">
                                            <img src={article.cover_url} alt={article.title} loading="lazy" />
                                        </div>
                                    )}
                                    <div className="article-content">
                                        {article.category && (
                                            <span className="category-chip">{categoryLabel(article.category)}</span>
                                        )}
                                        <h3>{article.title}</h3>
                                        <div className="article-meta">
                                            {article.published_date && (
                                                <span>
                                                    <Calendar size={14} />{' '}
                                                    {new Date(article.published_date).toLocaleDateString('ar-EG')}
                                                </span>
                                            )}
                                            {article.author && (
                                                <span>
                                                    <User size={14} /> {article.author}
                                                </span>
                                            )}
                                        </div>
                                        <p>{article.excerpt || article.content?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}</p>
                                        <Link to={`/articles/${article.id}`} className="read-more">
                                            تفاصيل المقال <ArrowLeft size={16} />
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                    </>
                )}
            </div>
        </div>
    );
};

export default Articles;
