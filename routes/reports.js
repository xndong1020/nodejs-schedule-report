var express = require("express");
var router = express.Router();
var { io } = require("../io");

/* GET users listing. */
router.get("/:reportId", function(req, res, next) {
  const id = req.params.reportId;
  res.render("report", { title: `Report for ${id}` });
});

router.get("/", function(req, res, next) {
  res.render("report", { title: `All Reports` });
});

module.exports = router;
