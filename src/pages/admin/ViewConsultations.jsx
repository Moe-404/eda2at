import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Eye, Trash2 } from 'lucide-react';
import '../admin/ManageBooks.css';

const ViewConsultations = () => {
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConsultation, setSelectedConsultation] = useState(null);

    useEffect(() => {
        fetchConsultations();
    }, []);

    const fetchConsultations = async () => {
        try {
            const response = await api.get('/consultations');
            setConsultations(response.data);
        } catch (error) {
            console.error('Error fetching consultations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه الاستشارة؟')) return;

        try {
            await api.delete(`/consultations/${id}`);
            fetchConsultations();
            setSelectedConsultation(null);
        } catch (error) {
            console.error('Error deleting consultation:', error);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/consultations/${id}`, { status });
            fetchConsultations();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) return <div className="admin-header"><p>جاري التحميل...</p></div>;

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>الاستشارات</h1>
                    <p>عرض وإدارة طلبات الاستشارات</p>
                </div>
            </div>

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>النوع</th>
                            <th>الاسم</th>
                            <th>البريد الإلكتروني</th>
                            <th>الموضوع</th>
                            <th>الحالة</th>
                            <th>التاريخ</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {consultations.map((consultation) => (
                            <tr key={consultation.id}>
                                <td>{consultation.type === 'family' ? 'أسرية' : 'طبية'}</td>
                                <td>{consultation.name || '-'}</td>
                                <td>{consultation.email}</td>
                                <td>{consultation.subject}</td>
                                <td>
                                    <select
                                        value={consultation.status}
                                        onChange={(e) => updateStatus(consultation.id, e.target.value)}
                                        style={{ padding: '0.25rem', borderRadius: '4px' }}
                                    >
                                        <option value="pending">قيد الانتظار</option>
                                        <option value="reviewed">تمت المراجعة</option>
                                        <option value="replied">تم الرد</option>
                                    </select>
                                </td>
                                <td>{new Date(consultation.created_at).toLocaleDateString('ar-SA')}</td>
                                <td>
                                    <div className="table-actions">
                                        <button
                                            onClick={() => setSelectedConsultation(consultation)}
                                            className="action-btn edit"
                                            title="عرض التفاصيل"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(consultation.id)} className="action-btn delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedConsultation && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '8px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <h3>تفاصيل الاستشارة</h3>
                        <p><strong>النوع:</strong> {selectedConsultation.type === 'family' ? 'أسرية' : 'طبية'}</p>
                        <p><strong>الاسم:</strong> {selectedConsultation.name || '-'}</p>
                        <p><strong>البريد الإلكتروني:</strong> {selectedConsultation.email}</p>
                        <p><strong>الموضوع:</strong> {selectedConsultation.subject}</p>
                        <p><strong>التفاصيل:</strong></p>
                        <p style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
                            {selectedConsultation.details}
                        </p>
                        <button
                            onClick={() => setSelectedConsultation(null)}
                            className="btn btn-secondary"
                            style={{ marginTop: '1rem' }}
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewConsultations;
