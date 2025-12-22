"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";

interface Props {
  qrValue: string;
  filename?: string;
  className?: string;
}

export default function DonationQrCard({ qrValue, filename, className }: Props) {
  const [downloading, setDownloading] = useState(false);

  const downloadImage = async () => {
    if (!qrValue) return;
    setDownloading(true);
    try {
      if (qrValue.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = qrValue;
        a.download = (filename || "donation-qr") + ".png";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const res = await fetch(qrValue);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = (filename || "donation-qr") + ".png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Failed to download QR image:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={"flex flex-col items-center " + (className || "")}>
      <div className="bg-white dark:bg-[#05291a] p-4 rounded-xl shadow-md inline-block mb-4">
        <img src={qrValue} alt="Donation QR" className="w-[180px] h-[180px] object-contain" />
      </div>

      <div className="flex gap-2">
        <Button onClick={downloadImage} className="bg-primary text-white inline-flex items-center gap-2" disabled={downloading}>
          <Download className="w-4 h-4" />
          {downloading ? 'Downloading...' : 'Download QR'}
        </Button>
      </div>
    </div>
  );
}
