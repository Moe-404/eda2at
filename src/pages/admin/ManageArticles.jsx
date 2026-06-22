import React, { useEffect, useRef, useState } from 'react';
import api from '../../utils/api';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';
import { CATEGORIES, categoryLabel } from '../../constants/categories';
import '../admin/ManageBooks.css';

const emptyForm = {
    title: '',
    excerpt: '',
    content: '',
    author: 'د. أحمد',
    published_date: new Date().toISOString().split('T')[0],
    category: '',
    status: 'published',
};

const articleTypeLabel = (a) => {
    if (a.pdf_url) return 'PDF';
    return 'نص';
};

const statusLabel = (s) => ({ draft: 'مسودة', published: 'منشور', archived: 'مؤرشف' }[s] || 'منشور');

const ManageArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [coverFile, setCoverFile] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const coverInputRef = useRef(null);
    const pdfInputRef = useRef(null);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const response = await api.get('/articles?limit=50');
            setArticles(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const hasContent = formData.content && formData.content.replace(/<[^>]*>/g, '').trim();
        const hasPdf = pdfFile || editingArticle?.pdf_url;
        if (!hasContent && !hasPdf) {
            alert('يجب كتابة محتوى المقال أو رفع ملف PDF');
            return;
        }

        setSubmitting(true);
        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('excerpt', formData.excerpt || '');
            payload.append('content', formData.content || '');
            payload.append('author', formData.author || '');
            payload.append('published_date', formData.published_date || '');
            payload.append('category', formData.category || '');
            payload.append('status', formData.status || 'published');
            if (coverFile) payload.append('cover', coverFile);
            if (pdfFile) payload.append('pdf', pdfFile);

            const headers = { 'Content-Type': 'multipart/form-data' };
            if (editingArticle) {
                await api.put(`/articles/${editingArticle.id}`, payload, { headers });
            } else {
                await api.post('/articles', payload, { headers });
            }
            await fetchArticles();
            resetForm();
        } catch (error) {
            console.error('Error saving article:', error);
            const msg = error.response?.data?.errors?.map((e) => e.msg).join('\n')
                || error.response?.data?.error
                || 'فشل حفظ المقال';
            alert(msg);
        } finally {
            setSubmitting(false);
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
            title: article.title || '',
            excerpt: article.excerpt || '',
            content: article.content || '',
            author: article.author || 'د. أحمد',
            published_date: article.published_date?.split('T')[0] || new Date().toISOString().split('T')[0],
            category: article.category || '',
            status: article.status || 'published',
        });
        setCoverFile(null);
        setPdfFile(null);
        if (coverInputRef.current) coverInputRef.current.value = '';
        if (pdfInputRef.current) pdfInputRef.current.value = '';
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setCoverFile(null);
        setPdfFile(null);
        if (coverInputRef.current) coverInputRef.current.value = '';
        if (pdfInputRef.current) pdfInputRef.current.value = '';
        setEditingArticle(null);
        setShowForm(false);
    };

    if (loading) return <div className="admin-header"><p>جاري التحميل...</p></div>;

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>إدارة الإضاءات</h1>
                    <p>إضافة وتعديل المقالات مع محرر نصوص غني</p>
                </div>
                <button onClick={() => (showForm ? resetForm() : setShowForm(true))} className="btn btn-primary">
                    <Plus size={20} />
                    {showForm ? 'إخفاء النموذج' : 'إضافة مقال'}
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

                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                                <label>الحالة</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="draft">مسودة</option>
                                    <option value="published">منشور</option>
                                    <option value="archived">مؤرشف</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>المؤلف</label>
                                <input
                                    type="text"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
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
                        </div>

                        <div className="form-group">
                            <label>صورة الغلاف (اختيارية)</label>
                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                            />
                            {editingArticle?.cover_url && !coverFile && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <img
                                        src={editingArticle.cover_url}
                                        alt=""
                                        style={{ maxHeight: 120, borderRadius: 8 }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>مقتطف (يظهر تحت العنوان في صفحة القائمة)</label>
                            <textarea
                                rows="2"
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>ملف PDF (اختياري — بديل عن كتابة المحتوى)</label>
                            <input
                                ref={pdfInputRef}
                                type="file"
                                accept="application/pdf,.pdf"
                                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                            />
                            {editingArticle?.pdf_url && !pdfFile && (
                                <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                                    ملف حالي:{' '}
                                    <a href={editingArticle.pdf_url} target="_blank" rel="noopener noreferrer">
                                        عرض PDF
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>المحتوى (اختياري إذا رفعت PDF)</label>
                            <RichTextEditor
                                key={editingArticle?.id ?? 'new'}
                                value={formData.content}
                                onChange={(html) => setFormData({ ...formData, content: html })}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'جارٍ الحفظ...' : 'حفظ'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn btn-secondary" disabled={submitting}>
                                <X size={16} /> إلغاء
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
                            <th>النوع</th>
                            <th>التصنيف</th>
                            <th>الحالة</th>
                            <th>تاريخ النشر</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((article) => (
                            <tr key={article.id}>
                                <td>{article.title}</td>
                                <td>{articleTypeLabel(article)}</td>
                                <td>{article.category ? categoryLabel(article.category) : '—'}</td>
                                <td>
                                    <span className={`status-pill status-${article.status || 'published'}`}>
                                        {statusLabel(article.status)}
                                    </span>
                                </td>
                                <td>{article.published_date ? new Date(article.published_date).toLocaleDateString('ar-EG') : '—'}</td>
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
