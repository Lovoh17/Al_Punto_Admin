// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // 🔥 NUEVO
  
  const navigate = useNavigate();
  const { login, loading, error, setError } = useAuth();

  // 🔍 Función para agregar logs de debug
  const addDebugLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      time: timestamp,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    setDebugInfo(prev => [...prev, logEntry]);
    console.log(`[${timestamp}] ${message}`, data || '');
  };

  // 🔥 CORREGIDO: Prevenir múltiples submits
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🛡️ Prevenir múltiples llamadas
    if (isSubmitting || loading) {
      addDebugLog('⚠️ Submit bloqueado - Ya hay una petición en curso');
      return;
    }
    
    setIsSubmitting(true);
    setDebugInfo([]); // Limpiar logs anteriores
    setError(null); // Limpiar errores previos
    
    try {
      addDebugLog('🚀 Iniciando login...', { email });
      
      const result = await login(email, password);
      
      addDebugLog('✅ Login exitoso', result);
      
      // Obtener redirección
      const redireccion = result.redireccion || localStorage.getItem('redireccion') || '/cliente/menu';
      
      addDebugLog('🎯 Redirigiendo a:', redireccion);
      
      // 🔥 Usar replace para evitar que se quede en el historial
      // y forzar la navegación inmediata
      window.location.href = redireccion;
      
    } catch (err) {
      addDebugLog('❌ Error en login', {
        message: err.message,
        response: err.response?.data
      });
      setIsSubmitting(false); // Solo liberar si hay error
    }
  };

  const handleDemoLogin = async (role = 'admin') => {
    // 🛡️ Prevenir múltiples llamadas
    if (isSubmitting || loading) {
      return;
    }

    const demoAccounts = {
      admin: { email: 'admin@restaurant.com', password: 'admin123' },
      mesero: { email: 'mesero@restaurant.com', password: 'mesero123' },
      cocina: { email: 'cocina@restaurant.com', password: 'cocina123' }
    };
    
    addDebugLog(`🎭 Cuenta demo seleccionada: ${role}`);
    
    // 🔥 Hacer login directamente con las credenciales demo
    setIsSubmitting(true);
    setDebugInfo([]);
    setError(null);
    
    try {
      const result = await login(demoAccounts[role].email, demoAccounts[role].password);
      
      addDebugLog('✅ Login demo exitoso', result);
      
      const redireccion = result.redireccion || '/cliente/menu';
      addDebugLog('🎯 Redirigiendo a:', redireccion);
      
      navigate(redireccion, { replace: true });
      
    } catch (err) {
      addDebugLog('❌ Error en login demo', {
        message: err.message,
        response: err.response?.data
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* 🐛 Panel de Debug */}
      {showDebug && debugInfo.length > 0 && (
        <div style={styles.debugPanel}>
          <div style={styles.debugHeader}>
            <h3 style={styles.debugTitle}>🐛 Debug Console</h3>
            <button 
              onClick={() => setShowDebug(false)}
              style={styles.debugClose}
            >
              ✕
            </button>
          </div>
          <div style={styles.debugContent}>
            {debugInfo.map((log, index) => (
              <div key={index} style={styles.debugLog}>
                <span style={styles.debugTime}>[{log.time}]</span>
                <span style={styles.debugMessage}>{log.message}</span>
                {log.data && (
                  <pre style={styles.debugData}>{log.data}</pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.loginCard}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <span style={styles.logoText}>Alpunto</span>
              <div style={styles.flame}>🔥</div>
            </div>
          </div>
          <h1 style={styles.title}>Alpunto</h1>
          <p style={styles.subtitle}>Sistema de Gestión de Comandas</p>
        </div>

        {/* 🔥 CORREGIDO: Ahora es un FORM real */}
        <form id="login-form" onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorAlert}>
              <div style={styles.errorIcon}>!</div>
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          {/* 🐛 Botón para mostrar debug */}
          {debugInfo.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDebug(!showDebug)}
              style={styles.debugButton}
            >
              {showDebug ? '🐛 Ocultar Debug' : `🐛 Ver Debug (${debugInfo.length})`}
            </button>
          )}

          {/* Campo Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <div style={styles.inputContainer}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@alpunto.com"
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

          {/* Opciones adicionales */}
          <div style={styles.options}>
            <label style={styles.checkboxLabel}>
              <input type="checkbox" style={styles.checkbox} />
              Recordar sesión
            </label>
            <button type="button" style={styles.forgotPassword}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* 🔥 CORREGIDO: Botón tipo SUBMIT */}
          <button
            type="submit"
            disabled={loading || isSubmitting}
            style={{
              ...styles.submitButton,
              ...((loading || isSubmitting) ? styles.submitButtonDisabled : {})
            }}
          >
            {(loading || isSubmitting) ? (
              <span>⏳ Iniciando sesión...</span>
            ) : (
              <span>🔥 Iniciar Sesión</span>
            )}
          </button>
        </form>

        {/* Cuentas de demostración */}
        <div style={styles.demoSection}>
          <div style={styles.divider}>
            <span style={styles.dividerText}>O prueba con</span>
          </div>
          <div style={styles.demoButtons}>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading || isSubmitting}
              style={styles.demoButton}
            >
              👨‍💼 Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('mesero')}
              disabled={loading || isSubmitting}
              style={styles.demoButton}
            >
              🍽️ Mesero
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('cocina')}
              disabled={loading || isSubmitting}
              style={styles.demoButton}
            >
              👨‍🍳 Cocina
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            © 2024 Alpunto 🔥 · Sistema de Gestión de Comandas
          </p>
        </div>
      </div>
    </div>
  );
};

// 🎨 Estilos
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
    position: 'relative'
  },
  loginCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(231, 76, 60, 0.15)',
    width: '100%',
    maxWidth: '440px',
    padding: '48px 40px',
    border: `2px solid ${colors.primary.red}20`,
  },
  header: { textAlign: 'center', marginBottom: '40px' },
  logo: { display: 'flex', justifyContent: 'center', marginBottom: '24px' },
  logoIcon: { position: 'relative', display: 'inline-block' },
  logoText: {
    fontSize: '36px',
    fontWeight: '900',
    color: colors.primary.black,
    fontFamily: '"Brush Script MT", cursive',
    letterSpacing: '2px'
  },
  flame: { position: 'absolute', top: '-8px', right: '-20px', fontSize: '32px' },
  title: {
    fontSize: '32px',
    fontWeight: '900',
    background: `linear-gradient(135deg, ${colors.primary.red} 0%, ${colors.primary.orange} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 8px 0',
    fontFamily: '"Brush Script MT", cursive'
  },
  subtitle: { fontSize: '15px', color: colors.primary.black, margin: '0', fontWeight: '500', opacity: 0.8 },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  errorAlert: {
    backgroundColor: '#FEE2E2',
    border: `2px solid ${colors.primary.red}`,
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  errorIcon: {
    width: '24px',
    height: '24px',
    backgroundColor: colors.primary.red,
    color: colors.neutral.white,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700'
  },
  errorText: { color: colors.primary.redDark, fontSize: '14px', fontWeight: '500' },
  debugButton: {
    padding: '12px',
    backgroundColor: '#F0F0F0',
    border: '2px solid #DDD',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600', color: colors.primary.black },
  inputContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: `2px solid ${colors.neutral.lightGray}`,
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer'
  },
  options: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-8px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer', accentColor: colors.primary.red },
  forgotPassword: {
    background: 'none',
    border: 'none',
    color: colors.primary.red,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
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
    boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'
  },
  submitButtonDisabled: { backgroundColor: colors.neutral.gray, cursor: 'not-allowed', boxShadow: 'none' },
  demoSection: { marginTop: '40px' },
  divider: { textAlign: 'center', marginBottom: '24px' },
  dividerText: {
    backgroundColor: colors.neutral.white,
    padding: '0 16px',
    fontSize: '13px',
    color: colors.neutral.gray,
    fontWeight: '600'
  },
  demoButtons: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  demoButton: {
    padding: '12px 8px',
    backgroundColor: colors.bg.light,
    border: `2px solid ${colors.primary.orange}40`,
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  footer: { marginTop: '32px', textAlign: 'center', paddingTop: '24px', borderTop: `1px solid ${colors.neutral.lightGray}` },
  footerText: { fontSize: '13px', color: colors.neutral.gray, margin: '0' },
  debugPanel: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '400px',
    maxHeight: '80vh',
    backgroundColor: '#1E1E1E',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    zIndex: 1000,
    overflow: 'hidden',
    border: '2px solid #333'
  },
  debugHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#2D2D2D',
    borderBottom: '1px solid #404040'
  },
  debugTitle: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#FFF' },
  debugClose: { background: 'none', border: 'none', color: '#999', fontSize: '20px', cursor: 'pointer', padding: '4px 8px' },
  debugContent: {
    padding: '16px',
    maxHeight: 'calc(80vh - 60px)',
    overflowY: 'auto',
    fontSize: '13px',
    fontFamily: 'Monaco, Consolas, monospace'
  },
  debugLog: { marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #333' },
  debugTime: { color: '#888', fontSize: '11px', display: 'block', marginBottom: '4px' },
  debugMessage: { color: '#FFF', display: 'block', marginBottom: '8px' },
  debugData: {
    backgroundColor: '#0D0D0D',
    padding: '12px',
    borderRadius: '4px',
    color: '#4EC9B0',
    fontSize: '11px',
    overflowX: 'auto',
    margin: 0
  }
};

export default Login;