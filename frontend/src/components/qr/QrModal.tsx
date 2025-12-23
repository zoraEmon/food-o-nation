"use client";

import { X, Download, Mail, CheckCircle } from 'lucide-react';

type Detail = { label: string; value: string };

export default function QrModal({
  open,
  onClose,
  qrImage,
  title,
  subtitle,
  details,
  emailed,
  extraImage,
}: {
  open: boolean;
  onClose: () => void;
  qrImage: string | null | undefined;
  title?: string;
  subtitle?: string;
  details?: Detail[];
  emailed?: boolean;
  extraImage?: string | null;
}) {
  if (!open) return null;

  const handleDownload = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `${(title || 'qr').replace(/\s+/g, '-')}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center my-8 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#004225] mb-2">{title || 'Success'}</h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>

        <div className="bg-background rounded-xl p-4 mb-4">
          <p className="text-sm font-bold text-[#004225] uppercase tracking-wide mb-3">Your QR Code</p>
          <div className="bg-white p-3 rounded-lg inline-block">
            {qrImage ? (
              <img id="qr-code-image" src={qrImage} alt="QR Code" className="w-40 h-40 mx-auto" />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center text-gray-400">No QR</div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3">Present this QR code at the venue</p>

          {/* Optional first donation item image */}
          {typeof (extraImage) !== 'undefined' && extraImage && (
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">First item image</p>
              <div className="w-24 h-24 bg-white rounded-lg p-1 inline-block">
                <img src={extraImage} alt="First item" className="w-full h-full object-cover rounded" />
              </div>
            </div>
          )}
        </div>

        {emailed && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
            <div className="flex items-start gap-2">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">
                <strong>QR Code sent to your email!</strong>
                <br />
                <span className="text-blue-600">Check your inbox for the confirmation email with your QR code.</span>
              </p>
            </div>
          </div>
        )}

        {details && (
          <div className="space-y-2 text-sm text-left bg-gray-50 rounded-lg p-3 mb-4">
            {details.map((d) => (
              <div className="flex justify-between" key={d.label}>
                <span className="text-gray-600">{d.label}:</span>
                <span className="font-semibold text-[#004225]">{d.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleDownload} className="flex-1 px-6 py-3 bg-[#FFB000] text-[#004225] rounded-xl font-bold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Download QR
          </button>
          <button onClick={onClose} className="flex-1 px-6 py-3 bg-[#004225] text-white rounded-xl font-bold hover:bg-[#005a33] transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
