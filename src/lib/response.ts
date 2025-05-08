// src/lib/response.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to attach sendResponse, ok, error to res
 */
export function responseFormatter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.sendResponse = function (success: boolean, status: number, message?: any, data?: any) {
    const payload: any = { success };
    if (message !== undefined) payload.message = message;
    if (data !== undefined) payload.data = data;
    return this.status(status).json(payload);
  };

  res.ok = function (status: number, message?: any, data?: any) {
    return this.sendResponse(true, status, message, data);
  };

  res.error = function (status: number, message?: any, data?: any) {
    return this.sendResponse(false, status, message, data);
  };

  next();
}

// 사용방법:
// app.ts
// import express from 'express';
// import { responseFormatter } from './lib/response';
// const app = express();
// app.use(responseFormatter);

// router.ts 예시
// router.get('/example', (req, res) => {
//   const result = { key: 'value' };
//   return res.ok(200, '조회 성공', result);
// });
