
import winston from "winston";

export const loggerInfo = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'info.log', level: 'info' }),
        new winston.transports.Console() // Add this line for console logging
    ]
});

export const loggerError = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.Console() // Add this line for console logging
    ]
});
