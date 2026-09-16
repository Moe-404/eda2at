import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
    ChevronRight, ChevronLeft, ZoomIn, ZoomOut, Search, X, Loader2, AlertTriangle,
} from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PdfReader.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

const MIN_SCALE = 0.6;
const MAX_SCALE = 2.4;
const SCALE_STEP = 0.2;

/**
 * Embedded, read-only PDF viewer. Renders pages to canvas (no native
 * browser PDF toolbar/download button) and reports page changes so the
 * caller can persist reading progress.
 */
const PdfReader = ({ fileUrl, initialPage = 1, onPageChange }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(initialPage);
    const [scale, setScale] = useState(1.1);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [pageInput, setPageInput] = useState(String(initialPage));
    const containerRef = useRef(null);

    useEffect(() => {
        setPageInput(String(pageNumber));
        onPageChange?.(pageNumber);
    }, [pageNumber, onPageChange]);

    const onDocumentLoadSuccess = useCallback(({ numPages: total }) => {
        setNumPages(total);
        setError(null);
        setPageNumber((prev) => Math.min(Math.max(prev, 1), total));
    }, []);

    const onDocumentLoadError = useCallback(() => {
        setError('تعذر تحميل الكتاب. يرجى المحاولة مرة أخرى لاحقاً.');
    }, []);

    const goToPage = useCallback((next) => {
        if (!numPages) return;
        setPageNumber(Math.min(Math.max(next, 1), numPages));
    }, [numPages]);

    const handlePageInputSubmit = (e) => {
        e.preventDefault();
        const next = parseInt(pageInput, 10);
        if (!Number.isNaN(next)) goToPage(next);
    };

    const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)));
    const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)));

    // Prevent right-click "save as" on the rendered canvas/page.
    const blockContextMenu = useCallback((e) => e.preventDefault(), []);

    const textLayerCustomTextRenderer = useMemo(() => {
        if (!searchTerm.trim()) return undefined;
        const term = searchTerm.trim();
        return ({ str }) => {
            if (!str.toLowerCase().includes(term.toLowerCase())) return str;
            const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return str.replace(regex, '<mark>$1</mark>');
        };
    }, [searchTerm]);

    if (error) {
        return (
            <div className="pdf-reader-error">
                <AlertTriangle size={40} />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="pdf-reader" onContextMenu={blockContextMenu}>
            <div className="pdf-reader-toolbar">
                <div className="toolbar-group">
                    <button type="button" onClick={() => goToPage(pageNumber + 1)} disabled={!numPages || pageNumber >= numPages} title="الصفحة التالية">
                        <ChevronRight size={18} />
                    </button>
                    <form className="page-jump" onSubmit={handlePageInputSubmit}>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            aria-label="رقم الصفحة"
                        />
                        <span>/ {numPages ?? '—'}</span>
                    </form>
                    <button type="button" onClick={() => goToPage(pageNumber - 1)} disabled={!numPages || pageNumber <= 1} title="الصفحة السابقة">
                        <ChevronLeft size={18} />
                    </button>
                </div>

                <div className="toolbar-group">
                    <button type="button" onClick={zoomOut} disabled={scale <= MIN_SCALE} title="تصغير">
                        <ZoomOut size={18} />
                    </button>
                    <span className="zoom-value">{Math.round(scale * 100)}%</span>
                    <button type="button" onClick={zoomIn} disabled={scale >= MAX_SCALE} title="تكبير">
                        <ZoomIn size={18} />
                    </button>
                </div>

                <div className="toolbar-group">
                    {searchOpen && (
                        <input
                            type="text"
                            className="search-input"
                            placeholder="ابحث داخل الصفحة الحالية..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    )}
                    <button
                        type="button"
                        onClick={() => { setSearchOpen((v) => !v); if (searchOpen) setSearchTerm(''); }}
                        title="بحث في الصفحة"
                        className={searchOpen ? 'active' : ''}
                    >
                        {searchOpen ? <X size={18} /> : <Search size={18} />}
                    </button>
                </div>
            </div>

            <div className="pdf-reader-canvas" ref={containerRef}>
                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                        <div className="pdf-reader-loading">
                            <Loader2 className="spin" size={32} />
                            <span>جاري تحميل الكتاب...</span>
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderAnnotationLayer={false}
                        customTextRenderer={textLayerCustomTextRenderer}
                    />
                </Document>
            </div>
        </div>
    );
};

export default PdfReader;
