import React, { useState } from 'react';
import { Check, Copy, Send } from 'lucide-react';
import './ShareButtons.css';

const WhatsAppIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...props}>
        <path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12c0 2.1.55 4.15 1.6 5.95L0 24l6.2-1.62A11.96 11.96 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.22-3.48-8.52zM12 22a10 10 0 01-5.09-1.4l-.36-.21-3.67.96.98-3.58-.24-.37A9.99 9.99 0 1122 12a9.99 9.99 0 01-10 10zm5.45-7.55c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47a8.9 8.9 0 01-1.65-2.05c-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.11 3.22 5.11 4.52.72.3 1.27.48 1.7.61.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
    </svg>
);

const TelegramIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...props}>
        <path d="M9.78 15.72l-.35 4.77c.5 0 .72-.21.99-.47l2.37-2.23 4.91 3.58c.9.5 1.54.24 1.78-.83L23.87 3.9c.31-1.3-.48-1.8-1.35-1.48L1.37 10.5c-1.27.5-1.25 1.22-.22 1.54l5.43 1.7L18.92 6.06c.59-.38 1.13-.17.69.22"/>
    </svg>
);

const XIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...props}>
        <path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.9l-5.41-7.07L3.9 22H.6l8.02-9.17L.5 2h7.03l4.9 6.47L18.244 2zm-1.21 18h1.9L7.02 3.9H5.02L17.034 20z"/>
    </svg>
);

const FacebookIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...props}>
        <path d="M22 12a10 10 0 10-11.56 9.88v-7h-2.5V12h2.5V9.8c0-2.48 1.47-3.85 3.73-3.85 1.08 0 2.2.2 2.2.2v2.43h-1.24c-1.22 0-1.6.76-1.6 1.54V12h2.72l-.43 2.88h-2.29v7A10 10 0 0022 12z"/>
    </svg>
);

const ShareButtons = ({ url, title = '', quote = '', compact = false }) => {
    const [copied, setCopied] = useState(false);
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const shareText = [title, quote].filter(Boolean).join(' — ');

    const encoded = {
        url: encodeURIComponent(shareUrl),
        text: encodeURIComponent(shareText ? `${shareText}\n${shareUrl}` : shareUrl),
        title: encodeURIComponent(shareText),
    };

    const targets = [
        {
            key: 'whatsapp',
            label: 'واتساب',
            href: `https://wa.me/?text=${encoded.text}`,
            Icon: WhatsAppIcon,
            color: '#25D366',
        },
        {
            key: 'telegram',
            label: 'تيليجرام',
            href: `https://t.me/share/url?url=${encoded.url}&text=${encoded.title}`,
            Icon: TelegramIcon,
            color: '#26A5E4',
        },
        {
            key: 'x',
            label: 'X (تويتر)',
            href: `https://twitter.com/intent/tweet?url=${encoded.url}&text=${encoded.title}`,
            Icon: XIcon,
            color: '#111',
        },
        {
            key: 'facebook',
            label: 'فيسبوك',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encoded.url}&quote=${encoded.title}`,
            Icon: FacebookIcon,
            color: '#1877F2',
        },
    ];

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title || 'إضاءات',
                    text: quote || title,
                    url: shareUrl,
                });
            } catch (_) { /* user cancelled */ }
        }
    };

    return (
        <div className={`share-buttons ${compact ? 'compact' : ''}`} dir="ltr">
            <span className="share-label" dir="rtl">مشاركة:</span>
            {targets.map(({ key, label, href, Icon, color }) => (
                <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`مشاركة عبر ${label}`}
                    title={label}
                    className="share-btn"
                    style={{ '--brand': color }}
                >
                    <Icon />
                </a>
            ))}
            <button
                type="button"
                onClick={handleCopy}
                aria-label="نسخ الرابط"
                title={copied ? 'تم النسخ' : 'نسخ الرابط'}
                className={`share-btn copy ${copied ? 'copied' : ''}`}
            >
                {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
            {typeof navigator !== 'undefined' && navigator.share && (
                <button
                    type="button"
                    onClick={handleNativeShare}
                    aria-label="مشاركة"
                    title="مشاركة"
                    className="share-btn native"
                >
                    <Send size={18} />
                </button>
            )}
        </div>
    );
};

export default ShareButtons;
