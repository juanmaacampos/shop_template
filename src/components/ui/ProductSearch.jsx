import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenuIntegration } from '../../cms-menu/useMenu.js';
import { MENU_CONFIG } from '../../cms-menu/config.js';
import SearchBar from './SearchBar';
import { useMenu } from '../../context/MenuContext.jsx';
import './ProductSearch.css';

const flattenMenuItems = (menu) => {
  if (!Array.isArray(menu)) return [];
  return menu.flatMap(category =>
    (category.items || []).map(item => ({
      ...item,
      category: category.name,
    }))
  );
};

const getCategories = (menu) => {
  if (!Array.isArray(menu)) return [];
  return menu.map(category => ({
    id: category.id || category.name,
    name: category.name,
    type: 'category',
  }));
};

const ProductSearch = () => {
  const navigate = useNavigate();
  const { menu, loading, setSelectedCategory } = useMenuIntegration(MENU_CONFIG);
  // Intentar obtener setSelectedCategory del contexto global si existe
  let setCategory = null;
  try {
    setCategory = useMenu()?.setSelectedCategory;
  } catch {}
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef();
  const resultsRef = useRef();

  const allItems = useMemo(() => flattenMenuItems(menu), [menu]);
  const allCategories = useMemo(() => getCategories(menu), [menu]);

  // Buscar categorías y productos
  const { categoryResults, productResults } = useMemo(() => {
    if (!query.trim()) return { categoryResults: [], productResults: [] };
    const q = query.toLowerCase();
    // Solo mostrar categorías si hay al menos 3 caracteres
    const categoryResults = query.length >= 3
      ? allCategories.filter(cat =>
          cat.name && cat.name.toLowerCase().includes(q)
        ).slice(0, 3)
      : [];
    const productResults = allItems.filter(item =>
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    ).slice(0, 8);
    return { categoryResults, productResults };
  }, [query, allItems, allCategories]);

  useEffect(() => {
    setShowResults(!!query);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(e.target)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleResultClick = (result) => {
    setQuery('');
    setShowResults(false);
    if (result.type === 'category') {
      // Mostrar el catálogo entero y scrollear a la categoría
      // Quitar cualquier filtro de categoría antes de scrollear
      const menuSection = document.getElementById('menu');
      if (menuSection) {
        // Si hay un botón para limpiar filtro, hacer click
        const clearBtn = menuSection.querySelector('.clear-filter-btn');
        if (clearBtn) {
          clearBtn.click();
        }
      }
      setTimeout(() => {
        const el = document.getElementById(`category-${result.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          const menuEl = document.getElementById('menu');
          if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    } else {
      navigate(`/producto/${result.id}`);
    }
  };

  return (
    <div className="product-search-container" style={{minWidth: 0, width: '100%'}}>
      <div ref={inputRef} style={{width: '100%'}}>
        <SearchBar value={query} onChange={setQuery} placeholder="Buscar productos o categorías..." />
      </div>
      <div style={{position: 'relative', width: '100%'}}>
        {showResults && query && (
          <div ref={resultsRef}>
            {categoryResults.length > 0 && (
              <ul className="search-results-list">
                {categoryResults.map(cat => (
                  <li key={cat.id} className="search-result-item search-result-category" onClick={() => handleResultClick(cat)}>
                    <span className="result-name">{cat.name}</span>
                    <span className="result-category-label">Categoría</span>
                  </li>
                ))}
              </ul>
            )}
            {productResults.length > 0 && (
              <ul className="search-results-list">
                {productResults.map(item => (
                  <li key={item.id} className="search-result-item" onClick={() => handleResultClick(item)}>
                    <span className="result-name">{item.name}</span>
                    {item.category && <span className="result-category">({item.category})</span>}
                  </li>
                ))}
              </ul>
            )}
            {categoryResults.length === 0 && productResults.length === 0 && (
              <div className="no-results">No se encontraron resultados.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;
