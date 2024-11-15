const express = require('express');
const bodyParser = require('body-parser');
const dbConnect = require('./connectivity');
const UserRouters = require('./router/userRouter');
const TaskRouters = require('./router/taskRouter');
const subTaskRouter = require('./router/subTaskRouter');

const serverless = require('serverless-http');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
app.use( UserRouters);
app.use( TaskRouters);
app.use( subTaskRouter);

// Database connection
dbConnect().catch((err) => {
  console.error("Database connection failed:", err);
  throw new Error("Database connection failed");
});

// Root route (for testing)
app.get('/test', (req, res) => {
  res.send('Welcome to the application deployed on Lambda!');
});


// Export handler for AWS Lambda
module.exports.handler = serverless(app);
