const session = require('express-session');
const redisStore = require('connect-redis')(session);
const redisClient = require("redis").createClient()
// redisClient.AUTH('xxxxx')

module.exports = {
    redisStore,
    redisClient,
    session
}