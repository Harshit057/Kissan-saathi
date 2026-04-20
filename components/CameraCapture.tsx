'use client';

import { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File, previewUrl: string) => void;
  label?: string;
  existingPhoto?: string;
}

export function CameraCapture({ onCapture, label = 'Add Photo', existingPhoto }: CameraCaptureProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(existingPhoto);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onCapture(file, previewUrl);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  if (preview) {
    return (
      <div className="relative">
        <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
        >
          <X size={20} />
        </button>
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="mt-2 w-full h-14 bg-primary hover:bg-secondary text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
        >
          <Camera size={20} />
          Change Photo
        </button>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 min-h-32 flex flex-col gap-3 justify-center">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button
        onClick={() => cameraInputRef.current?.click()}
        className="h-14 bg-primary hover:bg-secondary text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 text-lg"
      >
        <Camera size={24} />
        Take Photo
      </button>
      
      <button
        onClick={() => galleryInputRef.current?.click()}
        className="h-14 bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 text-lg"
      >
        <ImageIcon size={24} />
        Choose from Gallery
      </button>
    </div>
  );
}
