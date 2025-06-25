import React from 'react';
import './SearchBar.css';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ value, onChange, placeholder = 'Buscar productos...' }) => {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-bar-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar"
      />
      <FaSearch className="search-bar-icon" />
    </div>
  );
};

export default SearchBar;
