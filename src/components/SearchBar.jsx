import React from 'react';
import { Search } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import './SearchBar.css';

const SearchBar = ({
    search,
    onSearchChange,
    category,
    onCategoryChange,
    placeholder = 'ابحث...',
    showCategory = true,
}) => {
    return (
        <div className="search-bar-wrapper">
            <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                    type="search"
                    className="search-input"
                    placeholder={placeholder}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {showCategory && (
                <select
                    className="category-select"
                    value={category}
                    onChange={(e) => onCategoryChange(e.target.value)}
                >
                    <option value="">كل التصنيفات</option>
                    {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default SearchBar;
