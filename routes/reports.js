const express = require("express");
const router = express.Router();
const { readCallHistoryGetResultByID } = require("../mongodbHelpers");

/* GET users listing. */
router.get("/:reportId", async (req, res) => {
  const id = req.params.reportId;
  console.log("reportId", id);
  const result = await readCallHistoryGetResultByID(id);
  console.log("report results", result.data);
  res.render("report", { title: `Report for ${id}`, results : result.data });
});

router.get("/", (req, res) => {
  res.render("report", { title: `All Reports` });
});

module.exports = router;
