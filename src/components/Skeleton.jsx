import React from 'react';
import './Skeleton.css';

export const Skeleton = ({ width, height, radius = '8px', className = '', style }) => (
    <span
        className={`skeleton ${className}`}
        style={{ width, height, borderRadius: radius, ...style }}
        aria-hidden
    />
);

export const SkeletonText = ({ lines = 3, width = '100%' }) => (
    <div className="skeleton-text">
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                height="0.9rem"
                width={i === lines - 1 ? `calc(${width} - 20%)` : width}
            />
        ))}
    </div>
);

export const CardSkeleton = () => (
    <div className="skeleton-card">
        <Skeleton height="180px" width="100%" radius="12px" />
        <div style={{ padding: '1rem' }}>
            <Skeleton height="1.2rem" width="70%" style={{ marginBottom: '0.6rem' }} />
            <Skeleton height="0.8rem" width="40%" style={{ marginBottom: '0.9rem' }} />
            <SkeletonText lines={2} />
        </div>
    </div>
);

export const CardGridSkeleton = ({ count = 6 }) => (
    <div className="skeleton-grid">
        {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
        ))}
    </div>
);

export const ListSkeleton = ({ count = 5 }) => (
    <div className="skeleton-list">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="skeleton-list-item">
                <Skeleton width="60px" height="60px" radius="50%" />
                <div style={{ flex: 1 }}>
                    <Skeleton height="1rem" width="50%" style={{ marginBottom: '0.4rem' }} />
                    <Skeleton height="0.8rem" width="80%" />
                </div>
            </div>
        ))}
    </div>
);

export default Skeleton;
