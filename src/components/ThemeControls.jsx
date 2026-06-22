import React from 'react';
import { Moon, Sun, Type, Minus, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeControls.css';

const ThemeControls = ({ compact = false }) => {
    const { isDark, toggleTheme, increaseFont, decreaseFont, fontSize } = useTheme();

    return (
        <div className={`theme-controls ${compact ? 'compact' : ''}`}>
            <div className="font-controls" role="group" aria-label="حجم الخط">
                <button
                    type="button"
                    onClick={decreaseFont}
                    aria-label="تصغير الخط"
                    className="theme-btn"
                    disabled={fontSize === 'sm'}
                >
                    <Minus size={16} />
                </button>
                <span className="font-icon" aria-hidden>
                    <Type size={16} />
                </span>
                <button
                    type="button"
                    onClick={increaseFont}
                    aria-label="تكبير الخط"
                    className="theme-btn"
                    disabled={fontSize === 'xl'}
                >
                    <Plus size={16} />
                </button>
            </div>

            <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'التبديل للوضع الفاتح' : 'التبديل للوضع الداكن'}
                className="theme-btn theme-toggle"
                title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
            >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </div>
    );
};

export default ThemeControls;
