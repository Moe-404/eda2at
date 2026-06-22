import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Video, Users, ArrowLeft } from 'lucide-react';
import heroBanner from '../assets/سبيل اضاءات.jpeg';
import SEO from '../components/SEO';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page">
            <SEO
                description="إضاءات - مشروع شرعي إصلاحي يقدّم كتباً ومقالات وفيديوهات علمية منضبطة، تجمع بين التأصيل الراسخ وفهم الواقع ومعالجة قضاياه المعاصرة."
                keywords="إضاءات, إسلام, شريعة, فقه, تفسير, مقاصد, إصلاح, أسرة, تزكية"
            />

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay" aria-hidden />
                <div className="hero-content">
                    <div className="hero-layout">
                        <div className="hero-media">
                            <img
                                src={heroBanner}
                                alt="سبيل الإضاءات"
                                className="hero-side-image"
                                loading="lazy"
                            />
                        </div>
                        <div className="hero-panel">
                            <div className="hero-center">
                                <h1>سبيل الإضاءات</h1>
                                <p className="hero-subtitle">رؤية شرعية إصلاحية - وعي - بيان</p>
                            </div>
                            <div className="hero-actions">
                                <div className="hero-buttons">
                                    <Link to="/books" className="btn btn-primary">
                                        <BookOpen size={20} />
                                        تصفح الكتب
                                    </Link>
                                    <Link to="/videos" className="btn btn-accent">
                                        <Video size={20} />
                                        شاهد الفيديوهات
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Intro — short and inviting, deep content lives on /about */}
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
                        <Link to="/about" className="btn btn-primary">
                            اقرأ رسالتنا و"من نحن"
                            <ArrowLeft size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features / Quick links */}
            <section className="features-section">
                <div className="container">
                    <div className="features-grid">
                        <Link to="/articles" className="feature-card">
                            <BookOpen size={40} className="feature-icon" />
                            <h3>الإضاءات</h3>
                            <p>مقالات وإضاءات شهرية منضبطة</p>
                        </Link>
                        <Link to="/consultations" className="feature-card">
                            <Users size={40} className="feature-icon" />
                            <h3>الاستشارات</h3>
                            <p>استشارات أسرية وطبية</p>
                        </Link>
                        <Link to="/team" className="feature-card">
                            <Users size={40} className="feature-icon" />
                            <h3>فريق العمل</h3>
                            <p>نخبة من أهل الاختصاص</p>
                        </Link>
                        {/* Quran Project Delayed
                        <Link to="/quran" className="feature-card">
                          <BookOpen size={40} className="feature-icon" />
                          <h3>مشروع التلاوة</h3>
                          <p>مشروع التحفيظ أون لاين</p>
                        </Link>
                        */}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
