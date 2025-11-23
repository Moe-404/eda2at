import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import '../admin/ManageBooks.css';

const ManageArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        author: 'د. أحمد',
        published_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const response = await api.get('/articles');
            setArticles(response.data);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingArticle) {
                await api.put(`/articles/${editingArticle.id}`, formData);
            } else {
                await api.post('/articles', formData);
            }
            fetchArticles();
            resetForm();
        } catch (error) {
            console.error('Error saving article:', error);
            alert('فشل حفظ المقال');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;

        try {
            await api.delete(`/articles/${id}`);
            fetchArticles();
        } catch (error) {
            console.error('Error deleting article:', error);
        }
    };

    const startEdit = (article) => {
        setEditingArticle(article);
        setFormData({
            title: article.title,
            excerpt: article.excerpt || '',
            content: article.content,
            author: article.author || 'د. أحمد',
            published_date: article.published_date?.split('T')[0] || new Date().toISOString().split('T')[0]
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            excerpt: '',
            content: '',
            author: 'د. أحمد',
            published_date: new Date().toISOString().split('T')[0]
        });
        setEditingArticle(null);
        setShowForm(false);
    };

    if (loading) return <div className="admin-header"><p>جاري التحميل...</p></div>;

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>إدارة الإضاءات</h1>
                    <p>إضافة وتعديل المقالات</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    <Plus size={20} />
                    إضافة مقال
                </button>
            </div>

            {showForm && (
                <div className="form-card">
                    <h3>{editingArticle ? 'تعديل المقال' : 'إضافة مقال جديد'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>عنوان المقال *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>المؤلف</label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>مقتطف</label>
                            <textarea
                                rows="2"
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>المحتوى *</label>
                            <textarea
                                rows="6"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>تاريخ النشر</label>
                            <input
                                type="date"
                                value={formData.published_date}
                                onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
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
                            <th>تاريخ النشر</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((article) => (
                            <tr key={article.id}>
                                <td>{article.title}</td>
                                <td>{article.author}</td>
                                <td>{new Date(article.published_date).toLocaleDateString('ar-SA')}</td>
                                <td>
                                    <div className="table-actions">
                                        <button onClick={() => startEdit(article)} className="action-btn edit">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(article.id)} className="action-btn delete">
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

export default ManageArticles;
