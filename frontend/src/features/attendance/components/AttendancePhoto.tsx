import { assetUrl } from '@/lib/api-client';
import { cn } from '@/lib/cn';

interface AttendancePhotoProps {
  photoUrl: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export function AttendancePhoto({ photoUrl, alt, className, onClick }: AttendancePhotoProps) {
  const image = (
    <img
      src={assetUrl(photoUrl)}
      alt={alt}
      loading="lazy"
      className={cn('h-full w-full object-cover', !onClick && className)}
    />
  );

  if (!onClick) return image;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('overflow-hidden', className)}
      aria-label={`Lihat ${alt}`}
    >
      {image}
    </button>
  );
}
