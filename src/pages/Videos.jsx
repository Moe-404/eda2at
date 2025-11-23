import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import './Videos.css';

const Videos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/videos`);
            const data = await response.json();
            setVideos(data);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="videos-page">
                <div className="container">
                    <div className="section-title">
                        <h1>الفيديوهات</h1>
                    </div>
                    <p style={{ textAlign: 'center', padding: '2rem' }}>جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="videos-page">
            <div className="container">
                <div className="section-title">
                    <h1>الفيديوهات</h1>
                </div>

                {videos.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        لا توجد فيديوهات متاحة حالياً
                    </p>
                ) : (
                    <div className="videos-grid">
                        {videos.map((video) => (
                            <div key={video.id} className="video-card" onClick={() => setSelectedVideo(video)}>
                                <div className="video-thumbnail">
                                    <img src={video.thumbnail_url} alt={video.title} />
                                    <div className="play-button">
                                        <Play size={32} fill="currentColor" />
                                    </div>
                                    {video.duration && <span className="duration">{video.duration}</span>}
                                </div>
                                <div className="video-info">
                                    <h3>{video.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedVideo && (
                    <div className="video-modal" onClick={() => setSelectedVideo(null)}>
                        <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="close-button" onClick={() => setSelectedVideo(null)}>×</button>
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}`}
                                title={selectedVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Videos;
