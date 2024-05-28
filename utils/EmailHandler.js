/**Email Communication */
import hbs from 'nodemailer-express-handlebars'
import nodemailer  from 'nodemailer'
import path from 'path';
import configuration from "config"

// initialize nodemailer
let transporter = nodemailer.createTransport(
    {
        service: 'gmail',
        auth:{
            user: configuration.email.email,
            pass: configuration.email.secrete
        }
    }
);

// point to the template folder
const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve('./views/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./views/'),
};

// use a template file with nodemailer
transporter.use('compile', hbs(handlebarOptions))
// const send email

const sendEmailVerification  = async (user, secreteText) => {
    /**
     * sendEmailVerification : sends email to user with secrete text
     * @param {object} user: object containing user name and email
     * @param {string} secreteText: secret test to send
     * @return {object | null} if message is sent successfully
     */
  const mailOptions = {
    from: `"Amalitech File Server" <${configuration.email.email}>`, // sender address
    template: "email", // the name of the template file, i.e., email.handlebars
    to: user.email,
    subject: `Verfify ur email, ${user.name}`,
    context: {
      name: user.name,
      secreteText
    },
  };
  try {
    return await transporter.sendMail(mailOptions)
  } catch(err) {
    console.log(`${err} \n sending email ${user.name} ${user.email}`)
    return null
  }
}

const sendResetPassword  = async (user, secreteText) => {
  const mailOptions = {
    from: `"Reset" <${configuration.email.email}>`, // sender address
    template: "password", // the name of the template file, i.e., email.handlebars
    to: user.email,
    subject: `Reset you Password, ${user.name}`,
    context: {
      name: user.name,
      secreteText
    },
  };
  try {
    return  await transporter.sendMail(mailOptions)
  } catch(err) {
    console.log(`${err} \n sending email ${user.name} ${user.email}`)
  }
}


export {sendEmailVerification, sendResetPassword}

  