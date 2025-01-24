import React, { useState, useEffect } from 'react';
import './AnnouncementBar.css';

const AnnouncementBar = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Simula si estamos en un curso o no (cambiar esto según tu lógica real)
 // const isInCourse = window.location.pathname.includes('/curso');

  // Efecto para recuperar el estado del tema desde localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  // Añadir margen superior al siguiente elemento después de la barra de anuncios
  useEffect(() => {
    const adjustMarginTop = () => {
      const announcementBar = document.querySelector('.announcement-bar');
      const nextElement = announcementBar.nextElementSibling;
      if (announcementBar && nextElement) {
        nextElement.style.marginTop = `${announcementBar.offsetHeight}px`;
      }
    };

    adjustMarginTop();
    window.addEventListener('resize', adjustMarginTop); // Recalcula el margen al redimensionar

    return () => {
      window.removeEventListener('resize', adjustMarginTop);
    };
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    const theme = newDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <div className={`announcement-bar ${darkMode ? 'dark-mode' : ''}`}>
      <p>Unite al grupo de Telegram</p>
      <button
        className="cta-button"
        onClick={() => window.open('https://t.me/tu_grupo_telegram', '_blank')}
      >
        Unirme
      </button>
      <input
        type="checkbox"
        className="toggle-button"
        checked={darkMode}
        onChange={toggleDarkMode}
      />
    </div>
  );
};

export default AnnouncementBar;
