import { cx } from '../utils/cx';
import './Button.css';

// variant: 'primary' | 'secondary' | 'ghost' | 'danger'   size: 'md' | 'sm'
export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  loadingText,
  disabled = false,
  type = 'button',
  className,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={cx('btn', `btn--${variant}`, size === 'sm' && 'btn--sm', block && 'btn--block', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
