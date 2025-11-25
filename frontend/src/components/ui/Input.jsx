export default function Input({
  label,
  className = "",
  error,
  ...props
}) {
  return (
    <label className="block mb-4">
      {label && (
        <div className="text-sm font-medium text-neutral-700 mb-2">{label}</div>
      )}
      
      <input
        {...props}
        className={`w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          placeholder:text-neutral-400 hover:border-neutral-400
          ${error ? 'border-danger focus:ring-danger' : ''}
          ${className}`}
      />
      
      {error && (
        <div className="text-danger text-sm mt-1 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </label>
  );
}