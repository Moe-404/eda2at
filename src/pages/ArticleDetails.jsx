import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Star, Calendar, User, Award, Eye, ShieldAlert, Send } from 'lucide-react';
import SEO from '../components/SEO';
import { categoryLabel } from '../constants/categories';
import './ArticleDetails.css';

const ArticleDetails = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Interactive ratings & reviews states (mocked with localStorage fallback for persistent feel)
    const [userRating, setUserRating] = useState(0);
    const [ratingCount, setRatingCount] = useState(85);
    const [ratingAvg, setRatingAvg] = useState(4.7);
    const [ratingsDistribution, setRatingsDistribution] = useState({
        5: 62,
        4: 15,
        3: 5,
        2: 2,
        1: 1
    });

    const [comments, setComments] = useState([
        { id: 1, name: 'أحمد صالح', comment: 'طرح علمي رصين وموفق جداً، جزاكم الله خيراً على هذا التوضيح.', date: '2026-06-12', rating: 5 },
        { id: 2, name: 'أسماء محمود', comment: 'مقال ممتاز يمس قضايا واقعية بأسلوب سهل ومنضبط.', date: '2026-06-19', rating: 5 }
    ]);
    const [newCommentName, setNewCommentName] = useState('');
    const [newCommentText, setNewCommentText] = useState('');
    const [newCommentRating, setNewCommentRating] = useState(5);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchArticleDetails = async () => {
            try {
                const response = await fetch(`${apiUrl}/articles/${id}`);
                if (!response.ok) {
                    throw new Error('المقال غير موجود');
                }
                const data = await response.json();
                setArticle(data);

                // LocalStorage loading for ratings & reviews
                const savedRating = localStorage.getItem(`article-rating-${id}`);
                if (savedRating) {
                    setUserRating(parseInt(savedRating, 10));
                }

                const savedComments = localStorage.getItem(`article-comments-${id}`);
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

        fetchArticleDetails();
    }, [id, apiUrl]);

    const handleRate = (rating) => {
        if (userRating > 0) return;
        
        setUserRating(rating);
        localStorage.setItem(`article-rating-${id}`, rating.toString());

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
        localStorage.setItem(`article-comments-${id}`, JSON.stringify(updatedComments));

        if (userRating === 0) {
            handleRate(newCommentRating);
        }

        setNewCommentName('');
        setNewCommentText('');
    };

    if (loading) {
        return (
            <div className="article-details-loading">
                <div className="spinner"></div>
                <p>جاري تحميل المقال...</p>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="container article-details-error">
                <ShieldAlert size={64} className="error-icon" />
                <h2>عذراً، لم نتمكن من العثور على هذا المقال</h2>
                <p>{error || 'يرجى التأكد من الرابط الصحيح.'}</p>
                <Link to="/articles" className="btn btn-primary">
                    <ArrowRight size={18} /> العودة للإضاءات
                </Link>
            </div>
        );
    }

    return (
        <div className="article-details-page">
            <SEO
                title={`${article.title} | إضاءات`}
                description={article.excerpt || `اقرأ مقال ${article.title} للكاتب ${article.author}`}
            />
            <div className="container">
                {/* Back Button */}
                <div className="back-nav">
                    <Link to="/articles" className="back-link">
                        <ArrowRight size={20} />
                        العودة إلى الإضاءات
                    </Link>
                </div>

                <article className="article-main-container">
                    {/* Header */}
                    <div className="article-detail-header">
                        <span className="details-category-chip">
                            {article.category ? categoryLabel(article.category) : 'عام'}
                        </span>
                        <h1>{article.title}</h1>

                        <div className="article-meta-row">
                            {article.author && (
                                <div className="meta-item">
                                    <User size={16} />
                                    <span>المؤلف: {article.author}</span>
                                </div>
                            )}
                            {article.published_date && (
                                <div className="meta-item">
                                    <Calendar size={16} />
                                    <span>نشر بتاريخ: {new Date(article.published_date).toLocaleDateString('ar-EG')}</span>
                                </div>
                            )}
                            {article.category && (
                                <div className="meta-item">
                                    <Award size={16} />
                                    <span>التصنيف: {categoryLabel(article.category)}</span>
                                </div>
                            )}
                        </div>

                        {/* Ratings overview */}
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

                    {/* Prominent Cover Image */}
                    {article.cover_url && (
                        <div className="article-details-cover">
                            <img src={article.cover_url} alt={article.title} />
                        </div>
                    )}

                    {/* Excerpt if exists */}
                    {article.excerpt && (
                        <div className="article-excerpt-box">
                            <p>{article.excerpt}</p>
                        </div>
                    )}

                    {/* Article Full Rich Content */}
                    <div 
                        className="article-rich-content" 
                        dangerouslySetInnerHTML={{ __html: article.content || '' }}
                    />
                </article>

                {/* Reviews & Comments Section */}
                <div className="article-reviews-section">
                    <div className="section-header">
                        <h2>تقييم ومراجعة المقال</h2>
                    </div>

                    <div className="reviews-layout">
                        {/* Rating Stats Summary */}
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
                                <span className="total-raters">{ratingCount.toLocaleString('ar-EG')} تقييم</span>
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
                                <h4>ما تقييمك لهذا المقال؟</h4>
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

                        {/* Comments Block */}
                        <div className="comments-block">
                            <div className="add-comment-card">
                                <h3>شاركنا برأيك حول المقال</h3>
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
                                                <option value="1">نجمة واحدة - سيء</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group-2">
                                        <label>التعليق *</label>
                                        <textarea 
                                            rows="3" 
                                            value={newCommentText}
                                            onChange={(e) => setNewCommentText(e.target.value)}
                                            required 
                                            placeholder="اكتب تعليقك أو وجهة نظرك هنا..."
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-accent btn-submit-comment">
                                        <Send size={16} />
                                        نشر التعليق
                                    </button>
                                </form>
                            </div>

                            <div className="comments-list">
                                <h3>تعليقات ومناقشات القراء ({comments.length})</h3>
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

export default ArticleDetails;
