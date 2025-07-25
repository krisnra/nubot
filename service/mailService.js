require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

async function sendMail(subject, text) {
  let info = await transporter.sendMail({
    from: '"Nusat" <nusat@psn.co.id>',
    to: ["dine.imawati@psn.co.id"],
    // to: ["genis.artiktya@psn.co.id", "dine.imawati@psn.co.id"],
    cc: ["yoga.imanda@psn.co.id", "taraf.ghoniyal@psn.co.id"],
    subject,
    text,
  });
  return info;
}

module.exports = { sendMail };
