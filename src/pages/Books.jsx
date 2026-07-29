import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import SEO from '../components/SEO';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { CardGridSkeleton } from '../components/Skeleton';
import { categoryLabel } from '../constants/categories';
import './Books.css';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const t = setTimeout(() => { setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search, category]);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ page, limit: 12 });
                if (search) params.set('search', search);
                if (category) params.set('category', category);
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${apiUrl}/books?${params}`, {
                    signal: controller.signal,
                });
                const json = await response.json();
                const rows = Array.isArray(json) ? json : json.data || [];
                setBooks(rows);
                setTotalPages(json.pagination?.totalPages || 1);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error fetching books:', err);
                    setBooks([]);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
        return () => controller.abort();
    }, [page, search, category]);

    return (
        <div className="books-page">
            <SEO
                title="مكتبة الكتب"
                description="مكتبة الكتب الشرعية الإصلاحية في مشروع إضاءات."
                keywords="كتب إسلامية, مكتبة شرعية, كتب pdf, إضاءات"
            />
            <div className="container">
                <div className="section-title">
                    <h1>مكتبة الكتب</h1>
                </div>

                <SearchBar
                    search={search}
                    onSearchChange={setSearch}
                    category={category}
                    onCategoryChange={setCategory}
                    placeholder="ابحث عن كتاب أو مؤلف..."
                />

                {loading ? (
                    <CardGridSkeleton count={6} />
                ) : books.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                        لا توجد كتب مطابقة للبحث
                    </p>
                ) : (
                    <>
                        <div className="books-grid">
                            {books.map((book) => (
                                <div key={book.id} className="book-card">
                                    <div className="book-cover">
                                        {book.cover_url ? (
                                            <img src={book.cover_url} alt={book.title} />
                                        ) : (
                                            <div className="book-cover-placeholder">
                                                <span>PDF</span>
                                                <p>{book.title}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="book-info">
                                        {book.category && (
                                            <span className="category-chip">{categoryLabel(book.category)}</span>
                                        )}
                                        <h3>{book.title}</h3>
                                        <p className="author">{book.author}</p>
                                        <p className="description">{book.description}</p>
                                        <Link
                                            to={`/books/${book.id}`}
                                            className="btn btn-primary full-width"
                                        >
                                            <Info size={18} />
                                            تفاصيل الكتاب
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                    </>
                )}
            </div>
        </div>
    );
};

export default Books;
