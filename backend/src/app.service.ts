import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'healthy',
      message: '✦ Lumis API is running',
      timestamp: new Date().toISOString(),
    };
  }
}
