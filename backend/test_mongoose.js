const mongoose = require("mongoose");
require("dotenv").config();
const File = require("./models/File");

async function testArrayQuery() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected");
  // Let's find one paper with "Semester 8" and one with "3"
  const filter = { semester: ["3", "Semester 8"] };
  try {
    const files = await File.find(filter).limit(5);
    console.log("Found:", files.map(f => f.semester));
  } catch (err) {
    console.error("Error:", err.message);
  }
  mongoose.disconnect();
}

testArrayQuery();
