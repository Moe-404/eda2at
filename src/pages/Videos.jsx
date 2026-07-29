import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import SEO from '../components/SEO';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ShareButtons from '../components/ShareButtons';
import { CardGridSkeleton } from '../components/Skeleton';
import { categoryLabel } from '../constants/categories';
import './Videos.css';

const Videos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const t = setTimeout(() => setPage(1), 400);
        return () => clearTimeout(t);
    }, [search, category]);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ page, limit: 12 });
                if (search) params.set('search', search);
                if (category) params.set('category', category);
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${apiUrl}/videos?${params}`, {
                    signal: controller.signal,
                });
                const json = await response.json();
                const rows = Array.isArray(json) ? json : json.data || [];
                setVideos(rows);
                setTotalPages(json.pagination?.totalPages || 1);
            } catch (err) {
                if (err.name !== 'AbortError') setVideos([]);
            } finally {
                setLoading(false);
            }
        };
        load();
        return () => controller.abort();
    }, [page, search, category]);

    const closeModal = () => setSelectedVideo(null);

    return (
        <div className="videos-page">
            <SEO
                title="الفيديوهات"
                description="الفيديوهات العلمية والمقاطع المرئية لمشروع إضاءات الشرعي الإصلاحي."
                keywords="فيديوهات إسلامية, مقاطع علمية, إضاءات"
            />
            <div className="container">
                <div className="section-title">
                    <h1>الفيديوهات</h1>
                </div>

                <SearchBar
                    search={search}
                    onSearchChange={setSearch}
                    category={category}
                    onCategoryChange={setCategory}
                    placeholder="ابحث في الفيديوهات..."
                />

                {loading ? (
                    <CardGridSkeleton count={6} />
                ) : videos.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                        لا توجد فيديوهات مطابقة للبحث
                    </p>
                ) : (
                    <>
                        <div className="videos-grid">
                            {videos.map((video) => (
                                <div key={video.id} className="video-card" onClick={() => setSelectedVideo(video)}>
                                    <div className="video-thumbnail">
                                        {video.thumbnail_url ? (
                                            <img src={video.thumbnail_url} alt={video.title} />
                                        ) : video.youtube_id ? (
                                            <img
                                                src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                                                alt={video.title}
                                            />
                                        ) : (
                                            <div className="video-thumbnail-placeholder">
                                                <span>VIDEO</span>
                                                <p>{video.title}</p>
                                            </div>
                                        )}
                                        <div className="play-button">
                                            <Play size={32} fill="currentColor" />
                                        </div>
                                        {video.duration && <span className="duration">{video.duration}</span>}
                                    </div>
                                    <div className="video-info">
                                        {video.category && (
                                            <span className="category-chip">{categoryLabel(video.category)}</span>
                                        )}
                                        <h3>{video.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                    </>
                )}

                {selectedVideo && (
                    <div className="video-modal" onClick={closeModal}>
                        <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="close-button" onClick={closeModal}>×</button>
                            {selectedVideo.video_url ? (
                                <video
                                    width="100%"
                                    height="100%"
                                    controls
                                    autoPlay
                                    src={selectedVideo.video_url}
                                    title={selectedVideo.title}
                                />
                            ) : (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}`}
                                    title={selectedVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            )}
                            <div className="video-modal-footer">
                                <ShareButtons
                                    title={selectedVideo.title}
                                    url={
                                        selectedVideo.youtube_id
                                            ? `https://youtu.be/${selectedVideo.youtube_id}`
                                            : undefined
                                    }
                                    compact
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Videos;
