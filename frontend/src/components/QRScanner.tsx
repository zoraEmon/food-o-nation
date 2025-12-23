"use client";
import React, { useEffect, useRef, useState } from 'react';

export interface QRScannerProps {
  onResult: (result: string) => void;
  onClose?: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onResult, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<any>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File upload state: user selects a file, then must confirm to scan
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanningImage, setScanningImage] = useState(false);

  useEffect(() => {
    let QrScanner: any;
    async function start() {
      try {
        QrScanner = (await import('qr-scanner')).default;
        if (!videoRef.current) return;
        // Use an async callback so we can await parent handler (which may be async)
        scannerRef.current = new QrScanner(videoRef.current, async (result: any) => {
          if (result) {
            try {
              await onResult(result.data || result);
            } catch (err:any) {
              // If parent threw due to 'already scanned' (409) or other known cases, don't log noisy errors here.
              if (err?.response?.status && err?.response?.status !== 409) {
                console.error('Error handling scan result:', err);
                setError(err?.response?.data?.error || err?.message || 'Failed to handle scan result');
              }
            } finally {
              stop();
            }
          }
        });
        await scannerRef.current.start();
        setScanning(true);
      } catch (err: any) {
        const name = err?.name || '';
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          console.debug('QR Scanner permission error:', err);
          setError('Camera access was denied. You can upload an image instead.');
        } else if (name === 'AbortError') {
          // User agent aborted the media fetch (user cancelled/closed prompt). Don't spam console.error for expected aborts.
          console.debug('QR Scanner aborted:', err);
          setError('Camera start was aborted. You can try again or upload an image.');
        } else {
          console.error('QR Scanner error:', err);
          setError(err?.message || 'Failed to start camera');
        }
        setScanning(false);
      }
    }

    start();

    return () => {
      stop();
      // revoke preview url if any
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stop = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.destroy?.();
        scannerRef.current = null;
      }
      setScanning(false);
    } catch (e) {
      // ignore
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // store file and preview, but DO NOT scan automatically — wait for user confirmation
    setUploadedFile(file);
    try {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } catch (err) {
      setPreviewUrl(null);
    }
    // clear input so same file can be selected again if user clears
    try { e.currentTarget.value = ''; } catch(e) { /* ignore */ }
    setError(null);
  };

  const scanUploadedFile = async () => {
    if (!uploadedFile) return;
    setScanningImage(true);
    setError(null);
    try {
      const QrScanner = (await import('qr-scanner')).default;
      const result = await QrScanner.scanImage(uploadedFile, { returnDetailedScanResult: true });
      const val = result?.data ?? (result as any);
      if (val) {
        try {
          await onResult(String(val));
        } catch (err:any) {
          // Parent may throw on 409 (already scanned) or other conditions. Don't treat this as an unhandled error here.
          if (err?.response?.status && err?.response?.status !== 409) {
            console.error('Error handling uploaded scan result:', err);
            setError(err?.response?.data?.error || err?.message || 'Failed to handle scan result');
          }
        }
        // optionally clear uploaded file after attempting scan
        setUploadedFile(null);
        if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
      } else {
        setError('No QR code found in the image');
      }
    } catch (err: any) {
      console.error('Failed to scan image:', err);
      setError(err?.message || 'Failed to scan image');
    } finally {
      setScanningImage(false);
    }
  };

  return (
    <div className="p-3 border rounded bg-white/3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold">QR Scanner</div>
        <div className="text-xs text-gray-400">{scanning ? 'Camera active' : 'Idle'}</div>
      </div>
      {error && <div className="text-xs text-red-400 mb-2">{error}</div>}
      <div className="w-full h-48 bg-black/40 rounded overflow-hidden flex items-center justify-center">
        <video ref={videoRef} className="w-full h-full object-cover" />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <label className="text-sm text-gray-300">Upload image:</label>
        <input type="file" accept="image/*" onChange={handleFile} />

        {uploadedFile && (
          <div className="ml-3 flex items-center gap-3 flex-wrap w-full items-center">
            {previewUrl && <img src={previewUrl} alt="preview" className="w-10 h-10 object-cover rounded" />}
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate max-w-[220px]">{uploadedFile.name}</div>
              <div className="text-xs text-gray-400">{(uploadedFile.size/1024).toFixed(1)} KB</div>
            </div>
            <div className="flex gap-2 ml-3 flex-shrink-0">
              <button className="px-2 py-1 text-xs rounded bg-white/10 whitespace-nowrap" disabled={scanningImage} onClick={scanUploadedFile}>{scanningImage ? 'Scanning...' : 'Scan'}</button>
              <button className="px-2 py-1 text-xs rounded bg-white/10 whitespace-nowrap" onClick={() => { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); setUploadedFile(null); setError(null); }}>Clear</button>
            </div>
          </div>
        )}

        <div className="ml-auto flex gap-2">
          <button className="px-3 py-1 rounded bg-white/10" onClick={() => { stop(); onClose?.(); }}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;