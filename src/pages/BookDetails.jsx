import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Download, Star, Award, Book, Globe, User, ShieldAlert, Calendar, MessageSquare, Send } from 'lucide-react';
import SEO from '../components/SEO';
import { categoryLabel } from '../constants/categories';
import './BookDetails.css';

const BookDetails = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Interactive ratings & reviews states (mocked with localStorage fallback for persistent feel)
    const [userRating, setUserRating] = useState(0);
    const [ratingCount, setRatingCount] = useState(148);
    const [ratingAvg, setRatingAvg] = useState(4.8);
    const [ratingsDistribution, setRatingsDistribution] = useState({
        5: 110,
        4: 25,
        3: 8,
        2: 3,
        1: 2
    });

    const [comments, setComments] = useState([
        { id: 1, name: 'أحمد علي', comment: 'كتاب قيم جداً ومجهود مبارك، يجمع بين التأصيل الشرعي وفهم قضايا الواقع المعاصر.', date: '2026-05-10', rating: 5 },
        { id: 2, name: 'سارة خالد', comment: 'طريقة الطرح مبسطة وعميقة في نفس الوقت. أنصح بشدة بقراءته.', date: '2026-06-02', rating: 5 },
        { id: 3, name: 'محمد أنور', comment: 'جزى الله الكاتب والقائمين على هذا المشروع خير الجزاء.', date: '2026-06-18', rating: 4 }
    ]);
    const [newCommentName, setNewCommentName] = useState('');
    const [newCommentText, setNewCommentText] = useState('');
    const [newCommentRating, setNewCommentRating] = useState(5);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const response = await fetch(`${apiUrl}/books/${id}`);
                if (!response.ok) {
                    throw new Error('كتاب غير موجود');
                }
                const data = await response.json();
                setBook(data);
                
                // Initialize ratings from DB or defaults
                if (data.rating_count) {
                    setRatingCount(data.rating_count);
                }
                if (data.rating_avg) {
                    setRatingAvg(parseFloat(data.rating_avg));
                }
                
                // LocalStorage loading for ratings & reviews
                const savedRating = localStorage.getItem(`book-rating-${id}`);
                if (savedRating) {
                    setUserRating(parseInt(savedRating, 10));
                }

                const savedComments = localStorage.getItem(`book-comments-${id}`);
                if (savedComments) {
                    setComments(JSON.parse(savedComments));
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetails();
    }, [id, apiUrl]);

    const handleRead = async () => {
        if (!book?.pdf_url) return;
        window.open(book.pdf_url, '_blank', 'noopener,noreferrer');

        try {
            const res = await fetch(`${apiUrl}/books/${id}/read`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setBook(prev => prev ? { ...prev, reading_count: data.reading_count } : null);
            }
        } catch (err) {
            console.error('Failed to increment read count', err);
        }
    };

    const handleDownload = async () => {
        if (!book?.pdf_url) return;
        
        // Trigger file download
        const link = document.createElement('a');
        link.href = book.pdf_url;
        link.setAttribute('download', `${book.title}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        try {
            const res = await fetch(`${apiUrl}/books/${id}/download`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setBook(prev => prev ? { ...prev, download_count: data.download_count } : null);
            }
        } catch (err) {
            console.error('Failed to increment download count', err);
        }
    };

    const handleRate = (rating) => {
        if (userRating > 0) return; // Allow rating only once in this session for simplicity
        
        setUserRating(rating);
        localStorage.setItem(`book-rating-${id}`, rating.toString());

        // Recalculate stats
        const newCount = ratingCount + 1;
        const newDist = { ...ratingsDistribution, [rating]: ratingsDistribution[rating] + 1 };
        const totalScore = (
            newDist[5] * 5 +
            newDist[4] * 4 +
            newDist[3] * 3 +
            newDist[2] * 2 +
            newDist[1] * 1
        );
        const newAvg = parseFloat((totalScore / newCount).toFixed(1));

        setRatingCount(newCount);
        setRatingAvg(newAvg);
        setRatingsDistribution(newDist);
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!newCommentName.trim() || !newCommentText.trim()) return;

        const newComment = {
            id: Date.now(),
            name: newCommentName,
            comment: newCommentText,
            date: new Date().toISOString().split('T')[0],
            rating: newCommentRating
        };

        const updatedComments = [newComment, ...comments];
        setComments(updatedComments);
        localStorage.setItem(`book-comments-${id}`, JSON.stringify(updatedComments));

        // Submit rating if user hasn't rated yet
        if (userRating === 0) {
            handleRate(newCommentRating);
        }

        setNewCommentName('');
        setNewCommentText('');
    };

    if (loading) {
        return (
            <div className="book-details-loading">
                <div className="spinner"></div>
                <p>جاري تحميل تفاصيل الكتاب...</p>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="container book-details-error">
                <ShieldAlert size={64} className="error-icon" />
                <h2>عذراً، لم نتمكن من العثور على هذا الكتاب</h2>
                <p>{error || 'يرجى التأكد من الرابط الصحيح.'}</p>
                <Link to="/books" className="btn btn-primary">
                    <ArrowRight size={18} /> العودة للمكتبة
                </Link>
            </div>
        );
    }

    const ratingPercentage = Math.round((ratingAvg / 5) * 100);

    return (
        <div className="book-details-page">
            <SEO
                title={`${book.title} | مكتبة إضاءات`}
                description={book.description || `تصفح وحمل كتاب ${book.title} من تأليف ${book.author}`}
            />
            <div className="container">
                {/* Back Button */}
                <div className="back-nav">
                    <Link to="/books" className="back-link">
                        <ArrowRight size={20} />
                        العودة إلى مكتبة الكتب
                    </Link>
                </div>

                <div className="book-main-section">
                    {/* Right side: Cover & Circles */}
                    <div className="book-visual-column">
                        <div className="book-details-cover">
                            {book.cover_url ? (
                                <img src={book.cover_url} alt={book.title} />
                            ) : (
                                <div className="details-cover-placeholder">
                                    <Book size={64} />
                                    <span>PDF</span>
                                    <p>{book.title}</p>
                                </div>
                            )}
                        </div>

                        {/* Visual Action Circles */}
                        <div className="action-circles">
                            <div className="circle-item" onClick={handleRead} title="قراءة الكتاب الآن">
                                <div className="circle-icon read">
                                    <BookOpen size={24} />
                                </div>
                                <span className="circle-label">قراءة</span>
                                <span className="circle-val">{(book.reading_count || 0).toLocaleString('ar-EG')}</span>
                            </div>

                            <div className="circle-item" onClick={handleDownload} title="تحميل ملف الكتاب PDF">
                                <div className="circle-icon download">
                                    <Download size={24} />
                                </div>
                                <span className="circle-label">تحميل</span>
                                <span className="circle-val">{(book.download_count || 0).toLocaleString('ar-EG')}</span>
                            </div>

                            <div className="circle-item">
                                <div className="circle-icon pages">
                                    <Book size={24} />
                                </div>
                                <span className="circle-label">الصفحات</span>
                                <span className="circle-val">{book.pages ? book.pages.toLocaleString('ar-EG') : '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Left side: Metadata & Title & Description */}
                    <div className="book-content-column">
                        <div className="book-header-info">
                            <span className="details-category-chip">
                                {book.category ? categoryLabel(book.category) : 'عام'}
                            </span>
                            <h1>{book.title}</h1>
                            
                            {/* Stars Rating Overview */}
                            <div className="rating-overview">
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star 
                                            key={star} 
                                            size={18} 
                                            fill={star <= Math.round(ratingAvg) ? 'var(--color-accent)' : 'none'}
                                            color={star <= Math.round(ratingAvg) ? 'var(--color-accent)' : '#ccc'}
                                        />
                                    ))}
                                </div>
                                <span className="rating-avg-text">{ratingAvg.toLocaleString('ar-EG')} من ٥</span>
                                <span className="rating-count-text">({ratingCount.toLocaleString('ar-EG')} تقييم)</span>
                            </div>
                        </div>

                        {/* Metadata Table */}
                        <div className="metadata-card">
                            <h3>بطاقة الكتاب</h3>
                            <div className="metadata-grid">
                                <div className="meta-item">
                                    <User size={16} />
                                    <strong>المؤلف:</strong>
                                    <span>{book.author}</span>
                                </div>
                                <div className="meta-item">
                                    <Award size={16} />
                                    <strong>القسم:</strong>
                                    <span>{book.category ? categoryLabel(book.category) : 'عام'}</span>
                                </div>
                                <div className="meta-item">
                                    <Globe size={16} />
                                    <strong>اللغة:</strong>
                                    <span>{book.language || 'العربية'}</span>
                                </div>
                                <div className="meta-item">
                                    <Book size={16} />
                                    <strong>عدد الصفحات:</strong>
                                    <span>{book.pages ? `${book.pages} صفحة` : 'غير محدد'}</span>
                                </div>
                                <div className="meta-item">
                                    <Calendar size={16} />
                                    <strong>تاريخ النشر:</strong>
                                    <span>{new Date(book.created_at).toLocaleDateString('ar-EG')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description / Synopsys */}
                        <div className="book-description-section">
                            <h2>وصف الكتاب</h2>
                            <p>{book.description || 'لا يوجد وصف متاح لهذا الكتاب حالياً.'}</p>
                        </div>
                    </div>
                </div>

                {/* Reviews & Comments Section */}
                <div className="book-reviews-section">
                    <div className="section-header">
                        <h2>تقييمات ومراجعات القراء</h2>
                    </div>

                    <div className="reviews-layout">
                        {/* Rating Stats Breakdown */}
                        <div className="reviews-summary-card">
                            <div className="rating-score-box">
                                <span className="big-score">{ratingAvg.toLocaleString('ar-EG')}</span>
                                <span className="out-of">من ٥</span>
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star 
                                            key={star} 
                                            size={20} 
                                            fill={star <= Math.round(ratingAvg) ? 'var(--color-accent)' : 'none'}
                                            color={star <= Math.round(ratingAvg) ? 'var(--color-accent)' : '#ccc'}
                                        />
                                    ))}
                                </div>
                                <span className="total-raters">{ratingCount.toLocaleString('ar-EG')} تقييم من القراء</span>
                            </div>

                            {/* Progress Bars */}
                            <div className="rating-bars">
                                {[5, 4, 3, 2, 1].map(stars => {
                                    const count = ratingsDistribution[stars] || 0;
                                    const percent = ratingCount > 0 ? Math.round((count / ratingCount) * 100) : 0;
                                    return (
                                        <div key={stars} className="rating-bar-row">
                                            <span className="star-num">{stars.toLocaleString('ar-EG')} نجوم</span>
                                            <div className="bar-wrapper">
                                                <div className="bar" style={{ width: `${percent}%` }}></div>
                                            </div>
                                            <span className="bar-percentage">{percent.toLocaleString('ar-EG')}%</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* User Rating Action */}
                            <div className="user-rate-action">
                                <h4>قيّم هذا الكتاب:</h4>
                                <div className="interactive-stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button 
                                            key={star} 
                                            type="button"
                                            onClick={() => handleRate(star)}
                                            disabled={userRating > 0}
                                            className={`star-btn ${star <= userRating ? 'active' : ''}`}
                                        >
                                            <Star 
                                                size={28} 
                                                fill={star <= (userRating) ? 'var(--color-accent)' : 'none'}
                                                color={star <= (userRating) ? 'var(--color-accent)' : '#ccc'}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {userRating > 0 && <p className="thank-you-msg">نشكرك على تقييمك!</p>}
                            </div>
                        </div>

                        {/* Review Comments list and Form */}
                        <div className="comments-block">
                            <div className="add-comment-card">
                                <h3>أضف مراجعتك للكتاب</h3>
                                <form onSubmit={handleAddComment}>
                                    <div className="form-row-2">
                                        <div className="form-group-2">
                                            <label>الاسم *</label>
                                            <input 
                                                type="text" 
                                                value={newCommentName}
                                                onChange={(e) => setNewCommentName(e.target.value)}
                                                required 
                                                placeholder="اكتب اسمك"
                                            />
                                        </div>
                                        <div className="form-group-2">
                                            <label>التقييم *</label>
                                            <select 
                                                value={newCommentRating} 
                                                onChange={(e) => setNewCommentRating(parseInt(e.target.value))}
                                            >
                                                <option value="5">٥ نجوم - ممتاز</option>
                                                <option value="4">٤ نجوم - جيد جداً</option>
                                                <option value="3">٣ نجوم - مقبول</option>
                                                <option value="2">نجامتان - ضعيف</option>
                                                <option value="1">نجمة واحدة - سيء جداً</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group-2">
                                        <label>المراجعة / التعليق *</label>
                                        <textarea 
                                            rows="3" 
                                            value={newCommentText}
                                            onChange={(e) => setNewCommentText(e.target.value)}
                                            required 
                                            placeholder="اكتب رأيك أو مراجعتك الشخصية للكتاب هنا..."
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-accent btn-submit-comment">
                                        <Send size={16} />
                                        نشر المراجعة
                                    </button>
                                </form>
                            </div>

                            <div className="comments-list">
                                <h3>مراجعات القراء ({comments.length})</h3>
                                {comments.map(c => (
                                    <div key={c.id} className="comment-card">
                                        <div className="comment-header">
                                            <span className="comment-author">{c.name}</span>
                                            <div className="comment-meta-info">
                                                <span className="comment-date">{c.date}</span>
                                                <div className="comment-stars">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star 
                                                            key={star} 
                                                            size={12} 
                                                            fill={star <= c.rating ? 'var(--color-accent)' : 'none'}
                                                            color={star <= c.rating ? 'var(--color-accent)' : '#ccc'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="comment-text">{c.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;
