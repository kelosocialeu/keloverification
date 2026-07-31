// components/Button.js
export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-violet text-white hover:bg-violet-dark',
    ghost: 'bg-surface text-ink hover:bg-gray-200',
    dark: 'bg-ink text-white hover:bg-black/80',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
