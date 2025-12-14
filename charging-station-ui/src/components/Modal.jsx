import { useEffect } from 'react';

/**
 * Modal Component
 * 
 * Reusable modal component with backdrop and smooth animations.
 * Closes on backdrop click or Escape key press.
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose || (() => {})}
        style={{ cursor: onClose ? 'pointer' : 'default' }}
      ></div>

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Modal Panel */}
        <div
          className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-h-[90vh] flex flex-col ${sizeClasses[size]}`}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 transition-colors z-10"
              aria-label="Close modal"
            >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          )}

          {/* Modal Content */}
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 overflow-y-auto flex-1">
            {title && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

