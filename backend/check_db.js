const mongoose = require("mongoose");
require("dotenv").config();
const File = require("./models/File");

async function checkSemesters() {
  await mongoose.connect(process.env.MONGO_URI);
  const files = await File.find({});
  const semesters = {};
  files.forEach(f => {
    semesters[f.semester] = (semesters[f.semester] || 0) + 1;
  });
  console.log("Semester values in DB:", semesters);
  mongoose.disconnect();
}

checkSemesters();
