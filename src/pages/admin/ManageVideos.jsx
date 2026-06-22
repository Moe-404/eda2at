import React, { useEffect, useRef, useState } from 'react';
import api from '../../utils/api';
import { Plus, Edit, Trash2, Upload, Youtube, Film } from 'lucide-react';
import { CATEGORIES, categoryLabel } from '../../constants/categories';
import '../admin/ManageBooks.css';

const emptyForm = {
    title: '',
    youtube_id: '',
    duration: '',
    category: '',
};

const ManageVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [videoType, setVideoType] = useState('youtube'); // 'youtube' | 'local'
    const [thumbFile, setThumbFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const thumbInputRef = useRef(null);
    const videoInputRef = useRef(null);

    useEffect(() => { fetchVideos(); }, []);

    const fetchVideos = async () => {
        try {
            const response = await api.get('/videos?limit=50');
            setVideos(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (videoType === 'youtube' && !formData.youtube_id) {
            alert('يرجى إدخال معرف YouTube');
            return;
        }
        if (videoType === 'local' && !videoFile && !editingVideo?.video_url) {
            alert('يرجى رفع ملف الفيديو');
            return;
        }

        setSubmitting(true);
        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('duration', formData.duration || '');
            payload.append('category', formData.category || '');
            if (videoType === 'youtube') {
                payload.append('youtube_id', formData.youtube_id);
            }
            if (thumbFile) payload.append('thumbnail', thumbFile);
            if (videoFile) payload.append('video', videoFile);

            const headers = { 'Content-Type': 'multipart/form-data' };
            if (editingVideo) {
                await api.put(`/videos/${editingVideo.id}`, payload, { headers });
            } else {
                await api.post('/videos', payload, { headers });
            }
            await fetchVideos();
            resetForm();
        } catch (error) {
            console.error('Error saving video:', error);
            const msg = error.response?.data?.errors?.map((e) => e.msg).join('\n')
                || error.response?.data?.error
                || 'فشل حفظ الفيديو';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return;
        try {
            await api.delete(`/videos/${id}`);
            fetchVideos();
        } catch (error) {
            console.error('Error deleting video:', error);
        }
    };

    const startEdit = (video) => {
        setEditingVideo(video);
        setFormData({
            title: video.title || '',
            youtube_id: video.youtube_id || '',
            duration: video.duration || '',
            category: video.category || '',
        });
        setVideoType(video.video_url ? 'local' : 'youtube');
        setThumbFile(null);
        setVideoFile(null);
        if (thumbInputRef.current) thumbInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setVideoType('youtube');
        setThumbFile(null);
        setVideoFile(null);
        if (thumbInputRef.current) thumbInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';
        setEditingVideo(null);
        setShowForm(false);
    };

    const extractYoutubeId = (input) => {
        if (!input) return '';
        if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
        ];
        for (const pattern of patterns) {
            const match = input.match(pattern);
            if (match) return match[1];
        }
        return input;
    };

    const handleYoutubeIdChange = async (input) => {
        const youtubeId = extractYoutubeId(input);
        setFormData((prev) => ({ ...prev, youtube_id: youtubeId || input }));
        if (!youtubeId || youtubeId === input) return;
        try {
            const res = await fetch(
                `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`
            );
            if (res.ok) {
                const data = await res.json();
                setFormData((prev) => ({ ...prev, youtube_id: youtubeId, title: prev.title || data.title }));
            }
        } catch (_) {}
    };

    if (loading) return <div className="admin-header"><p>جاري التحميل...</p></div>;

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>إدارة الفيديوهات</h1>
                    <p>إضافة وتعديل الفيديوهات</p>
                </div>
                <button onClick={() => (showForm ? resetForm() : setShowForm(true))} className="btn btn-primary">
                    <Plus size={20} />
                    {showForm ? 'إخفاء النموذج' : 'إضافة فيديو'}
                </button>
            </div>

            {showForm && (
                <div className="form-card">
                    <h3>{editingVideo ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}</h3>
                    <form onSubmit={handleSubmit}>
                        {/* Video type toggle */}
                        <div className="form-group">
                            <label>نوع الفيديو</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="videoType"
                                        value="youtube"
                                        checked={videoType === 'youtube'}
                                        onChange={() => setVideoType('youtube')}
                                    />
                                    <Youtube size={16} /> يوتيوب
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="videoType"
                                        value="local"
                                        checked={videoType === 'local'}
                                        onChange={() => setVideoType('local')}
                                    />
                                    <Film size={16} /> ملف محلي
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>عنوان الفيديو *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        {videoType === 'youtube' ? (
                            <div className="form-group">
                                <label>رابط أو معرف YouTube *</label>
                                <input
                                    type="text"
                                    value={formData.youtube_id}
                                    onChange={(e) => handleYoutubeIdChange(e.target.value)}
                                    placeholder="مثال: https://www.youtube.com/watch?v=..."
                                />
                                <small style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
                                    الصق الرابط الكامل أو المعرف فقط — سيتم جلب العنوان تلقائياً
                                </small>
                            </div>
                        ) : (
                            <div className="form-group">
                                <label>
                                    ملف الفيديو{' '}
                                    {editingVideo?.video_url ? '(اتركه فارغاً للإبقاء على الملف الحالي)' : '*'}
                                </label>
                                <input
                                    ref={videoInputRef}
                                    type="file"
                                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                />
                                {editingVideo?.video_url && !videoFile && (
                                    <small style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
                                        ملف حالي: {editingVideo.video_url.split('/').pop()}
                                    </small>
                                )}
                            </div>
                        )}

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
                                <label>المدة</label>
                                <input
                                    type="text"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="مثال: 15:30"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>
                                <Upload size={16} style={{ display: 'inline', marginInlineEnd: 6 }} />
                                الصورة المصغرة (اختياري)
                            </label>
                            <input
                                ref={thumbInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                            />
                            {videoType === 'youtube' && (
                                <small style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
                                    إذا لم ترفع صورة، سيتم استخدام صورة YouTube تلقائياً
                                </small>
                            )}
                            {editingVideo?.thumbnail_url && !thumbFile && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <img src={editingVideo.thumbnail_url} alt="" style={{ maxHeight: 100, borderRadius: 8 }} />
                                </div>
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
                            <th>النوع</th>
                            <th>التصنيف</th>
                            <th>المدة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {videos.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>
                                لا توجد فيديوهات بعد
                            </td></tr>
                        )}
                        {videos.map((video) => (
                            <tr key={video.id}>
                                <td>{video.title}</td>
                                <td>{video.video_url ? <><Film size={14} style={{ display: 'inline' }} /> محلي</> : <><Youtube size={14} style={{ display: 'inline' }} /> يوتيوب</>}</td>
                                <td>{video.category ? categoryLabel(video.category) : '—'}</td>
                                <td>{video.duration || '—'}</td>
                                <td>
                                    <div className="table-actions">
                                        <button onClick={() => startEdit(video)} className="action-btn edit">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(video.id)} className="action-btn delete">
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

export default ManageVideos;
