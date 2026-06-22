import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import './NotFound.css';

const NotFound = () => (
    <div className="not-found-page">
        <div className="container not-found-container">
            <div className="not-found-mark" aria-hidden>
                <span>4</span>
                <span className="not-found-bismillah">۝</span>
                <span>4</span>
            </div>

            <h1>الصفحة غير موجودة</h1>
            <p className="not-found-lead">
                عذرًا، الصفحة التي تبحث عنها قد انتقلت أو لم تعد متاحة.
            </p>

            <blockquote className="not-found-ayah">
                ﴿وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ﴾
                <footer>[البقرة: 216]</footer>
            </blockquote>

            <div className="not-found-actions">
                <Link to="/" className="btn btn-primary">
                    <Home size={18} />
                    العودة للرئيسية
                </Link>
                <Link to="/articles" className="btn btn-accent">
                    <Search size={18} />
                    تصفّح الإضاءات
                </Link>
            </div>
        </div>
    </div>
);

export default NotFound;
