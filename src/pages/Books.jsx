import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import './Books.css';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/books`);
            const data = await response.json();
            setBooks(data);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="books-page">
                <div className="container">
                    <div className="section-title">
                        <h1>مكتبة الكتب</h1>
                    </div>
                    <p style={{ textAlign: 'center', padding: '2rem' }}>جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="books-page">
            <div className="container">
                <div className="section-title">
                    <h1>مكتبة الكتب</h1>
                </div>

                {books.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        لا توجد كتب متاحة حالياً
                    </p>
                ) : (
                    <div className="books-grid">
                        {books.map((book) => (
                            <div key={book.id} className="book-card">
                                <div className="book-cover">
                                    <img src={book.cover_url} alt={book.title} />
                                </div>
                                <div className="book-info">
                                    <h3>{book.title}</h3>
                                    <p className="author">{book.author}</p>
                                    <p className="description">{book.description}</p>
                                    <a href={book.pdf_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary full-width">
                                        <Download size={18} />
                                        تحميل الكتاب (PDF)
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Books;
