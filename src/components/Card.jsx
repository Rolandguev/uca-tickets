import { cx } from '../utils/cx';
import './Card.css';

// Superficie con borde. "as" permite usar <section>, <article>, <li>...
export default function Card({ as: Tag = 'section', title, className, children, ...rest }) {
  return (
    <Tag className={cx('card', className)} {...rest}>
      {title && <h2 className="card__title">{title}</h2>}
      {children}
    </Tag>
  );
}
