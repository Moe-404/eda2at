import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ page, totalPages, onPageChange }) => {
    if (!totalPages || totalPages <= 1) return null;

    const goTo = (p) => {
        if (p < 1 || p > totalPages || p === page) return;
        onPageChange(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const pages = [];
    const windowSize = 2;
    for (let i = Math.max(1, page - windowSize); i <= Math.min(totalPages, page + windowSize); i++) {
        pages.push(i);
    }

    return (
        <nav className="pagination" aria-label="تصفح الصفحات">
            <button
                type="button"
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
                className="pag-btn"
                aria-label="السابق"
            >
                <ChevronRight size={18} />
            </button>

            {pages[0] > 1 && (
                <>
                    <button type="button" onClick={() => goTo(1)} className="pag-btn">1</button>
                    {pages[0] > 2 && <span className="pag-dots">…</span>}
                </>
            )}

            {pages.map((p) => (
                <button
                    key={p}
                    type="button"
                    onClick={() => goTo(p)}
                    className={`pag-btn ${p === page ? 'active' : ''}`}
                    aria-current={p === page ? 'page' : undefined}
                >
                    {p}
                </button>
            ))}

            {pages[pages.length - 1] < totalPages && (
                <>
                    {pages[pages.length - 1] < totalPages - 1 && <span className="pag-dots">…</span>}
                    <button type="button" onClick={() => goTo(totalPages)} className="pag-btn">
                        {totalPages}
                    </button>
                </>
            )}

            <button
                type="button"
                onClick={() => goTo(page + 1)}
                disabled={page === totalPages}
                className="pag-btn"
                aria-label="التالي"
            >
                <ChevronLeft size={18} />
            </button>
        </nav>
    );
};

export default Pagination;
