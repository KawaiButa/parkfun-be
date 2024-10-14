import { Request, Response } from "express";
import { json } from "body-parser";

function paymentMiddleware() {
  return json({
    verify: (request: Request & { rawBody: Buffer }, response: Response, buffer: Buffer) => {
      if (request.url === "/payment/webhook" && Buffer.isBuffer(buffer)) {
        request.rawBody = Buffer.from(buffer);
      }
      return true;
    },
  });
}

export default paymentMiddleware;
