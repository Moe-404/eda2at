import React, { useEffect, useRef, useState } from 'react';
import api from '../../utils/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { CATEGORIES, categoryLabel } from '../../constants/categories';
import './ManageBooks.css';

const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        category: '',
        pages: '',
        publisher: '',
        language: 'العربية',
    });
    const [pdfFile, setPdfFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await api.get('/books?limit=50');
            setBooks(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!editingBook && !pdfFile) {
            alert('يرجى اختيار ملف PDF للكتاب');
            return;
        }

        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('author', formData.author);
        payload.append('description', formData.description);
        payload.append('category', formData.category || '');
        payload.append('pages', formData.pages || '0');
        payload.append('publisher', formData.publisher || 'دار نشر سبيل الإضاءات');
        payload.append('language', formData.language || 'العربية');
        if (pdfFile) {
            payload.append('pdf', pdfFile);
        }

        setSubmitting(true);
        try {
            if (editingBook) {
                await api.put(`/books/${editingBook.id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post('/books', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            fetchBooks();
            resetForm();
        } catch (error) {
            console.error('Error saving book:', error);
            const details = error.response?.data?.errors
                ?.map((e) => e.msg || e.message)
                .join('\n');
            const serverMsg = error.response?.data?.error;
            alert(`فشل حفظ الكتاب${details ? `:\n${details}` : serverMsg ? `: ${serverMsg}` : ''}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return;

        try {
            await api.delete(`/books/${id}`);
            fetchBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
            const serverMsg = error.response?.data?.error;
            alert(`فشل حذف الكتاب: ${serverMsg || error.message || 'خطأ غير معروف'}`);
        }
    };

    const startEdit = (book) => {
        setEditingBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            description: book.description || '',
            category: book.category || '',
            pages: book.pages || '',
            publisher: book.publisher || '',
            language: book.language || 'العربية',
        });
        setPdfFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ title: '', author: '', description: '', category: '', pages: '', publisher: '', language: 'العربية' });
        setPdfFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setEditingBook(null);
        setShowForm(false);
    };

    if (loading) return <div className="admin-header"><p>جاري التحميل...</p></div>;

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>إدارة الكتب</h1>
                    <p>إضافة وتعديل الكتب</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    <Plus size={20} />
                    إضافة كتاب
                </button>
            </div>

            {showForm && (
                <div className="form-card">
                    <h3>{editingBook ? 'تعديل الكتاب' : 'إضافة كتاب جديد'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>عنوان الكتاب *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>المؤلف *</label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>التصنيف</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">— بدون تصنيف —</option>
                                {CATEGORIES.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>عدد الصفحات</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.pages}
                                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                                placeholder="مثال: 150"
                            />
                        </div>
                        <div className="form-group">
                            <label>اللغة</label>
                            <input
                                type="text"
                                value={formData.language}
                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                placeholder="مثال: العربية"
                            />
                        </div>
                        <div className="form-group">
                            <label>الوصف</label>
                            <textarea
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                ملف الكتاب (PDF أو Word) {editingBook ? '(اختياري - اتركه فارغاً للإبقاء على الملف الحالي)' : '*'}
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                required={!editingBook}
                            />
                            <p style={{ fontSize: '0.8rem', marginTop: '0.35rem', color: '#888' }}>
                                يمكن رفع ملف Word وسيتم تحويله تلقائياً إلى PDF لعرضه في القارئ.
                            </p>
                            {editingBook?.pdf_url && !pdfFile && (
                                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#666' }}>
                                    الملف الحالي:{' '}
                                    <a href={editingBook.pdf_url} target="_blank" rel="noopener noreferrer">
                                        عرض PDF
                                    </a>
                                </p>
                            )}
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'جارٍ الحفظ...' : 'حفظ'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn btn-secondary" disabled={submitting}>
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>العنوان</th>
                            <th>المؤلف</th>
                            <th>التصنيف</th>
                            <th>التاريخ</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map((book) => (
                            <tr key={book.id}>
                                <td>{book.title}</td>
                                <td>{book.author}</td>
                                <td>{book.category ? categoryLabel(book.category) : '—'}</td>
                                <td>{new Date(book.created_at).toLocaleDateString('ar-EG')}</td>
                                <td>
                                    <div className="table-actions">
                                        <button onClick={() => startEdit(book)} className="action-btn edit">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(book.id)} className="action-btn delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageBooks;
