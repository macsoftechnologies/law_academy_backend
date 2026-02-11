import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BunnyService {
  private baseUrl = 'https://storage.bunnycdn.com';

  async uploadSingleFile(buffer: Buffer, fileName: string): Promise<string> {
    const uploadUrl = `${this.baseUrl}/${process.env.BUNNY_STORAGE_ZONE}/mains-attempts/${fileName}`;

    await axios.put(uploadUrl, buffer, {
      headers: {
        AccessKey: process.env.BUNNY_STORAGE_KEY,
        'Content-Type': 'application/octet-stream',
      },
      maxBodyLength: Infinity,
    });

    return `https://${process.env.BUNNY_STORAGE_ZONE}.b-cdn.net/mains-attempts/${fileName}`;
  }
}
