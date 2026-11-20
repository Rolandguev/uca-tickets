// Une nombres de clase ignorando valores vacíos: cx('a', false, 'b') -> 'a b'
export const cx = (...parts) => parts.filter(Boolean).join(' ');
