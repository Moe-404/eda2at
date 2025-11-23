import React, { useState } from 'react';
import { Users, Stethoscope, Send } from 'lucide-react';
import './Consultations.css';

const Consultations = () => {
    const [activeTab, setActiveTab] = useState('family');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        details: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/consultations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    type: activeTab
                }),
            });

            if (response.ok) {
                setSubmitted(true);
                setFormData({ name: '', email: '', subject: '', details: '' });
                setTimeout(() => setSubmitted(false), 5000);
            } else {
                alert('حدث خطأ أثناء إرسال الاستشارة');
            }
        } catch (error) {
            console.error('Error submitting consultation:', error);
            alert('حدث خطأ أثناء إرسال الاستشارة');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="consultations-page">
            <div className="container">
                <div className="section-title">
                    <h1>الاستشارات</h1>
                </div>

                <div className="tabs-container">
                    <button
                        className={`tab-btn ${activeTab === 'family' ? 'active' : ''}`}
                        onClick={() => setActiveTab('family')}
                    >
                        <Users size={20} />
                        استشارات أسرية
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'medical' ? 'active' : ''}`}
                        onClick={() => setActiveTab('medical')}
                    >
                        <Stethoscope size={20} />
                        استشارات طبية
                    </button>
                </div>

                <div className="form-container">
                    <div className="form-header">
                        <h2>{activeTab === 'family' ? 'نموذج الاستشارة الأسرية' : 'نموذج الاستشارة الطبية'}</h2>
                        <p>
                            {activeTab === 'family'
                                ? 'نحن هنا للاستماع إليك ومساعدتك في حل المشكلات الأسرية والتربوية بسرية تامة.'
                                : 'اطرح استشارتك الطبية وسيتم الرد عليك من قبل مختصين.'}
                        </p>
                    </div>

                    {submitted && (
                        <div style={{
                            padding: '1rem',
                            marginBottom: '1rem',
                            background: '#d4edda',
                            color: '#155724',
                            borderRadius: '4px',
                            textAlign: 'center'
                        }}>
                            تم إرسال استشارتك بنجاح!
                        </div>
                    )}

                    <form className="consultation-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>الاسم (اختياري)</label>
                            <input
                                type="text"
                                placeholder="أدخل اسمك"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>البريد الإلكتروني</label>
                            <input
                                type="email"
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>الموضوع</label>
                            <input
                                type="text"
                                placeholder="موضوع الاستشارة"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>تفاصيل الاستشارة</label>
                            <textarea
                                rows="6"
                                placeholder="اكتب تفاصيل استشارتك هنا..."
                                value={formData.details}
                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary full-width" disabled={submitting}>
                            <Send size={18} />
                            {submitting ? 'جاري الإرسال...' : 'إرسال الاستشارة'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Consultations;
