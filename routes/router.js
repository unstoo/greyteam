const express = require('express');
const router = express.Router();
const { promisify } = require('util');

const { generateSecureToken } = require('../utils/generator-secure-token')
const { sendEmail } = require('../emails/nodemailer')

const { redisClient } = require('../storage/redis');
const EXISTS = promisify(redisClient.EXISTS).bind(redisClient);
const HGETALL = promisify(redisClient.HGETALL).bind(redisClient);
const HMSET = promisify(redisClient.HMSET).bind(redisClient);

router.get('/', function (req, res, next) {
  return res.sendFile(path.join(__dirname + '/template/index.html'));
});


router.post('/registration', function (req, res, next) {
      const { email, password } = req.body
  if (email && password) {
      redisClient.EXISTS(email, (err, result, next) => {
        
        if (err) {
          next('Redis EXISTS err: ', err)
        }

        if (result === 1) {
          return res.end('email already exists. please login')
        }

        generateSecureToken((err, activationToken, next) => {
            if (err) {
              next(new Error(500))
            }

        redisClient.HMSET(email, 
          'password', password, 
          'activated', 0,
          'activationToken', activationToken, (err, result, next) => {
          if (err){
            next(new Error(500))
          }

          //send email
          sendEmail({
            email,
            activationToken,
            baseUrl: 'https://greyteam.localtunnel.me/activation'
          }, (err, result) => {
            if (err) {
              next(new Error(500))
            }
            
            return res.end(`<!DOCTYPE html>
            <html><head><meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>GreyTeam</title></head>
            <body>Чтобы закончить регистрацию, подтвердите получение письма, отправленное на ${email}</body></html>`)
          })

        })     
        })
      })

  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

router.get('/activation', async (req, res, next) => {
  const { email, activationToken } = req.query
  
  try {
    const userExists = await EXISTS(email)

    if (!userExists) {
      return res.end('Unkown email address. Register.')
    }

    const userData = await HGETALL(email)

    console.log(userData)

    if (userData.activationToken !== activationToken) {
      return res.end('Mamkin khakher.')
    }

    if (userData.activationToken === activationToken && userData.activated == 0) {
      console.log('activated')
      const result = await HMSET(email, 'activated', 1)
      return res.end('Activated.')
    }

    if (userData.activationToken === activationToken && userData.activated ==1) {
      return res.end('Account is already activated. Login.')
      
    }
  } catch (err) {
    next(new Error(500, err))
  }
})

router.get('/profile', function (req, res, next) {
  const { session } = req
  if (session.email) {
    
    return res.end('Welcome ' + session.email)
  } else { 
    return res.redirect('/')
  }
});

router.post('/login', function (req, res, next) {
  console.log('login attempt')
  console.log('session: ', req.session.id)
  console.log('session: ', req.session)
  let session = req.session;
  if (session.email) {
    
    return res.end('Welcome ' + session.email)
  } else {
    console.log(req.body)
      //try to login
      req.session.email = req.body.email
      req.session.save((err) => {
        res.send('Logged in');
        return res.end()
      }) 
    }
});


router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('localhost:3000');
      }
    });
  }
});

module.exports = router;