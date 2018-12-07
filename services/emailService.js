const Email = require("email-templates");
const { config } = require("../config");

const sendMail = async (to, data) => {
  const email = new Email({
    message: {
      from: config.email_username
    },
    send: true,
    transport: {
      service: "Gmail",
      auth: {
        user: config.email_username,
        pass: config.email_password
      }
    },
    views: {
      options: {
        extension: "ejs"
      }
    }
  });

  await email.send({
    template: "reports",
    message: {
      to
    },
    locals: {
      name: "Webex User",
      results: data
    }
  });
};

exports.sendMail = sendMail;
