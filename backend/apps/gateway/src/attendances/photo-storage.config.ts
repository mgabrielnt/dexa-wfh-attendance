import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { join, resolve } from 'path';

export const PHOTO_FIELD = 'photo';
const PHOTO_SUBFOLDER = 'attendance';

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

function photoUploadDirectory(config: ConfigService): string {
  return resolve(config.get<string>('UPLOAD_DIR', 'uploads'), PHOTO_SUBFOLDER);
}

export function photoStorageOptions(config: ConfigService): MulterModuleOptions {
  const destination = photoUploadDirectory(config);
  mkdirSync(destination, { recursive: true });

  return {
    storage: diskStorage({
      destination,
      filename: (_request, file, callback) => callback(null, `${randomUUID()}${EXTENSION_BY_MIME[file.mimetype]}`),
    }),
    fileFilter: (_request, file, callback) => {
      if (EXTENSION_BY_MIME[file.mimetype]) return callback(null, true);
      callback(new BadRequestException('Foto harus berformat JPG atau PNG'), false);
    },
    limits: {
      files: 1,
      fileSize: Number(config.get('MAX_PHOTO_SIZE_MB', 2)) * 1024 * 1024,
    },
  };
}

export function toPhotoPath(filename: string): string {
  return join(PHOTO_SUBFOLDER, filename).replace(/\\/g, '/');
}
