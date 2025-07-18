import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
// Create logger instance with console-only transport for Warp compatibility
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
    defaultMeta: { service: 'estimate-service-mcp' },
    transports: [
        // Console transport only - no file logging to avoid permission issues
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
    ],
});
// Optional: Add file logging only if explicitly enabled and path is writable
if (process.env.ENABLE_FILE_LOGGING === 'true' && process.env.LOG_PATH) {
    try {
        const logPath = process.env.LOG_PATH;
        if (!fs.existsSync(logPath)) {
            fs.mkdirSync(logPath, { recursive: true });
        }
        logger.add(new winston.transports.File({
            filename: path.join(logPath, 'error.log'),
            level: 'error'
        }));
        logger.add(new winston.transports.File({
            filename: path.join(logPath, 'combined.log')
        }));
    }
    catch (error) {
        console.warn('File logging disabled due to:', error.message);
    }
}
