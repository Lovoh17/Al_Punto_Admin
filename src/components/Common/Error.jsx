// src/components/Common/Error.jsx
import React from 'react';

const Error = ({ message }) => {
  return (
    <div style={{ 
      background: '#fee', 
      border: '1px solid #fcc', 
      padding: '1rem', 
      margin: '1rem 0',
      borderRadius: '4px',
      color: '#c33'
    }}>
      Error: {message}
    </div>
  );
};

export default Error;