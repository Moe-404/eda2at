import React from 'react';
import { Helmet } from 'react-helmet-async';

const DEFAULTS = {
    siteName: 'إضاءات',
    baseTitle: 'إضاءات - رؤية شرعية إصلاحية',
    description:
        'إضاءات - رؤية شرعية إصلاحية تقدّم خطاباً علمياً يجمع بين التأصيل وفهم الواقع، ومعالجة قضايا الفرد والأسرة والمجتمع.',
    image: '/idaat logo.png',
};

const SEO = ({
    title,
    description = DEFAULTS.description,
    image = DEFAULTS.image,
    type = 'website',
    canonical,
    jsonLd,
    keywords,
}) => {
    const pageTitle = title ? `${title} | ${DEFAULTS.siteName}` : DEFAULTS.baseTitle;
    const url = canonical || (typeof window !== 'undefined' ? window.location.href : '');
    const absoluteImage =
        image?.startsWith('http') || typeof window === 'undefined'
            ? image
            : `${window.location.origin}${image.startsWith('/') ? '' : '/'}${image}`;

    return (
        <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            {url && <link rel="canonical" href={url} />}

            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={DEFAULTS.siteName} />
            <meta property="og:locale" content="ar_AR" />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={description} />
            {url && <meta property="og:url" content={url} />}
            {absoluteImage && <meta property="og:image" content={absoluteImage} />}

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={description} />
            {absoluteImage && <meta name="twitter:image" content={absoluteImage} />}

            {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
        </Helmet>
    );
};

export default SEO;
