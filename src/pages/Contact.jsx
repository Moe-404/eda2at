import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmitted(true);
                setFormData({ name: '', email: '', message: '' });
                setTimeout(() => setSubmitted(false), 5000);
            } else {
                alert('حدث خطأ أثناء إرسال الرسالة');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('حدث خطأ أثناء إرسال الرسالة');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            <div className="container">
                <div className="section-title">
                    <h1>تواصل معنا</h1>
                </div>

                <div className="contact-grid">
                    <div className="contact-info">
                        <h2>معلومات التواصل</h2>
                        <p>نسعد بتواصلكم معنا واستقبال استفساراتكم واقتراحاتكم.</p>

                        <div className="info-item">
                            <Mail className="info-icon" />
                            <div>
                                <h3>البريد الإلكتروني</h3>
                                <p>info@sabeel-eda2at.com</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <Phone className="info-icon" />
                            <div>
                                <h3>الهاتف</h3>
                                <p>+966 50 000 0000</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <MapPin className="info-icon" />
                            <div>
                                <h3>العنوان</h3>
                                <p>المملكة العربية السعودية</p>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-wrapper">
                        {submitted && (
                            <div style={{
                                padding: '1rem',
                                marginBottom: '1rem',
                                background: '#d4edda',
                                color: '#155724',
                                borderRadius: '4px',
                                textAlign: 'center'
                            }}>
                                تم إرسال رسالتك بنجاح!
                            </div>
                        )}
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>الاسم</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>الرسالة</label>
                                <textarea
                                    rows="5"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary full-width" disabled={submitting}>
                                <Send size={18} />
                                {submitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
