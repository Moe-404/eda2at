import React from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';
import './QuranProject.css';

const QuranProject = () => {
    return (
        <div className="quran-page">
            {/* Hero Section */}
            <section className="quran-hero">
                <div className="container">
                    <BookOpen size={64} className="quran-icon" />
                    <h1>مشروع التلاوة</h1>
                    <p>مشروع التحفيظ أون لاين - احفظ كتاب الله من منزلك</p>
                </div>
            </section>

            <div className="container">
                <div className="quran-content">
                    <div className="quran-features">
                        <h2>مميزات المشروع</h2>
                        <div className="features-list">
                            <div className="feature-item">
                                <CheckCircle className="check-icon" />
                                <p>نخبة من المحفظين والمحفظات المجازين</p>
                            </div>
                            <div className="feature-item">
                                <CheckCircle className="check-icon" />
                                <p>مرونة في اختيار الأوقات المناسبة</p>
                            </div>
                            <div className="feature-item">
                                <CheckCircle className="check-icon" />
                                <p>متابعة دورية لمستوى الحفظ</p>
                            </div>
                            <div className="feature-item">
                                <CheckCircle className="check-icon" />
                                <p>منهجية متدرجة تناسب جميع المستويات</p>
                            </div>
                        </div>
                    </div>

                    <div className="join-card">
                        <h2>انضم إلينا الآن</h2>
                        <p>سجل بياناتك وسيتم التواصل معك لتحديد موعد المقابلة وتحديد المستوى.</p>
                        <button className="btn btn-accent full-width">
                            سجل في المشروع
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuranProject;
