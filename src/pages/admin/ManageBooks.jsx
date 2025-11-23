import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './ManageBooks.css';

const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        cover_url: '',
        pdf_url: ''
    });

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await api.get('/books');
            setBooks(response.data);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBook) {
                await api.put(`/books/${editingBook.id}`, formData);
            } else {
                await api.post('/books', formData);
            }
            fetchBooks();
            resetForm();
        } catch (error) {
            console.error('Error saving book:', error);
            alert('فشل حفظ الكتاب');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return;

        try {
            await api.delete(`/books/${id}`);
            fetchBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
        }
    };

    const startEdit = (book) => {
        setEditingBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            description: book.description || '',
            cover_url: book.cover_url || '',
            pdf_url: book.pdf_url || ''
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ title: '', author: '', description: '', cover_url: '', pdf_url: '' });
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
                            <label>الوصف</label>
                            <textarea
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>رابط الغلاف</label>
                            <input
                                type="url"
                                value={formData.cover_url}
                                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>رابط ملف PDF</label>
                            <input
                                type="url"
                                value={formData.pdf_url}
                                onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">حفظ</button>
                            <button type="button" onClick={resetForm} className="btn btn-secondary">إلغاء</button>
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
                            <th>التاريخ</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map((book) => (
                            <tr key={book.id}>
                                <td>{book.title}</td>
                                <td>{book.author}</td>
                                <td>{new Date(book.created_at).toLocaleDateString('ar-SA')}</td>
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
