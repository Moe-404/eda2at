import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Eye, Trash2 } from 'lucide-react';
import '../admin/ManageBooks.css';

const ViewContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await api.get('/contact');
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

        try {
            await api.delete(`/contact/${id}`);
            fetchContacts();
            setSelectedContact(null);
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/contact/${id}`, { status });
            fetchContacts();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) return <div className="admin-header"><p>جاري التحميل...</p></div>;

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>الرسائل</h1>
                    <p>عرض وإدارة رسائل التواصل</p>
                </div>
            </div>

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>البريد الإلكتروني</th>
                            <th>الرسالة</th>
                            <th>الحالة</th>
                            <th>التاريخ</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map((contact) => (
                            <tr key={contact.id}>
                                <td>{contact.name}</td>
                                <td>{contact.email}</td>
                                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {contact.message}
                                </td>
                                <td>
                                    <select
                                        value={contact.status}
                                        onChange={(e) => updateStatus(contact.id, e.target.value)}
                                        style={{ padding: '0.25rem', borderRadius: '4px' }}
                                    >
                                        <option value="new">جديدة</option>
                                        <option value="read">مقروءة</option>
                                        <option value="replied">تم الرد</option>
                                    </select>
                                </td>
                                <td>{new Date(contact.created_at).toLocaleDateString('ar-SA')}</td>
                                <td>
                                    <div className="table-actions">
                                        <button
                                            onClick={() => setSelectedContact(contact)}
                                            className="action-btn edit"
                                            title="عرض الرسالة"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(contact.id)} className="action-btn delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedContact && (
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
                        <h3>تفاصيل الرسالة</h3>
                        <p><strong>الاسم:</strong> {selectedContact.name}</p>
                        <p><strong>البريد الإلكتروني:</strong> {selectedContact.email}</p>
                        <p><strong>الرسالة:</strong></p>
                        <p style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
                            {selectedContact.message}
                        </p>
                        <p><strong>التاريخ:</strong> {new Date(selectedContact.created_at).toLocaleString('ar-SA')}</p>
                        <button
                            onClick={() => setSelectedContact(null)}
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

export default ViewContacts;
