import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'muted';
  size?: 'sm' | 'md';
}

export default function ActionButton({
  variant = 'secondary',
  size = 'sm',
  className = '',
  children,
  ...rest
}: ActionButtonProps) {
  const base = 'rounded-md font-semibold focus:outline-none';

  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm'
  };

  const styleMap: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--primary)', color: 'var(--primary-fg)' },
    secondary: { background: 'var(--secondary)', color: 'var(--secondary-fg)' },
    danger: { background: 'var(--danger)', color: 'var(--danger-fg)' },
    muted: { background: 'var(--muted)', color: 'var(--foreground)' }
  };

  const style = { ...(rest.style || {}), ...(styleMap[variant] || {}) };

  return (
    <button {...rest} className={`${base} ${sizeClasses[size]} ${className}`} style={style}>
      {children}
    </button>
  );
}
