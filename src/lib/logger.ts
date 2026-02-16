import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    browser: {
        asObject: true,
    },
    base: {
        env: process.env.NODE_ENV,
    },
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        },
    },
    // Use pretty print in development only
    ...(isProduction ? {} : {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
            },
        },
    }),
});

export const log = {
    info: (msg: string, metadata?: object) => logger.info(metadata, msg),
    error: (msg: string, error?: any, metadata?: object) => logger.error({ ...metadata, err: error }, msg),
    warn: (msg: string, metadata?: object) => logger.warn(metadata, msg),
    debug: (msg: string, metadata?: object) => logger.debug(metadata, msg),
};
