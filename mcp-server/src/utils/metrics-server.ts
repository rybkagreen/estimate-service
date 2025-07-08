/**
 * HTTP server for Prometheus metrics endpoint
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { logger } from './logger.js';
import { getMetrics, initializeMetrics } from './prometheus-metrics.js';

const METRICS_PORT = parseInt(process.env.METRICS_PORT || '9090', 10);

/**
 * Start the metrics HTTP server
 */
export function startMetricsServer(): void {
  // Initialize Prometheus metrics
  initializeMetrics();
  
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    // Only serve metrics on /metrics endpoint
    if (req.url === '/metrics' && req.method === 'GET') {
      try {
        const metrics = await getMetrics();
        res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
        res.end(metrics);
      } catch (error) {
        logger.error('Error generating metrics:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    } else if (req.url === '/health' && req.method === 'GET') {
      // Health check endpoint
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    } else {
      // Return 404 for other endpoints
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  server.listen(METRICS_PORT, () => {
    logger.info(`📊 Metrics server listening on port ${METRICS_PORT}`);
    logger.info(`📈 Prometheus metrics available at http://localhost:${METRICS_PORT}/metrics`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('📊 Shutting down metrics server...');
    server.close(() => {
      logger.info('📊 Metrics server shut down');
    });
  });
}
