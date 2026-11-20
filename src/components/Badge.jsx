import { cx } from '../utils/cx';
import './Badge.css';

// tone: 'success' | 'warning' | 'error' | 'neutral' | 'primary'
export default function Badge({ tone = 'neutral', children, className }) {
  return <span className={cx('badge', `badge--${tone}`, className)}>{children}</span>;
}
