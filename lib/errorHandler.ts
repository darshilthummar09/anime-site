// Global error handler to suppress abort errors
// These errors are expected when components unmount or operations are cancelled
if (typeof window !== 'undefined') {
  const isAbortError = (error: any): boolean => {
    if (!error) return false;
    
    const errorStr = String(error);
    const errorName = error?.name || '';
    const errorMessage = error?.message || '';
    const errorCode = error?.code || '';
    
    return (
      errorName === 'AbortError' ||
      errorCode === 'cancelled' ||
      errorStr.includes('AbortError') ||
      errorStr.includes('aborted') ||
      errorStr.includes('signal is aborted') ||
      errorMessage.includes('aborted') ||
      errorMessage.includes('AbortError') ||
      errorMessage.includes('signal is aborted')
    );
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    // Suppress abort errors - they're expected when operations are cancelled
    if (isAbortError(error)) {
      event.preventDefault(); // Prevent error from showing in console/UI
      return;
    }
  }, { passive: true });

  // Handle global errors
  window.addEventListener('error', (event) => {
    const error = event.error;
    
    // Suppress abort errors - they're expected when operations are cancelled
    if (isAbortError(error)) {
      event.preventDefault(); // Prevent error from showing in console/UI
      return;
    }
  }, { passive: true });

  // Also handle React error boundaries by suppressing abort errors
  const originalError = window.console.error;
  window.console.error = (...args: any[]) => {
    const errorMessage = args.join(' ');
    
    // Don't log abort errors - they're expected when operations are cancelled
    if (
      errorMessage.includes('AbortError') ||
      errorMessage.includes('aborted') ||
      errorMessage.includes('signal is aborted')
    ) {
      return; // Suppress abort errors
    }
    
    originalError.apply(console, args);
  };
}

