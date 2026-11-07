import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { FiCamera, FiRefreshCw, FiUpload, FiVideo, FiVideoOff } from 'react-icons/fi';
import { Button } from './Button';

interface PhotoCaptureProps {
  file: File | null;
  onChange: (file: File | null) => void;
  existingPhotoUrl?: string;
}

const maxPhotoSize = 5 * 1024 * 1024;
const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];

const cameraErrorMessage = (error: unknown) => {
  const name = error instanceof DOMException ? error.name : '';

  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Akses kamera ditolak. Izinkan kamera di browser atau pilih file foto.';
  }

  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return 'Kamera tidak ditemukan. Pilih file foto sebagai gantinya.';
  }

  return 'Kamera tidak bisa dibuka. Pilih file foto sebagai gantinya.';
};

export const PhotoCapture = ({ file, onChange, existingPhotoUrl }: PhotoCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const startCamera = async () => {
    setError('');

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Browser ini tidak mendukung kamera. Pilih file foto sebagai gantinya.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
    } catch (cameraError) {
      setError(cameraErrorMessage(cameraError));
    }
  };

  const takePicture = () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth) {
      setError('Kamera belum siap, tunggu sebentar lalu coba lagi.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('Gagal mengambil foto, coba lagi.');
          return;
        }

        onChange(new File([blob], `absensi-${Date.now()}.jpg`, { type: 'image/jpeg' }));
        stopCamera();
      },
      'image/jpeg',
      0.85,
    );
  };

  const pickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    event.target.value = '';

    if (!selected) {
      return;
    }

    if (!acceptedTypes.includes(selected.type)) {
      setError('Foto harus berupa JPG, PNG, atau WebP.');
      return;
    }

    if (selected.size > maxPhotoSize) {
      setError('Ukuran foto maksimal 5 MB.');
      return;
    }

    setError('');
    stopCamera();
    onChange(selected);
  };

  const reset = () => {
    onChange(null);
    setError('');
  };

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
        {preview ? (
          <img src={preview} alt="Pratinjau foto absensi" className="h-56 w-full object-cover" />
        ) : existingPhotoUrl ? (
          <img
            src={existingPhotoUrl}
            alt="Foto absensi saat ini"
            className="h-56 w-full object-cover"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-56 w-full scale-x-[-1] object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />
            {!cameraActive && (
              <div className="flex h-56 flex-col items-center justify-center gap-2 px-6 text-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                  <FiCamera className="size-5" aria-hidden="true" />
                </span>
                <p className="text-sm font-medium text-slate-600">Ambil foto bukti kerja</p>
                <p className="text-xs text-slate-400">
                  Pakai kamera langsung atau unggah file JPG/PNG/WebP maksimal 5 MB.
                </p>
              </div>
            )}
          </>
        )}

        {cameraActive && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-slate-900/70 to-transparent p-3">
            <Button size="sm" onClick={takePicture}>
              <FiCamera className="size-4" aria-hidden="true" />
              Ambil foto
            </Button>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        {preview ? (
          <Button
            variant="secondary"
            size="sm"
            iconOnly
            onClick={reset}
            aria-label="Ganti foto"
            title="Ganti foto"
          >
            <FiRefreshCw className="size-4" aria-hidden="true" />
          </Button>
        ) : cameraActive ? (
          <Button
            variant="secondary"
            size="sm"
            iconOnly
            onClick={stopCamera}
            aria-label="Matikan kamera"
            title="Matikan kamera"
          >
            <FiVideoOff className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            iconOnly
            onClick={() => void startCamera()}
            aria-label="Nyalakan kamera"
            title="Nyalakan kamera"
          >
            <FiVideo className="size-4" aria-hidden="true" />
          </Button>
        )}

        {!preview && (
          <label
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-within:ring-4 focus-within:ring-slate-200"
            title="Pilih file foto"
          >
            <FiUpload className="size-4" aria-hidden="true" />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-label="Pilih file foto"
              className="sr-only"
              onChange={pickFile}
            />
          </label>
        )}
      </div>
    </div>
  );
};
