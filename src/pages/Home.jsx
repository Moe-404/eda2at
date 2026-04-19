import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Video, Users } from 'lucide-react';
import heroBanner from '../assets/سبيل اضاءات.jpeg';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay" aria-hidden />
                <div className="hero-content">
                    <div className="hero-layout">
                        <div className="hero-media">
                            <img src={heroBanner} alt="سبيل الإضاءات" className="hero-side-image" loading="lazy" />
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

            {/* About Section */}
            <section className="about-section">
                <div className="container">
                    <div className="section-title">
                        <h2>فكرة الموقع</h2>
                    </div>
                    <div className="about-content">
                        <div className="about-card">
                            <h3>الفكرة</h3>
                            <p>
                                يكون الموقع هو "البيت المركزي" لكل إنتاجك — كتب، مقاطع، مقالات، روابط القنوات، الخ.
                            </p>
                        </div>
                        <div className="about-card">
                            <h3>الهدف</h3>
                            <p>
                                ربط الجمهور كله في مكان واحد تقدر تتحكم فيه بدون خوارزميات ولا قيود.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="features-section">
                <div className="container">
                    <div className="features-grid">
                        <Link to="/articles" className="feature-card">
                            <BookOpen size={40} className="feature-icon" />
                            <h3>الإضاءات</h3>
                            <p>مقالات وإضاءات قصيرة</p>
                        </Link>
                        <Link to="/consultations" className="feature-card">
                            <Users size={40} className="feature-icon" />
                            <h3>الاستشارات</h3>
                            <p>استشارات أسرية وطبية</p>
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
