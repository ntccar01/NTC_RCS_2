import { useState, useCallback } from 'react';

export function useNotification() {
  const [notification, setNotification] = useState('');

  const showToast = useCallback((msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  }, []);

  return { notification, showToast };
}
