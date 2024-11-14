const ratelimit=require("express-rate-limit")
const limiter = ratelimit({
  max: 3,
  windowMs: 10000,
});

module.exports=limiter;