import { useEffect, useState } from 'react';
import { qrDataUrl } from '../utils/qr';
import './QRCode.css';

// Genera el QR en el cliente. El efecto limpia con "active" para no actualizar un componente desmontado.
export default function QRCode({ value, label, size = 168 }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let active = true;
    qrDataUrl(value).then((url) => {
      if (active) setSrc(url);
    });
    return () => {
      active = false;
    };
  }, [value]);

  if (!src) return <div className="qr qr--loading" style={{ width: size, height: size }} aria-hidden="true" />;
  return <img className="qr" src={src} width={size} height={size} alt={label} />;
}
