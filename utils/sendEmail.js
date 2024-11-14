// import nodemailer from "nodemailer";
// import { emailConfig } from "../config/emailConfig.js";

const nodemailer=require('nodemailer');
const emailConfig=require('../config/emailConfig')
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(emailConfig);

// send mail with defined transport object
 const sendEmails = (to, subject, content, next) => {
  try {
    const message = {
      from: {
        name: process.env.MAIL_FROM_NAME,
        address: process.env.MAIL_USERNAME,
      },
      to: to,
      subject: subject,
      html: content,
    };
    transporter.sendMail(message, next);
  } catch (error) {
    console.error(error);
  }
};
module.exports=sendEmails;