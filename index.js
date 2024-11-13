import express from "express";
import bodyParser from "body-parser";
import dbConnect from "./connectivity.js";
import path from "path";

import { UserRouters } from "./router/userRouter.js";
import { TaskRouters } from "./router/taskRouter.js";
import { subTaskRouters } from "./router/subTaskRouter.js";
import serverless from 'serverless-http';
const app = express();

const apiPrefix = process.env.API_PRIFEX;
const port = process.env.PORT || 4000;

app.use(express.static('public'));


app.use(bodyParser.json());
// Configure bodyParser to handle post requests
app.use(bodyParser.urlencoded({ extended: true }));

//user router
app.use(apiPrefix, UserRouters);

// task router

app.use(apiPrefix, TaskRouters);

//sub task router

app.use(apiPrefix, subTaskRouters);

dbConnect();

app.get("/", (req, res) => {
  res.send("welcome to erik application deployed on serverless");
});

// app.listen(port, () => {
//   console.log(`server is running at ${port}`);
// });

//for server less

export const handler = serverless(app);