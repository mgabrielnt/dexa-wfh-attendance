import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from './Button';
import { Icon } from './Icon';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE_MB = 2;

interface PhotoCaptureProps {
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

function validatePhoto(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Foto harus berformat JPG atau PNG';
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return `Ukuran foto maksimal ${MAX_SIZE_MB} MB`;
  return null;
}

function canvasToFile(canvas: HTMLCanvasElement): Promise<File> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(new File([blob], `wfh-${Date.now()}.jpg`, { type: 'image/jpeg' })) : reject(),
      'image/jpeg',
      0.85,
    ),
  );
}

export function PhotoCapture({ value, onChange, disabled = false }: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setError('Kamera tidak dapat diakses. Izinkan akses kamera atau gunakan Upload File.');
    }
  }

  async function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    stopCamera();
    onChange(await canvasToFile(canvas));
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const problem = validatePhoto(file);
    setError(problem);
    if (!problem) onChange(file);
  }

  function reset() {
    setError(null);
    onChange(null);
  }

  return (
    <div>
      <div
        className={cn(
          'relative flex h-[200px] flex-col items-center justify-center gap-2 overflow-hidden rounded-[20px] text-center',
          previewUrl || cameraOn ? 'bg-ink' : 'border-[1.5px] border-dashed border-border-strong bg-canvas',
        )}
      >
        {cameraOn && (
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        )}

        {!cameraOn && previewUrl && (
          <>
            <img src={previewUrl} alt="Pratinjau foto bukti WFH" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={reset}
              disabled={disabled}
              className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-xl bg-ink/80 px-3 py-1.5 text-[11px] font-bold text-white"
            >
              <Icon name="refresh" size={13} /> Ulangi
            </button>
          </>
        )}

        {!cameraOn && !previewUrl && (
          <>
            <span className="grid h-14 w-14 place-items-center rounded-full bg-lime">
              <Icon name="camera" size={22} />
            </span>
            <p className="text-[13px] font-semibold">Ambil foto dengan kamera atau upload file</p>
            <p className="text-xs font-medium text-muted">JPG / PNG · maks. {MAX_SIZE_MB} MB</p>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-[11px] font-medium text-danger-ink">{error}</p>}

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {cameraOn ? (
          <>
            <Button variant="dark" onClick={capture}>
              <Icon name="camera" size={16} /> Jepret
            </Button>
            <Button variant="outline" onClick={stopCamera}>
              Batal
            </Button>
          </>
        ) : (
          <>
            <Button variant="dark" onClick={startCamera} disabled={disabled}>
              <Icon name="camera" size={16} /> Ambil Foto
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={disabled}>
              <Icon name="upload" size={16} /> Upload File
            </Button>
          </>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES.join(',')} hidden onChange={handleFile} />
    </div>
  );
}
