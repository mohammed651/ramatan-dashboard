export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  ...props
}) {
  const baseClasses = "font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center gap-2";
  
  const variants = {
    primary: `bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700  shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 focus:ring-primary-500 ${
      disabled ? 'opacity-50 cursor-not-allowed from-neutral-400 to-neutral-500 hover:from-neutral-400 hover:to-neutral-500' : ''
    }`,
    
    secondary: `bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 shadow-sm hover:shadow-md focus:ring-primary-500 ${
      disabled ? 'opacity-50 cursor-not-allowed text-neutral-400 border-neutral-200 hover:border-neutral-200 hover:text-neutral-400' : ''
    }`,
    
    danger: `bg-red-400 hover:bg-red-600 hover:bg-red-600  shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 focus:ring-red-500 ${
      disabled ? 'opacity-50 cursor-not-allowed from-neutral-400 to-neutral-500 hover:from-neutral-400 hover:to-neutral-500' : ''
    }`,
    
    success: `bg-gradient-to-r from-success to-green-500 hover:from-green-600 hover:to-green-600  shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 focus:ring-green-500 ${
      disabled ? 'opacity-50 cursor-not-allowed from-neutral-400 to-neutral-500 hover:from-neutral-400 hover:to-neutral-500' : ''
    }`,
    
    ghost: `bg-transparent hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800 focus:ring-primary-500 ${
      disabled ? 'opacity-50 cursor-not-allowed text-neutral-400 hover:bg-transparent hover:text-neutral-400' : ''
    }`
  };

  const sizes = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-3.5 text-base",
    xl: "px-8 py-4 text-lg"
  };

  const spinnerSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-4 h-4",
    xl: "w-5 h-5"
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
        disabled || loading ? 'cursor-not-allowed' : ''
      }`}
    >
      {loading && (
        <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${spinnerSizes[size]}`} />
      )}
      
      {children}
    </button>
  );
}