import { useState, useCallback } from 'react';

export function useSnackbar() {
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });

  const showSnackbar = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setSnackbar({ visible: true, message, type });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, visible: false }));
  }, []);

  return { snackbar, showSnackbar, hideSnackbar };
}
