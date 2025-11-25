import React from "react";

export default function Modal({ 
  onClose, 
  children, 
  width = "max-w-md",
  title,
  showCloseButton = true,
  closeOnBackdrop = true
}) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      {/* Backdrop مع تأثير blur */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300" />
      
      {/* المحتوى الرئيسي */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl w-full ${width} animate-scaleIn max-h-[90vh] flex flex-col`}
      >
        {/* تأثير جرادينت أعلى المودال */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500 z-10" />
        
        {/* Header إذا كان هناك عنوان */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-200/60 flex-shrink-0">
            {title && (
              <h3 className="text-xl font-bold text-neutral-900 pr-8">
                {title}
              </h3>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all duration-200 group flex-shrink-0 ml-2"
              >
                <svg 
                  className="w-5 h-5 text-neutral-600 group-hover:text-neutral-800 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* محتوى المودال - الجزء القابل لل scroll */}
        <div className={`flex-1 overflow-y-auto ${title || !showCloseButton ? 'p-6' : 'p-6 pt-8'}`}>
          {children}
        </div>

        {/* تأثير جرادينت أسفل المودال للـ scroll */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
}