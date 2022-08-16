import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const DeviceDetector = require('device-detector-js');
const detector = new DeviceDetector();

@Injectable()
export class DeviceDetectorMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req['device'] = detector.parse(req.headers['user-agent']);
    next();
  }
}
