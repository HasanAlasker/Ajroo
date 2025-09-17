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
    isLoading: false,
    type: 'confirm', // 'confirm' or 'info'
  });

  const showAlert = ({
    title = 'Are you sure?',
    message = '',
    onConfirm,
    onCancel,
    confirmText = 'Yes',
    cancelText = 'No',
    type = 'confirm', // 'confirm' or 'info'
  }) => {
    setAlertConfig({
      isVisible: true,
      title,
      message,
      onConfirm,
      onCancel,
      confirmText: type === 'info' ? 'OK' : confirmText,
      cancelText,
      type,
      isLoading: false,
    });
  };

  // Convenience method for info alerts
  const showInfo = ({
    title = 'Information',
    message = '',
    onConfirm,
    confirmText = 'OK',
  }) => {
    showAlert({
      title,
      message,
      onConfirm,
      confirmText,
      type: 'info',
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, isVisible: false }));
  };

  const handleConfirm = async () => {
    if (alertConfig.onConfirm) {
      setAlertConfig(prev => ({ ...prev, isLoading: true }));
      try {
        await alertConfig.onConfirm();
        hideAlert();
      } catch (error) {
        console.error('Error in alert confirm:', error);
        setAlertConfig(prev => ({ ...prev, isLoading: false }));
        // Optionally show error in the alert or hide it
        hideAlert();
      }
    } else {
      hideAlert();
    }
  };

  const handleCancel = () => {
    alertConfig.onCancel?.();
    hideAlert();
  };

  return (
    <AlertContext.Provider 
      value={{ 
        showAlert, 
        showInfo,
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