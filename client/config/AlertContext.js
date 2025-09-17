import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState({
    isVisible: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Yes',
    cancelText: 'No',
  });

  const showAlert = ({
    title = 'Are you sure?',
    message = '',
    onConfirm,
    onCancel,
    confirmText = 'Yes',
    cancelText = 'No',
  }) => {
    setAlertConfig({
      isVisible: true,
      title,
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, isVisible: false }));
  };

  const handleConfirm = () => {
    alertConfig.onConfirm?.();
    hideAlert();
  };

  const handleCancel = () => {
    alertConfig.onCancel?.();
    hideAlert();
  };

  return (
    <AlertContext.Provider 
      value={{ 
        showAlert, 
        hideAlert, 
        alertConfig,
        handleConfirm,
        handleCancel 
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

// Custom hook for easy access
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};