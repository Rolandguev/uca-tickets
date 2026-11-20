import { initials } from '../utils/format';
import './Avatar.css';

export default function Avatar({ name, size = 36 }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
