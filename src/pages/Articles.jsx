import React, { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, X } from 'lucide-react';
import idaatPdf1 from '../assets/idaat/الإضاءة التاسعة والعشرون أهل القبلة بين الانقسام الداخلي والتآكل الصامت .. من صراع الإيدلوجيات إلى وحدة المقاصد… -.docx.pdf';
import idaatPdf2 from '../assets/idaat/الإضاءة الواحدة والثلاثون أشراطُ الساعة من الملاحمِ والفتن، ونقدِ الواقعِ المضطرب، إلى ضبطِ العلاماتِ وفقهِ الغايات.pdf';
import idaatPdf3 from '../assets/idaat/الإضاءة التاسعة والعشرون أهل القبلة بين الانقسام الداخلي والتآكل الصامت .. من صراع الإيدلوجيات إلى وحدة المقاصد… -.docx (1).pdf';
import idaatPdf4 from '../assets/idaat/الإضاءة الثلاثون الأسري بين قداسة التشريع وانحراف التوظيف - أحكام قتل الأسري.pdf';
import './Articles.css';

const localIdaat = [
    {
        id: 'idaat-29-a',
        title: 'الإضاءة التاسعة والعشرون: أهل القبلة بين الانقسام الداخلي والتآكل الصامت',
        author: 'مشروع إضاءات',
        published_date: '2026-01-01',
        excerpt: 'من صراع الإيدلوجيات إلى وحدة المقاصد.',
        pdf_url: idaatPdf1,
        type: 'pdf',
    },
    {
        id: 'idaat-31',
        title: 'الإضاءة الواحدة والثلاثون: أشراط الساعة من الملاحم والفتن',
        author: 'مشروع إضاءات',
        published_date: '2026-01-02',
        excerpt: 'نقد الواقع المضطرب وضبط العلامات وفقه الغايات.',
        pdf_url: idaatPdf2,
        type: 'pdf',
    },
    {
        id: 'idaat-29-b',
        title: 'الإضاءة التاسعة والعشرون (نسخة إضافية)',
        author: 'مشروع إضاءات',
        published_date: '2026-01-03',
        excerpt: 'نسخة إضافية من ملف الإضاءة التاسعة والعشرين.',
        pdf_url: idaatPdf3,
        type: 'pdf',
    },
    {
        id: 'idaat-30',
        title: 'الإضاءة الثلاثون: الأسرى بين قداسة التشريع وانحراف التوظيف',
        author: 'مشروع إضاءات',
        published_date: '2026-01-04',
        excerpt: 'دراسة في أحكام قتل الأسرى بمنهج شرعي منضبط.',
        pdf_url: idaatPdf4,
        type: 'pdf',
    },
];

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
            if (Array.isArray(data) && data.length > 0) {
                setArticles([...localIdaat, ...data]);
            } else {
                setArticles(localIdaat);
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
            setArticles(localIdaat);
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
                                    <p>{article.excerpt || article.content?.substring(0, 150) + '...'}</p>
                                    {article.type === 'pdf' ? (
                                        <a
                                            href={article.pdf_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="read-more"
                                        >
                                            فتح ملف PDF <ExternalLink size={16} />
                                        </a>
                                    ) : (
                                        <button className="read-more" onClick={() => openArticle(article)}>
                                            اقرأ المزيد <ArrowLeft size={16} />
                                        </button>
                                    )}
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
