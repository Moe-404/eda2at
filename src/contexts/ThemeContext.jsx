import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEYS = {
    theme: 'idaat:theme',
    fontSize: 'idaat:font-size',
};

const FONT_SIZES = ['sm', 'md', 'lg', 'xl'];

const getInitial = (key, fallback, allowed) => {
    if (typeof window === 'undefined') return fallback;
    const stored = localStorage.getItem(key);
    if (stored && (!allowed || allowed.includes(stored))) return stored;
    return fallback;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const stored = getInitial(STORAGE_KEYS.theme, null, ['light', 'dark']);
        if (stored) return stored;
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    const [fontSize, setFontSize] = useState(() =>
        getInitial(STORAGE_KEYS.fontSize, 'md', FONT_SIZES)
    );

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEYS.theme, theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.setAttribute('data-font-size', fontSize);
        localStorage.setItem(STORAGE_KEYS.fontSize, fontSize);
    }, [fontSize]);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    const increaseFont = useCallback(() => {
        setFontSize((prev) => {
            const idx = FONT_SIZES.indexOf(prev);
            return FONT_SIZES[Math.min(idx + 1, FONT_SIZES.length - 1)];
        });
    }, []);

    const decreaseFont = useCallback(() => {
        setFontSize((prev) => {
            const idx = FONT_SIZES.indexOf(prev);
            return FONT_SIZES[Math.max(idx - 1, 0)];
        });
    }, []);

    const resetFont = useCallback(() => setFontSize('md'), []);

    const value = useMemo(
        () => ({
            theme,
            fontSize,
            isDark: theme === 'dark',
            toggleTheme,
            increaseFont,
            decreaseFont,
            resetFont,
            setTheme,
            setFontSize,
        }),
        [theme, fontSize, toggleTheme, increaseFont, decreaseFont, resetFont]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};
