const express = require('express');
const PORT = 3000
const bodyParser = require('body-parser');


const app = express();
const { redisStore, redisClient, session } = require('./storage/redis.js')


app.use(session({
  secret: 'work hard',
  cookie: { maxAge: 60000 },
  resave: true,
  saveUninitialized: false,
  store: new redisStore({ host: '127.0.0.1', port: 6379, client: redisClient })
}))




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



app.use(express.static(__dirname + '/template'));


var routes = require('./routes/router');
app.use('/', routes);


app.use(function (req, res, next) {
  var err = new Error('Address Not Found');
  err.status = 404;
  next(err);
});


app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});


app.listen(PORT, function () {
  console.log('Express listening on ' + PORT);
});

