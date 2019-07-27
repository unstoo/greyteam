const nodemailer = require("nodemailer")
const { email, password, smtpServer, smtpPort } = require("./yandex-credentials.conf.json")

let transporter = nodemailer.createTransport({
  host: smtpServer,
  port: smtpPort,
  auth: {
    user: email,
    pass: password
  }
})

async function sendEmail({email, activationToken, baseUrl}, cb){


  // create reusable transporter object using the default SMTP transport
 
  let info
  // send mail with defined transport object
  try {
    info = await transporter.sendMail({
    from: '"GreyTeam" <yevgenykozlov@yandex.ru>',
    to: email,
    subject: "GreyTeam - Активация аккаунта", // Subject line
    text: `${baseUrl}?email=${email}&activationToken=${activationToken}`, // plain text body
    // html: "<b>Hello world?</b>" // html body
  })
} catch (error) {
  console.log("Nodemailer err: %s", error);
  return cb(error)
}

  cb(null, info)

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>.
}

// sendMail({email: 'unstoo@gmail.com', 
// activationToken: 'erunda33331', 
// baseUrl: 'https://greyteam.localtunnel.me'}, 
// (err, result) => {
//   if (err) return console.log('Nodemailer err: %s', err)
//   console.log("OK: %s", result)
// })

module.exports = {
  sendEmail
}