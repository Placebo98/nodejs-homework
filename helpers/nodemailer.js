require("dotenv").config();
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

const message = {
  to: "oleg.tsaryk98@gmail.com",
  from: "oleg.tsaryk98@gmail.com",
  subject: "Test email",
  html: "<h1>Test email from Oleg </h1>",
  text: "Test email from Oleg",
};

transport
  .sendMail(message)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.error(error);
  });
