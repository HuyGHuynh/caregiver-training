import React, { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext();

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};

export const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(() => {
    // Get stored font size from localStorage or use default
    const stored = localStorage.getItem('fontSize');
    return stored || 'large';
  });

  // Font size options
  const fontSizes = {
    small: {
      label: 'Small',
      value: 'small',
      scale: 0.875, // 14px base
    },
    medium: {
      label: 'Medium',
      value: 'medium',
      scale: 1, // 16px base (default)
    },
    large: {
      label: 'Large',
      value: 'large',
      scale: 1.125, // 18px base
    },
    'extra-large': {
      label: 'Extra Large',
      value: 'extra-large',
      scale: 1.25, // 20px base
    },
  };

  // Apply font size to document root
  useEffect(() => {
    const scale = fontSizes[fontSize]?.scale || 1;
    document.documentElement.style.setProperty('--font-size-scale', scale);
    document.documentElement.setAttribute('data-font-size', fontSize);
    
    // Store in localStorage
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize, fontSizes]);

  const changeFontSize = (newSize) => {
    if (fontSizes[newSize]) {
      setFontSize(newSize);
    }
  };

  const value = {
    fontSize,
    fontSizes,
    changeFontSize,
    currentFontSize: fontSizes[fontSize],
  };

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
};