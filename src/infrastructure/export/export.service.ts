import { Injectable } from '@nestjs/common';
import { format } from 'fast-csv';
import { Writable } from 'stream';

@Injectable()
export class ExportService {
  async toCsvBuffer(
    headers: string[],
    rows: Record<string, any>[],
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      const writableStream = new Writable({
        write(chunk, _encoding, callback) {
          chunks.push(Buffer.from(chunk));
          callback();
        },
      });

      const csvStream = format({ headers });

      csvStream.pipe(writableStream);

      rows.forEach((row) => csvStream.write(row));
      csvStream.end();

      writableStream.on('finish', () => resolve(Buffer.concat(chunks)));
      writableStream.on('error', reject);
    });
  }
}