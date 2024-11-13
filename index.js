// import express from "express";
// import bodyParser from "body-parser";
// import dbConnect from "./connectivity.js";
// import path from "path";

// import { UserRouters } from "./router/userRouter.js";
// import { TaskRouters } from "./router/taskRouter.js";
// import { subTaskRouters } from "./router/subTaskRouter.js";
// import serverless from 'serverless-http';
// const app = express();

// const apiPrefix = process.env.API_PRIFEX;
// const port = process.env.PORT || 4000;

// app.use(express.static('public'));


// app.use(bodyParser.json());
// // Configure bodyParser to handle post requests
// app.use(bodyParser.urlencoded({ extended: true }));

// //user router
// app.use(apiPrefix, UserRouters);

// // task router

// app.use(apiPrefix, TaskRouters);

// //sub task router

// app.use(apiPrefix, subTaskRouters);

// dbConnect();

// app.get("/", (req, res) => {
//   res.send("welcome to erik application deployed on serverless");
// });

// app.listen(port, () => {
//   console.log(`server is running at ${port}`);
// });


// export const handler = serverless(app);


//for server less

import express from 'express';
import bodyParser from 'body-parser';
import dbConnect from './connectivity.js';
import { UserRouters } from './router/userRouter.js';
import { TaskRouters } from './router/taskRouter.js';
import { subTaskRouters } from './router/subTaskRouter.js';
import serverless from 'serverless-http';

const app = express();

// Use environment variable or fallback to default API prefix
const apiPrefix = process.env.API_PREFIX || '/api/v1';  
const port = process.env.PORT || 4000;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
app.use(apiPrefix, UserRouters);
app.use(apiPrefix, TaskRouters);
app.use(apiPrefix, subTaskRouters);

// Database connection
dbConnect().catch((err) => {
  console.error("Database connection failed:", err);
  throw new Error("Database connection failed");
});

// Root route (for testing)
app.get('/', (req, res) => {
  res.send('Welcome to the application deployed on Lambda!');
});

// Export handler for AWS Lambda
export const handler = serverless(app);
