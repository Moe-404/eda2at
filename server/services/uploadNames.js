// Busboy (via multer) decodes the filename in a multipart header as latin1, so
// an Arabic filename arrives as mojibake and ends up unreadable in both the
// stored filename and the public URL built from it. Re-decode those bytes as
// the UTF-8 they actually are.
//
// Every latin1-decoded character sits at or below U+00FF, so anything above
// that means the name already came through as proper UTF-8 and re-decoding it
// would be the thing that corrupts it.
const decodeOriginalName = (originalname = '') => {
    for (const char of originalname) {
        if (char.codePointAt(0) > 0xff) return originalname;
    }
    return Buffer.from(originalname, 'latin1').toString('utf8');
};

module.exports = { decodeOriginalName };
