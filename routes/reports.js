const express = require("express");
const router = express.Router();
const { readCallHistoryGetResultByID } = require("../mongodbHelpers");
const mailer = require("../services/emailService");

/* GET users listing. */
router.get("/:reportId", async (req, res) => {
  const id = req.params.reportId;
  const result = await readCallHistoryGetResultByID(id);
  
  // send email to users
  await mailer.sendMail("isdance2004@hotmail.com", result.data);
  res.render("report", { title: `Report for ${id}`, results: result.data });
});

router.get("/", (req, res) => {
  res.render("report", { title: `All Reports` });
});

module.exports = router;
