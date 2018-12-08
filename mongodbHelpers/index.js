const {
  CallHistoryGetResultReport,
  CallHistoryGetResult
} = require("../models/CallHistoryGetResult");

const saveCallHistoryGetResult = async data => {
  const result = await CallHistoryGetResultReport.create({ data });
  return result._id;
};

const readCallHistoryGetResultByID = id => {
  return new Promise((resolve, reject) => {
    CallHistoryGetResultReport.findById(id, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

const getCallHistoryReportList = async () => {
  return new Promise((resolve, reject) => {
    CallHistoryGetResultReport.find({}, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

module.exports = {
  saveCallHistoryGetResult,
  readCallHistoryGetResultByID,
  getCallHistoryReportList
};
