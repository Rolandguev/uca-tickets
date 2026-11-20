// Código QR generado en el cliente con la librería "qrcode"
import QRCode from 'qrcode';

export function qrDataUrl(text) {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 320,
    errorCorrectionLevel: 'M',
    color: { dark: '#0b0b14', light: '#ffffff' },
  });
}

export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
