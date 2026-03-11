import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

// Configuration for structured logging
const config = {
    level: process.env.LOG_LEVEL || 'info',
    browser: {
        asObject: true,
    },
    base: {
        env: process.env.NODE_ENV,
        service: 'nodebase-saas', // Service identifier
    },
    formatters: {
        level: (label: string) => {
            return { level: label.toUpperCase() };
        },
    },
    // Use pino-pretty for local dev, structured JSON for production
    transport: !isProduction ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
        }
    } : undefined,
    redact: {
        paths: ['email', 'password', 'token', 'authorization', 'cookie'],
        remove: true,
    }
};

export const logger = pino(config);

export const log = {
    info: (msg: string, metadata?: object) => logger.info(metadata, msg),
    error: (msg: string, error?: any, metadata?: object) => logger.error({ ...metadata, err: error }, msg),
    warn: (msg: string, metadata?: object) => logger.warn(metadata, msg),
    debug: (msg: string, metadata?: object) => logger.debug(metadata, msg),
    // Helper for audit logs
    audit: (action: string, actorId: string, targetId: string, details?: object) => {
        logger.info({
            type: 'AUDIT',
            action,
            actorId,
            targetId,
            ...details
        }, `AUDIT: ${action} by ${actorId}`);
    }
};
