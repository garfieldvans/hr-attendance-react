import { ConfigService } from '@nestjs/config';
import { RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const authRoutes = ['/api/auth'];

export function createGatewayProxy(config: ConfigService): RequestHandler {
  const authProxy = createProxyMiddleware({
    target: config.get<string>('AUTH_SERVICE_URL', 'http://localhost:3001'),
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    on: {
      error: (_error, _request, response) => {
        if ('writeHead' in response && !response.headersSent) {
          response.writeHead(502, { 'Content-Type': 'application/json' });
          response.end(
            JSON.stringify({ statusCode: 502, message: 'Layanan sedang tidak tersedia' }),
          );
        }
      },
    },
  });

  return (request, response, next) => {
    if (authRoutes.some((route) => request.path.startsWith(route))) {
      authProxy(request, response, next);
      return;
    }

    next();
  };
}
