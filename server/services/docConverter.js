const libre = require('libreoffice-convert');
const { promisify } = require('util');

const libreConvertAsync = promisify(libre.convert);

const WORD_EXTENSIONS = new Set(['.doc', '.docx']);
const WORD_MIMETYPES = new Set([
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function isWordFile(originalname, mimetype) {
    const ext = (originalname.match(/\.[^.]+$/)?.[0] || '').toLowerCase();
    return WORD_EXTENSIONS.has(ext) || WORD_MIMETYPES.has(mimetype);
}

/**
 * Converts a Word document buffer to PDF using a local LibreOffice install
 * (headless soffice). Throws a clear, user-facing error if LibreOffice is
 * not available on this host, rather than failing silently.
 */
async function convertWordBufferToPdf(buffer) {
    try {
        return await libreConvertAsync(buffer, '.pdf', undefined);
    } catch (err) {
        const notFound = /ENOENT|soffice|not found/i.test(err.message || '');
        const wrapped = new Error(
            notFound
                ? 'تعذر تحويل ملف Word: برنامج LibreOffice غير مثبت على السيرفر. يرجى رفع ملف PDF مباشرة أو التواصل مع الدعم الفني.'
                : 'تعذر تحويل ملف Word إلى PDF. يرجى التأكد من أن الملف غير تالف.'
        );
        wrapped.cause = err;
        throw wrapped;
    }
}

module.exports = { isWordFile, convertWordBufferToPdf };
