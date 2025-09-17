import React from 'react';
import { Controller } from 'react-hook-form';

export const Form = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

export const FormField = ({ control, name, render }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => render({ field, fieldState })}
    />
  );
};

export const FormItem = ({ children, className = '' }) => {
  return <div className={`space-y-2 ${className}`}>{children}</div>;
};

export const FormLabel = ({ children, className = '' }) => {
  return <label className={`block text-sm font-medium text-gray-700 ${className}`}>{children}</label>;
};

export const FormControl = ({ children }) => {
  return <div>{children}</div>;
};

export const FormMessage = ({ children, className = '' }) => {
  if (!children) return null;
  return <p className={`text-sm text-red-600 ${className}`}>{children}</p>;
};
