import React from 'react';

export const Button = ({ children, className = '', type = 'button', ...props }) => {
  return (
    <button
      type={type}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};
