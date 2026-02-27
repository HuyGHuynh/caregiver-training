import React, { useState, useRef, useEffect } from 'react';
import { useFontSize } from '../contexts/FontSizeContext';

const FontSizeDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { fontSize, fontSizes, changeFontSize } = useFontSize();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFontSizeChange = (size) => {
    changeFontSize(size);
    setIsOpen(false);
  };

  return (
    <div className="font-size-dropdown" ref={dropdownRef}>
      <button
        className="font-size-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Font Size Settings"
        aria-label="Font Size Settings"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="m12 1 2.09 2.09L16.18 1 17 1.82l-1.09 2.09L18 6l-1.82.82L14.09 8 16.18 10.09 17 9.27 16.18 8 18 6.18 16.82 5 14.09 7.73 12 5.64 9.91 7.73 7.18 5 6 6.18 7.82 8 7 9.27 7.82 10.09 5.91 8 4.09 6.82 6 6 4.82 1.82 1 2.64 2.09" />
        </svg>
      </button>

      {isOpen && (
        <div className="font-size-dropdown-menu">
          <div className="dropdown-header">
            <h3>Font Size</h3>
          </div>
          <div className="font-size-options">
            {Object.entries(fontSizes).map(([key, option]) => (
              <button
                key={key}
                className={`font-size-option ${fontSize === key ? 'active' : ''}`}
                onClick={() => handleFontSizeChange(key)}
                style={{ fontSize: `${option.scale}rem` }}
              >
                <span className="option-label">{option.label}</span>
                <span className="option-preview">Aa</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FontSizeDropdown;