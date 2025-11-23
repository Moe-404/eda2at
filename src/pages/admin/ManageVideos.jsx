import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import '../admin/ManageBooks.css';

const ManageVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        youtube_id: '',
        thumbnail_url: '',
        duration: ''
    });

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await api.get('/videos');
            setVideos(response.data);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingVideo) {
                await api.put(`/videos/${editingVideo.id}`, formData);
            } else {
                await api.post('/videos', formData);
            }
            fetchVideos();
            resetForm();
        } catch (error) {
            console.error('Error saving video:', error);
            alert('فشل حفظ الفيديو');
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
            title: video.title,
            youtube_id: video.youtube_id,
            thumbnail_url: video.thumbnail_url || '',
            duration: video.duration || ''
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ title: '', youtube_id: '', thumbnail_url: '', duration: '' });
        setEditingVideo(null);
        setShowForm(false);
    };

    // Extract YouTube ID from URL or ID
    const extractYoutubeId = (input) => {
        if (!input) return '';

        // If it's already just an ID (11 characters, alphanumeric)
        if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
            return input;
        }

        // Extract from various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
        ];

        for (const pattern of patterns) {
            const match = input.match(pattern);
            if (match) return match[1];
        }

        return '';
    };

    // Auto-fetch video details from YouTube when youtube_id changes
    const handleYoutubeIdChange = async (input) => {
        const youtubeId = extractYoutubeId(input);

        if (!youtubeId) {
            setFormData({ ...formData, youtube_id: input });
            return;
        }

        // Update the ID field with extracted ID
        setFormData(prev => ({ ...prev, youtube_id: youtubeId }));

        if (youtubeId.length === 11) {
            try {
                // Auto-generate thumbnail URL
                const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

                // Fetch video metadata using YouTube oEmbed API (no API key needed!)
                const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`);

                if (response.ok) {
                    const data = await response.json();

                    setFormData(prev => ({
                        ...prev,
                        youtube_id: youtubeId,
                        title: prev.title || data.title, // Only set if title is empty
                        thumbnail_url: thumbnailUrl
                    }));
                } else {
                    // If oEmbed fails, just set the thumbnail
                    setFormData(prev => ({
                        ...prev,
                        youtube_id: youtubeId,
                        thumbnail_url: thumbnailUrl
                    }));
                }
            } catch (error) {
                console.error('Error fetching YouTube data:', error);
                // Fallback: just set thumbnail
                setFormData(prev => ({
                    ...prev,
                    youtube_id: youtubeId,
                    thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
                }));
            }
        }
    };

    if (loading) return <div className="admin-header"><p>جاري التحميل...</p></div>;

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>إدارة الفيديوهات</h1>
                    <p>إضافة وتعديل الفيديوهات</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    <Plus size={20} />
                    إضافة فيديو
                </button>
            </div>

            {showForm && (
                <div className="form-card">
                    <h3>{editingVideo ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>عنوان الفيديو *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>رابط أو معرف YouTube *</label>
                            <input
                                type="text"
                                value={formData.youtube_id}
                                onChange={(e) => handleYoutubeIdChange(e.target.value)}
                                required
                                placeholder="مثال: https://www.youtube.com/watch?v=dQw4w9WgXcQ أو dQw4w9WgXcQ"
                            />
                            <small style={{ color: '#666', fontSize: '0.85rem' }}>
                                الصق الرابط الكامل أو المعرف فقط - سيتم تحميل العنوان والصورة تلقائياً
                            </small>
                        </div>
                        <div className="form-group">
                            <label>رابط الصورة المصغرة</label>
                            <input
                                type="url"
                                value={formData.thumbnail_url}
                                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                placeholder="يتم إنشاؤه تلقائياً من معرف YouTube"
                            />
                            <small style={{ color: '#666', fontSize: '0.85rem' }}>
                                تم إنشاؤه تلقائياً، يمكنك تعديله إذا لزم الأمر
                            </small>
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
                            <th>معرف YouTube</th>
                            <th>المدة</th>
                            <th>التاريخ</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {videos.map((video) => (
                            <tr key={video.id}>
                                <td>{video.title}</td>
                                <td>{video.youtube_id}</td>
                                <td>{video.duration || '-'}</td>
                                <td>{new Date(video.created_at).toLocaleDateString('ar-SA')}</td>
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
