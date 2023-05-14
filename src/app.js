const express = require("express");
const APIFeatures = require("./utils/apiFeatures");
const Test = require("./modules/testModel");
const app = express();

app.get("/tests", async (req, res) => {
  const testQuery = APIFeatures(Test.find(), req.query)
    .sort()
    .filter()
    .paginate()
    .limitFields();

  res.status(200).json({ status: "success", data: await testQuery });
});

module.exports = app;
