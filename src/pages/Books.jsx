import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import bookPdf1 from '../assets/books/سبيل المقتصد إلي فقه أصول المعلوم من الدين بالضرورة.pdf';
import bookPdf2 from '../assets/books/سبيل البيت المسلم إلي معرفة ألمعلوم من الدين بالضرورة.pdf';
import bookPdf3 from '../assets/books/سبيل أهل القرآن والمحراب إلي معرفة بصيرة المعلوم من الدين بالضرورة2.pdf';
import './Books.css';

const localBooks = [
    {
        id: 'local-book-1',
        title: 'سبيل المقتصد إلي فقه أصول المعلوم من الدين بالضرورة',
        author: 'أ/ خالد مصطفى محمود',
        description: 'كتاب في فقه أصول المعلوم من الدين بالضرورة، يقدّم معالجة منهجية واضحة للقضايا الأساسية.',
        pdf_url: bookPdf1,
    },
    {
        id: 'local-book-2',
        title: 'سبيل البيت المسلم إلي معرفة ألمعلوم من الدين بالضرورة',
        author: 'أ/ خالد مصطفى محمود',
        description: 'كتاب موجّه للأسرة المسلمة لبناء معرفة شرعية راسخة في قضايا المعلوم من الدين بالضرورة.',
        pdf_url: bookPdf2,
    },
    {
        id: 'local-book-3',
        title: 'سبيل أهل القرآن والمحراب إلي معرفة بصيرة المعلوم من الدين بالضرورة',
        author: 'أ/ خالد مصطفى محمود',
        description: 'كتاب يركّز على تعميق البصيرة الشرعية لدى أهل القرآن والمحراب بمنهج إصلاحي متوازن.',
        pdf_url: bookPdf3,
    },
];

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
            if (Array.isArray(data) && data.length > 0) {
                setBooks([...localBooks, ...data]);
            } else {
                setBooks(localBooks);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            setBooks(localBooks);
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
