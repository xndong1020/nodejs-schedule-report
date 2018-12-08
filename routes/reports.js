const express = require("express");
const router = express.Router();
const {
  readCallHistoryGetResultByID,
  getCallHistoryReportList
} = require("../mongodbHelpers");
// const mailer = require("../services/emailService");

/* GET users listing. */
router.get("/:reportId", async (req, res) => {
  const id = req.params.reportId;
  const result = await readCallHistoryGetResultByID(id);

  // send email to users
  // await mailer.sendMail("isdance2004@hotmail.com", result.data);
  res.render("report", { title: `Report for ${id}`, results: result.data });
});

router.get("/", async (req, res) => {
  const results = (await getCallHistoryReportList()).map( data => {
    return {
      reportId: data._id,
      date: data.date,
      status: data.data[0].status
    }
  });
  res.render("reports", { title: `All Reports`, results });
});

module.exports = router;
