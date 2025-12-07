// src/components/Layout/ClientNavbar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const ClientNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/menu" style={styles.logoContainer}>
          <div style={styles.logo}>
            <span style={styles.logoText}>Alpunto</span>
            <span style={styles.flame}>🔥</span>
          </div>
        </Link>
        
        {/* Navigation Items */}
        <div style={styles.navItems}>
          <Link
            to="/menu"
            style={{
              ...styles.navLink,
              ...(location.pathname === '/menu' ? styles.navLinkActive : {})
            }}
          >
            <span style={styles.navIcon}>🍽️</span>
            <span>Menú</span>
          </Link>
        </div>

        {/* User Section */}
        <div style={styles.userSection}>
          <div style={styles.userProfile}>
            <div style={styles.avatar}>👤</div>
            <span style={styles.userName}>{user?.nombre || 'Cliente'}</span>
          </div>
          
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <span>🚪</span>
            <span>Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const colors = {
  primary: {
    red: '#E74C3C',
    redDark: '#C0392B',
    orange: '#F39C12',
    black: '#2C3E50',
  },
  neutral: {
    white: '#FFFFFF',
    lightGray: '#ECF0F1',
    darkGray: '#34495E',
  }
};

const styles = {
  nav: {
    background: `linear-gradient(135deg, ${colors.primary.black} 0%, ${colors.neutral.darkGray} 100%)`,
    boxShadow: '0 4px 20px rgba(231, 76, 60, 0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    borderBottom: `3px solid ${colors.primary.red}`
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
    height: '70px'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    cursor: 'pointer'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  logoText: {
    fontSize: '28px',
    fontWeight: '900',
    background: `linear-gradient(135deg, ${colors.primary.red} 0%, ${colors.primary.orange} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontFamily: '"Brush Script MT", cursive',
    letterSpacing: '1px'
  },
  flame: {
    fontSize: '24px',
    animation: 'flicker 1.5s infinite alternate'
  },
  navItems: {
    display: 'flex',
    gap: '16px'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: colors.neutral.white,
    textDecoration: 'none',
    padding: '10px 24px',
    borderRadius: '8px',
    background: 'transparent',
    transition: 'all 0.3s ease',
    fontSize: '16px',
    fontWeight: '600',
    border: '2px solid transparent'
  },
  navLinkActive: {
    background: `linear-gradient(135deg, ${colors.primary.red}20 0%, ${colors.primary.orange}20 100%)`,
    color: colors.primary.red,
    border: `2px solid ${colors.primary.red}40`
  },
  navIcon: {
    fontSize: '20px'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    background: `${colors.neutral.white}10`,
    borderRadius: '12px',
    border: `2px solid ${colors.neutral.white}20`
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.primary.red} 0%, ${colors.primary.orange} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.neutral.white
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'transparent',
    border: `2px solid ${colors.primary.red}40`,
    borderRadius: '8px',
    color: colors.neutral.white,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

// Hover styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    nav button:hover {
      background: ${colors.primary.red}20 !important;
      border-color: ${colors.primary.red} !important;
      transform: translateY(-2px);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ClientNavbar;