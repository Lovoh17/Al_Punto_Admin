import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import logoBlanco from '../../assets/Images/Logos/logo_Blanco.jpg';

const LightNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/productos', label: 'Productos' },
    { path: '/Menu-Dias', label: 'Menus Diarios' },
    { path: '/pedidos', label: 'Pedidos' },
    { path: '/Usuarios', label: 'Usuarios' }
  ];

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      height: '70px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 32px',
        height: '100%'
      }}>
        
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <img 
              src={logoBlanco} 
              alt="Logo Restaurant" 
              style={{
                height: '45px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>
        </Link>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center'
        }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                color: location.pathname === item.path ? '#1e40af' : '#4b5563',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: location.pathname === item.path ? '600' : '500',
                padding: '8px 0',
                position: 'relative',
                transition: 'color 0.2s'
              }}
            >
              {item.label}
              {location.pathname === item.path && (
                <div style={{
                  position: 'absolute',
                  bottom: '-10px',
                  left: 0,
                  right: 0,
                  height: '3px',
                  backgroundColor: '#1e40af',
                  borderRadius: '2px'
                }} />
              )}
            </Link>
          ))}
        </div>

        {/* User */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            textAlign: 'right'
          }}>
            <div style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#111827'
            }}>
              {user?.nombre || 'Usuario'}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#6b7280'
            }}>
              {user?.rol || 'Administrador'}
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              color: '#374151',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};

export default LightNavbar;