import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadsDir: string;

  constructor() {
    this.uploadsDir = process.env.UPLOADS_DIR ?? './uploads';
    this.ensureDirectories();
  }

  private ensureDirectories() {
    const dirs = [
      this.uploadsDir,
      path.join(this.uploadsDir, 'receipts'),
      path.join(this.uploadsDir, 'products'),
      path.join(this.uploadsDir, 'reports'),
    ];
    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.logger.log(`Directorio creado: ${dir}`);
      }
    });
  }

  getFilePath(folder: string, fileName: string): string {
    return path.join(this.uploadsDir, folder, fileName);
  }

  fileExists(folder: string, fileName: string): boolean {
    return fs.existsSync(this.getFilePath(folder, fileName));
  }

  deleteFile(folder: string, fileName: string): void {
    const filePath = this.getFilePath(folder, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.log(`Archivo eliminado: ${filePath}`);
    }
  }

  readFileAsBuffer(folder: string, fileName: string): Buffer {
    return fs.readFileSync(this.getFilePath(folder, fileName));
  }
}