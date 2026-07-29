import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, ArrowLeft, FileText, Play, Calendar, User, ChevronLeft } from 'lucide-react';
import heroBg from '../assets/hero section.png';
import SEO from '../components/SEO';
import { CardGridSkeleton } from '../components/Skeleton';
import { categoryLabel } from '../constants/categories';
import ShareButtons from '../components/ShareButtons';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [latestBooks, setLatestBooks] = useState([]);
    const [latestArticles, setLatestArticles] = useState([]);
    const [latestVideos, setLatestVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);

    useEffect(() => {
        const fetchLatestData = async () => {
            setLoading(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                
                const [booksRes, articlesRes, videosRes] = await Promise.all([
                    fetch(`${apiUrl}/books?page=1&limit=4`).catch(() => null),
                    fetch(`${apiUrl}/articles?page=1&limit=4&status=published`).catch(() => null),
                    fetch(`${apiUrl}/videos?page=1&limit=4`).catch(() => null)
                ]);

                const booksData = booksRes ? await booksRes.json() : [];
                const articlesData = articlesRes ? await articlesRes.json() : [];
                const videosData = videosRes ? await videosRes.json() : [];

                setLatestBooks(Array.isArray(booksData) ? booksData : booksData.data || []);
                setLatestArticles(Array.isArray(articlesData) ? articlesData : articlesData.data || []);
                setLatestVideos(Array.isArray(videosData) ? videosData : videosData.data || []);
            } catch (error) {
                console.error("Error fetching homepage data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestData();
    }, []);

    const closeModal = () => setSelectedVideo(null);

    return (
        <div className="home-page">
            <SEO
                description="إضاءات - مشروع شرعي إصلاحي يقدّم كتباً ومقالات وفيديوهات علمية منضبطة، تجمع بين التأصيل الراسخ وفهم الواقع ومعالجة قضاياه المعاصرة."
                keywords="إضاءات, إسلام, شريعة, فقه, تفسير, مقاصد, إصلاح, أسرة, تزكية"
            />

            {/* Hero Section */}
            <section className="hero">
                <img
                    src={heroBg}
                    alt="خلفية سبيل الإضاءات"
                    className="hero-bg-image"
                />
                <div className="hero-overlay" aria-hidden />
                <div className="hero-content container">
                    <div className="hero-right-panel">
                        <span className="hero-badge">مرحباً بك في</span>
                        <h1>سبيل إضاءات</h1>
                        <p className="hero-subtitle">
                            مشروع شرعي إصلاحي يهدف لتقديم مادة علمية منضبطة تجمع بين تأصيل الشريعة وفهم قضايا الواقع المعاصر لبناء وعي متكامل.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/books" className="btn btn-primary">
                                <BookOpen size={20} />
                                تصفح المكتبة
                            </Link>
                            <Link to="/articles" className="btn btn-accent">
                                <FileText size={20} />
                                إضاءات ومقالات
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="hero-wave">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
                    </svg>
                </div>
            </section>

            {/* Features Quick Links */}
            <section className="features-section">
                <div className="container">
                    <div className="features-grid">
                        <Link to="/articles" className="feature-card">
                            <div className="feature-icon-wrapper">
                                <FileText size={32} className="feature-icon" />
                            </div>
                            <h3>الإضاءات</h3>
                            <p>مقالات وإضاءات شهرية منضبطة</p>
                        </Link>
                        <Link to="/books" className="feature-card">
                            <div className="feature-icon-wrapper">
                                <BookOpen size={32} className="feature-icon" />
                            </div>
                            <h3>المكتبة العلمية</h3>
                            <p>إصدارات ومؤلفات قيمة</p>
                        </Link>
                        <Link to="/videos" className="feature-card">
                            <div className="feature-icon-wrapper">
                                <Play size={32} className="feature-icon" />
                            </div>
                            <h3>المرئيات</h3>
                            <p>دروس ومقاطع دعوية هادفة</p>
                        </Link>
                        <Link to="/consultations" className="feature-card">
                            <div className="feature-icon-wrapper">
                                <Users size={32} className="feature-icon" />
                            </div>
                            <h3>الاستشارات</h3>
                            <p>استشارات أسرية وطبية</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Intro Section */}
            <section className="home-intro">
                <div className="container home-intro-inner">
                    <span className="home-intro-eyebrow">عن المشروع</span>
                    <h2>رؤيةٌ شرعيةٌ إصلاحية</h2>
                    <p className="home-intro-lead">
                        نقدّم في <strong>"إضاءات"</strong> خطاباً علمياً شرعياً إصلاحياً يجمع بين
                        التأصيل الراسخ، وفهم الواقع، ومعالجة قضاياه بمنهجٍ وسطٍ منضبط،
                        يستند إلى فقه المقاصد ومراعاة المآلات.
                    </p>
                    <figure className="scripture scripture-ayah home-ayah">
                        <span className="scripture-badge">قال الله تعالى</span>
                        <blockquote>﴿إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ﴾</blockquote>
                        <figcaption>[الإسراء: 9]</figcaption>
                    </figure>
                    <div className="home-intro-cta">
                        <Link to="/about" className="btn btn-outline">
                            اكتشف المزيد عنا
                            <ArrowLeft size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Latest Content Sections */}
            {loading ? (
                <div className="container" style={{ padding: '4rem 0' }}>
                    <CardGridSkeleton count={4} />
                    <div style={{ marginTop: '4rem' }}>
                        <CardGridSkeleton count={4} />
                    </div>
                </div>
            ) : (
                <div className="latest-content-wrapper">
                    
                    {/* Latest Articles / Illuminations */}
                    {latestArticles.length > 0 && (
                        <section className="latest-section latest-articles bg-light">
                            <div className="container">
                                <div className="tabs-container">
                                    <button className="tab-button active">
                                        <FileText size={24} />
                                        <span>أحدث الإضاءات</span>
                                    </button>
                                    <button className="tab-button">
                                        <BookOpen size={24} />
                                        <span>الأكثر قراءة</span>
                                    </button>
                                    <button className="tab-button">
                                        <Users size={24} />
                                        <span>ترشيحاتنا</span>
                                    </button>
                                </div>
                                <div className="cards-grid-v2">
                                    {latestArticles.map((article) => (
                                        <div key={article.id} className="card-v2" onClick={() => navigate(`/articles/${article.id}`)}>
                                            <div className="card-v2-header">
                                                <span className="rating-count">(124)</span>
                                                <div className="stars">
                                                    <span>★</span><span>★</span><span>★</span><span>★</span><span className="half-star">★</span>
                                                </div>
                                            </div>
                                            <div className="card-v2-cover-wrapper">
                                                {article.cover_url ? (
                                                    <img src={article.cover_url} alt={article.title} className="card-v2-cover" />
                                                ) : (
                                                    <div className="card-v2-cover placeholder">مقالة</div>
                                                )}
                                                <div className="card-v2-avatar">
                                                    <User size={20} />
                                                </div>
                                            </div>
                                            <div className="card-v2-body">
                                                <h3 title={article.title}>{article.title}</h3>
                                                <p className="card-v2-author">{article.author || 'إضاءات'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="view-more-container">
                                    <Link to="/articles" className="view-more-btn">تصفح كل الإضاءات</Link>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Latest Books */}
                    {latestBooks.length > 0 && (
                        <section className="latest-section latest-books bg-light">
                            <div className="container">
                                <div className="tabs-container">
                                    <button className="tab-button">
                                        <BookOpen size={24} />
                                        <span>الأشهر اليوم</span>
                                    </button>
                                    <button className="tab-button">
                                        <BookOpen size={24} />
                                        <span>أشهر الكتب</span>
                                    </button>
                                    <button className="tab-button active">
                                        <BookOpen size={24} />
                                        <span>أحدث الكتب</span>
                                    </button>
                                </div>
                                <div className="cards-grid-v2">
                                    {latestBooks.map((book) => (
                                        <div key={book.id} className="card-v2" onClick={() => navigate(`/books/${book.id}`)}>
                                            <div className="card-v2-header">
                                                <span className="rating-count">(358)</span>
                                                <div className="stars">
                                                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                                                </div>
                                            </div>
                                            <div className="card-v2-cover-wrapper">
                                                {book.cover_url ? (
                                                    <img src={book.cover_url} alt={book.title} className="card-v2-cover" />
                                                ) : (
                                                    <div className="card-v2-cover placeholder">PDF</div>
                                                )}
                                                <div className="card-v2-avatar">
                                                    <User size={20} />
                                                </div>
                                            </div>
                                            <div className="card-v2-body">
                                                <h3 title={book.title}>{book.title}</h3>
                                                <p className="card-v2-author">{book.author || 'غير معروف'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="view-more-container">
                                    <Link to="/books" className="view-more-btn">تصفح المكتبة كاملة</Link>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Latest Videos */}
                    {latestVideos.length > 0 && (
                        <section className="latest-section latest-videos">
                            <div className="container">
                                <div className="section-header">
                                    <div className="section-title-wrap">
                                        <span className="section-subtitle">المرئيات</span>
                                        <h2>أحدث الفيديوهات العلمية</h2>
                                    </div>
                                    <Link to="/videos" className="view-all-link">
                                        عرض المزيد <ChevronLeft size={20} />
                                    </Link>
                                </div>
                                <div className="videos-grid custom-grid-4">
                                    {latestVideos.map((video) => (
                                        <div key={video.id} className="video-card modern-video-card" onClick={() => setSelectedVideo(video)}>
                                            <div className="video-thumbnail">
                                                {video.thumbnail_url ? (
                                                    <img src={video.thumbnail_url} alt={video.title} />
                                                ) : video.youtube_id ? (
                                                    <img src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} alt={video.title} />
                                                ) : (
                                                    <div className="video-thumbnail-placeholder">
                                                        <span>VIDEO</span>
                                                        <p>{video.title}</p>
                                                    </div>
                                                )}
                                                <div className="play-button">
                                                    <Play size={32} fill="currentColor" />
                                                </div>
                                                {video.duration && <span className="duration">{video.duration}</span>}
                                            </div>
                                            <div className="video-info">
                                                {video.category && (
                                                    <span className="category-chip">{categoryLabel(video.category)}</span>
                                                )}
                                                <h3 title={video.title}>{video.title}</h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            )}

            {/* Video Modal */}
            {selectedVideo && (
                <div className="video-modal" onClick={closeModal}>
                    <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={closeModal}>×</button>
                        {selectedVideo.video_url ? (
                            <video
                                width="100%"
                                height="100%"
                                controls
                                autoPlay
                                src={selectedVideo.video_url}
                                title={selectedVideo.title}
                            />
                        ) : (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=1`}
                                title={selectedVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )}
                        <div className="video-modal-footer">
                            <h3 className="modal-video-title">{selectedVideo.title}</h3>
                            <ShareButtons
                                title={selectedVideo.title}
                                url={selectedVideo.youtube_id ? `https://youtu.be/${selectedVideo.youtube_id}` : undefined}
                                compact
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;

