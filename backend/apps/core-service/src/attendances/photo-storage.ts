import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { AuthenticatedRequest, uploadDirectory } from '../../../../libs/common/src';
import { toAppDate } from './app-date';

const photoExtensions: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const maxPhotoSizeInBytes = 5 * 1024 * 1024;

const attendancePhotoFolder = (date: string) =>
  join(uploadDirectory(), 'attendances', date);

export const attendancePhotoUpload = {
  storage: diskStorage({
    destination: (_request, _file, done) => {
      const folder = attendancePhotoFolder(toAppDate(new Date()));
      mkdirSync(folder, { recursive: true });
      done(null, folder);
    },
    filename: (request, file, done) => {
      const { sub } = (request as AuthenticatedRequest).user ?? { sub: 'unknown' };
      done(null, `${sub}-${randomUUID().slice(0, 8)}${photoExtensions[file.mimetype]}`);
    },
  }),
  limits: { fileSize: maxPhotoSizeInBytes },
  fileFilter: (_request: unknown, file: Express.Multer.File, done: (error: Error | null, accept: boolean) => void) => {
    if (!photoExtensions[file.mimetype]) {
      done(new BadRequestException('Foto harus berupa JPG, PNG, atau WebP'), false);
      return;
    }

    done(null, true);
  },
};

export const relativePhotoPath = (filePath: string) =>
  relative(uploadDirectory(), filePath).split(sep).join('/');

export const removePhoto = (photoPath: string) =>
  unlink(join(uploadDirectory(), photoPath)).catch(() => undefined);
