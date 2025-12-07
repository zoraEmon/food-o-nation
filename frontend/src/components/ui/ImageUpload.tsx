"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ImageUploadProps {
  currentImage: File | null;
  onImageSelect: (file: File | null) => void;
  label?: string;
}

export default function ImageUpload({ currentImage, onImageSelect, label = "Upload Photo" }: ImageUploadProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera Error:", err);
      alert("Unable to access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
            onImageSelect(file);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  return (
    <div className="flex flex-col items-center mb-6">
      
      {/* 1. Camera View Finder */}
      {isCameraOpen ? (
        <div className="relative w-64 h-64 bg-black rounded-xl overflow-hidden shadow-lg border-2 border-[#ffb000]">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button type="button" onClick={stopCamera} className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600">
              <X size={20}/>
            </button>
            <button type="button" onClick={capturePhoto} className="p-4 bg-white rounded-full text-[#004225] hover:bg-gray-200 ring-4 ring-[#ffb000]/50">
              <Camera size={24}/>
            </button>
          </div>
        </div>
      ) : (
        // 2. Normal Preview & Actions
        <div className="flex flex-col items-center gap-4">
           <div className="relative w-32 h-32 rounded-full bg-gray-100 dark:bg-white/5 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
              {currentImage ? (
                <img src={URL.createObjectURL(currentImage)} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload className="text-gray-400" />
              )}
           </div>
           
           <div className="flex gap-3">
             <label className="cursor-pointer">
                <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-bold text-gray-700 transition-colors">
                  <Upload size={16}/> {label}
                </span>
                <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
             </label>
             
             <button type="button" onClick={startCamera} className="flex items-center gap-2 px-4 py-2 bg-[#004225] hover:bg-[#005c35] text-white rounded-md text-sm font-bold transition-colors">
                <Camera size={16}/> Take Photo
             </button>
           </div>
           
           {currentImage && (
              <button type="button" onClick={() => onImageSelect(null)} className="text-xs text-red-500 hover:underline">
                Remove Photo
              </button>
           )}
        </div>
      )}
    </div>
  );
}