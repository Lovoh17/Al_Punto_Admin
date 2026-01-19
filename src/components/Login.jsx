// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { login, loading, error, setError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting || loading) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await login(email, password);
      
      const redireccion = result.redireccion || localStorage.getItem('redireccion') || '/cliente/menu';
      window.location.href = redireccion;
      
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
  <img 
    src="src\assets\Images\Logos\logo-remove.png" 
    alt="Logo del Restaurante" 
    style={styles.logoImage}
    onError={(e) => {
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'flex';
    }}
  />
  
</div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorAlert}>
              <div style={styles.errorIcon}>!</div>
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          {/* Campo Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <div style={styles.inputContainer}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
                disabled={loading || isSubmitting}
                style={styles.input}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputContainer}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading || isSubmitting}
                style={styles.input}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
                tabIndex={-1}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          

          {/* Botón de inicio de sesión */}
          <button
            type="submit"
            disabled={loading || isSubmitting}
            style={{
              ...styles.submitButton,
              ...((loading || isSubmitting) ? styles.submitButtonDisabled : {})
            }}
          >
            {(loading || isSubmitting) ? (
              <span>Iniciando sesión...</span>
            ) : (
              <span>Iniciar Sesión</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            © 2025 Alpunto · Sistema de Gestión de Comandas
          </p>
        </div>
      </div>
    </div>
  );
};

// Estilos responsivos
const colors = {
  primary: { red: '#E74C3C', redDark: '#C0392B', orange: '#F39C12', black: '#2C3E50' },
  neutral: { white: '#FFFFFF', black: '#1A1A1A', gray: '#95A5A6', lightGray: '#ECF0F1' },
  bg: { light: '#FFF5F0', cream: '#FDF6E3' }
};

const styles = {
  container: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${colors.bg.light} 0%, ${colors.bg.cream} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loginCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(231, 76, 60, 0.15)',
    width: '100%',
    maxWidth: '440px',
    padding: '40px 32px',
    border: `2px solid ${colors.primary.red}20`,
    '@media (max-width: 480px)': {
      padding: '32px 24px',
      maxWidth: '100%',
      borderRadius: '12px',
    },
  },
  header: { 
    textAlign: 'center', 
    marginBottom: '32px',
    '@media (max-width: 480px)': {
      marginBottom: '24px',
    },
  },
  logo: { 
    display: 'flex', 
    justifyContent: 'center', 
    marginBottom: '20px',
  },
  logoText: {
    fontSize: '36px',
    fontWeight: '900',
    color: colors.primary.black,
    fontFamily: '"Brush Script MT", cursive',
    letterSpacing: '2px',
    '@media (max-width: 480px)': {
      fontSize: '32px',
    },
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: colors.primary.black,
    margin: '0 0 8px 0',
    '@media (max-width: 480px)': {
      fontSize: '24px',
    },
  },
  subtitle: { 
    fontSize: '15px', 
    color: colors.primary.black, 
    margin: '0', 
    fontWeight: '400', 
    opacity: 0.8,
    '@media (max-width: 480px)': {
      fontSize: '14px',
    },
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px',
    '@media (max-width: 480px)': {
      gap: '16px',
    },
  },
  errorAlert: {
    backgroundColor: '#FEE2E2',
    border: `2px solid ${colors.primary.red}`,
    borderRadius: '8px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    '@media (max-width: 480px)': {
      padding: '12px',
    },
  },
  errorIcon: {
    width: '22px',
    height: '22px',
    backgroundColor: colors.primary.red,
    color: colors.neutral.white,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
  },
  errorText: { 
    color: colors.primary.redDark, 
    fontSize: '14px', 
    fontWeight: '500',
    '@media (max-width: 480px)': {
      fontSize: '13px',
    },
  },
  inputGroup: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px',
  },
  label: { 
    fontSize: '14px', 
    fontWeight: '600', 
    color: colors.primary.black,
    '@media (max-width: 480px)': {
      fontSize: '13px',
    },
  },
  inputContainer: { 
    position: 'relative', 
    display: 'flex', 
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: `2px solid ${colors.neutral.lightGray}`,
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    '&:focus': {
      borderColor: colors.primary.red,
      boxShadow: `0 0 0 3px ${colors.primary.red}20`,
    },
    '@media (max-width: 480px)': {
      padding: '12px 14px',
      fontSize: '14px',
    },
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    '@media (max-width: 480px)': {
      fontSize: '16px',
      right: '10px',
    },
  },
  options: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: '-4px',
    '@media (max-width: 480px)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '12px',
    },
  },
  checkboxLabel: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    fontSize: '14px', 
    cursor: 'pointer',
    '@media (max-width: 480px)': {
      fontSize: '13px',
    },
  },
  checkbox: { 
    width: '18px', 
    height: '18px', 
    cursor: 'pointer', 
    accentColor: colors.primary.red,
    '@media (max-width: 480px)': {
      width: '16px',
      height: '16px',
    },
  },
  forgotPassword: {
    background: 'none',
    border: 'none',
    color: colors.primary.red,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0',
    textAlign: 'right',
    '&:hover': {
      textDecoration: 'underline',
    },
    '@media (max-width: 480px)': {
      fontSize: '13px',
      textAlign: 'left',
    },
  },
  submitButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: colors.primary.red,
    color: colors.neutral.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
    marginTop: '8px',
    '&:hover:not(:disabled)': {
      backgroundColor: colors.primary.redDark,
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(231, 76, 60, 0.4)',
    },
    '&:active:not(:disabled)': {
      transform: 'translateY(0)',
    },
    '@media (max-width: 480px)': {
      padding: '14px',
      fontSize: '15px',
    },
  },
  submitButtonDisabled: { 
    backgroundColor: colors.neutral.gray, 
    cursor: 'not-allowed', 
    boxShadow: 'none',
    '&:hover': {
      transform: 'none',
      backgroundColor: colors.neutral.gray,
    },
  },
  separator: {
    textAlign: 'center',
    position: 'relative',
    margin: '16px 0',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '1px',
      backgroundColor: colors.neutral.lightGray,
    },
  },
  separatorText: {
    backgroundColor: colors.neutral.white,
    padding: '0 16px',
    fontSize: '14px',
    color: colors.neutral.gray,
    fontWeight: '500',
    position: 'relative',
    '@media (max-width: 480px)': {
      fontSize: '13px',
    },
  },
  registerButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'transparent',
    color: colors.primary.black,
    border: `2px solid ${colors.neutral.lightGray}`,
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: colors.primary.red,
      backgroundColor: `${colors.primary.red}10`,
    },
    '@media (max-width: 480px)': {
      padding: '12px',
      fontSize: '14px',
    },
  },
  footer: { 
    marginTop: '32px', 
    textAlign: 'center', 
    paddingTop: '24px', 
    borderTop: `1px solid ${colors.neutral.lightGray}`,
    '@media (max-width: 480px)': {
      marginTop: '24px',
      paddingTop: '20px',
    },
  },
  footerText: { 
    fontSize: '13px', 
    color: colors.neutral.gray, 
    margin: '0',
    '@media (max-width: 480px)': {
      fontSize: '12px',
    },
  },
};

// Aplicar estilos responsivos
Object.keys(styles).forEach(key => {
  if (styles[key]['@media (max-width: 480px)']) {
    const originalStyle = { ...styles[key] };
    const mediaStyle = originalStyle['@media (max-width: 480px)'];
    delete originalStyle['@media (max-width: 480px)'];
    
    // Convertir a objeto plano con media queries inline
    styles[key] = {
      ...originalStyle,
      [`@media (max-width: 480px)`]: mediaStyle
    };
  }
});

export default Login;