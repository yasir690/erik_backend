
// import winston from "winston";
const winston=require('winston');
 const loggerInfo = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'info.log', level: 'info' }),
        new winston.transports.Console() // Add this line for console logging
    ]
});

 const loggerError = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.Console() // Add this line for console logging
    ]
});

module.exports={loggerInfo,loggerError}