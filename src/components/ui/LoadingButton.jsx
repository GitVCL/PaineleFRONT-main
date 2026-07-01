import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-opacity';

function LoadingButton({
  children,
  loading = false,
  loadingText,
  disabled,
  className = '',
  spinnerSize = 20,
  spinnerColor = '#ffffff',
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`${baseClasses} ${className} ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size={spinnerSize} color={spinnerColor} />
          <span>{loadingText !== undefined && loadingText !== null ? loadingText : children}</span>
        </>
      ) : (
        <>{children}</>
      )}
    </button>
  );
}

export default LoadingButton;