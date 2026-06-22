import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary]', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        minHeight: '70vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ maxWidth: '560px' }}>
                        <AlertTriangle size={64} color="var(--color-accent)" style={{ marginBottom: '1rem' }} />
                        <h1 style={{ marginBottom: '0.75rem' }}>حدث خطأ غير متوقع</h1>
                        <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
                            نعتذر عن هذا العطل. جرّب إعادة تحميل الصفحة أو العودة إلى الرئيسية.
                        </p>
                        {this.state.error?.message && (
                            <details
                                style={{
                                    textAlign: 'start',
                                    background: 'var(--color-bg-secondary)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '1.5rem',
                                    fontSize: '0.85rem',
                                }}
                            >
                                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>تفاصيل فنية</summary>
                                <pre
                                    style={{
                                        marginTop: '0.75rem',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        direction: 'ltr',
                                        textAlign: 'left',
                                        color: 'var(--color-text-light)',
                                    }}
                                >
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                        <div style={{ display: 'inline-flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button onClick={this.handleReload} className="btn btn-primary">
                                <RotateCcw size={18} />
                                إعادة تحميل
                            </button>
                            <button onClick={this.handleHome} className="btn btn-accent">
                                <Home size={18} />
                                الرئيسية
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
