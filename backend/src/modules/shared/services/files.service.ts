import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs/promises';
import FileType from 'file-type'; // version 16.5.4
import crypto from 'crypto';

@Injectable()
export class FilesService {
  getMimeTypeFromExtension(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();

    const mimeTypes: { [key: string]: string } = {
      '.csv': 'text/csv',
      '.txt': 'text/plain',
      '.json': 'shared/json',
      '.xml': 'shared/xml',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'shared/javascript',
    };

    return mimeTypes[extension] || 'shared/octet-stream';
  }

  async getFileInfos({
    filePath,
    originalFileName,
  }: {
    filePath: string;
    originalFileName?: string;
  }) {
    const stats = await fs.stat(filePath);
    const fileTypeFromFile = await FileType.fromFile(filePath);
    let mimeType: string = fileTypeFromFile?.mime ?? 'shared/octet-stream';

    if (!fileTypeFromFile?.mime && originalFileName) {
      mimeType = this.getMimeTypeFromExtension(originalFileName);
    }

    return {
      filename: path.basename(filePath),
      path: filePath,
      size: stats.size,
      mimeType: mimeType,
    };
  }

  getNormalizedFileName(filename: string, appendRandom = true) {
    // Remove special characters using path.normalize()
    const normalized = path.normalize(filename);

    const extension = path.extname(normalized);
    const baseName = path.basename(normalized, extension);

    let finalName: string;

    if (appendRandom) {
      // -- Add random number before the file extension
      // Generate a secure random string with 16 bytes (it's impossible to have a collision even with 100000000 billions of generated values)
      const random = crypto.randomBytes(16).toString('hex');

      finalName = `${baseName}-${random}${extension}`;
    } else {
      finalName = `${baseName}${extension}`;
    }

    // Remove whitespace and other characters using a regular expression
    const cleaned = finalName.replace(/[^a-zA-Z0-9.]+/g, '_');

    // Join directory and normalized filename components back together
    return path.join(path.dirname(normalized), cleaned);
  }
}
