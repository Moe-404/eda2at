export const CATEGORIES = [
    { value: 'tafsir', label: 'تفسير وعلوم القرآن' },
    { value: 'fiqh_ibadat', label: 'فقه العبادات' },
    { value: 'fiqh_muamalat', label: 'فقه المعاملات' },
    { value: 'fiqh_usra', label: 'فقه الأسرة' },
    { value: 'aqidah', label: 'العقيدة' },
    { value: 'tazkiyah', label: 'التزكية والآداب' },
    { value: 'nawazil', label: 'قضايا معاصرة ونوازل' },
    { value: 'seerah', label: 'السيرة والتاريخ' },
    { value: 'usul', label: 'أصول الفقه والمقاصد' },
    { value: 'other', label: 'عام' },
];

export const CATEGORY_MAP = Object.fromEntries(
    CATEGORIES.map((c) => [c.value, c.label])
);

export const categoryLabel = (value) => CATEGORY_MAP[value] || 'عام';
