import { useState, useEffect, useCallback } from 'react';

export function useContactPicker() {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if Contact Picker API is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'contacts' in navigator && 'ContactsManager' in window;
      console.log('[ContactPicker] Browser support check:', {
        hasContactsAPI: 'contacts' in navigator,
        hasContactsManager: 'ContactsManager' in window,
        isSupported: supported,
        userAgent: navigator.userAgent
      });
      setIsSupported(supported);
    }
  }, []);

  const pickContact = useCallback(async () => {
    if (!isSupported) {
      const errorMsg = 'Contact Picker API is not supported in this browser';
      console.log('[ContactPicker]', errorMsg);
      setError(errorMsg);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[ContactPicker] Attempting to pick contact...');

      // Check if we can query permissions
      if ('permissions' in navigator) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'contacts' });
          console.log('[ContactPicker] Permission status:', permissionStatus.state);

          if (permissionStatus.state === 'denied') {
            throw new Error('دسترسی به مخاطبین رد شده است');
          }
        } catch (permError) {
          console.log('[ContactPicker] Permission query not supported or failed:', permError);
          // Continue anyway - some browsers don't support querying contact permissions
        }
      }

      // Check if navigator.contacts exists and has select method
      if (!navigator.contacts || typeof navigator.contacts.select !== 'function') {
        throw new Error('دسترسی به مخاطبین در این مرورگر پشتیبانی نمی‌شود');
      }

      console.log('[ContactPicker] Calling navigator.contacts.select()...');
      const contacts = await navigator.contacts.select(['name', 'tel'], {
        multiple: false
      });

      console.log('[ContactPicker] Selected contacts:', contacts);

      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        const result = {
          name: contact.name?.join(' ') || '',
          phone: contact.tel?.[0] || ''
        };
        console.log('[ContactPicker] Successfully picked contact:', result);
        return result;
      }

      console.log('[ContactPicker] No contacts were selected');
      return null;
    } catch (err) {
      console.error('[ContactPicker] Error:', err);
      let errorMessage = 'خطا در انتخاب مخاطب';

      if (err.name === 'NotAllowedError') {
        errorMessage = 'دسترسی به مخاطبین رد شده است. لطفا در تنظیمات مرورگر اجازه دسترسی به مخاطبین را بدهید.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'هیچ مخاطبی یافت نشد';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'مخاطبین قابل خواندن نیستند';
      } else if (err.name === 'TypeError') {
        errorMessage = 'دسترسی به مخاطبین در این مرورگر پشتیبانی نمی‌شود';
      }

      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isSupported,
    isLoading,
    error,
    pickContact,
    clearError
  };
}