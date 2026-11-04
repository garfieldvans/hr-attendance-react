import { ConfigService } from '@nestjs/config';
import { RequestHandler } from 'express';
import { createProxyMiddleware, RequestHandler as ProxyHandler } from 'http-proxy-middleware';

interface ServiceRoute {
  prefixes: string[];
  envKey: string;
  defaultUrl: string;
}

const serviceRoutes: ServiceRoute[] = [
  {
    prefixes: ['/api/auth', '/api/users'],
    envKey: 'AUTH_SERVICE_URL',
    defaultUrl: 'http://localhost:3001',
  },
];

export function createGatewayProxy(config: ConfigService): RequestHandler {
  const proxies = serviceRoutes.map<{ prefixes: string[]; handler: ProxyHandler }>((route) => ({
    prefixes: route.prefixes,
    handler: createProxyMiddleware({
      target: config.get<string>(route.envKey, route.defaultUrl),
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
    }),
  }));

  return (request, response, next) => {
    const matched = proxies.find(({ prefixes }) =>
      prefixes.some((prefix) => request.path === prefix || request.path.startsWith(`${prefix}/`)),
    );

    if (matched) {
      matched.handler(request, response, next);
      return;
    }

    next();
  };
}
