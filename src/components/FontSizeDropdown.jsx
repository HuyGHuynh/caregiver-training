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
          <path d="M12 1v6l4-4-4-4z" />
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