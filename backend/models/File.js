const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  regulation: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  subject: {              
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "verified"],
    default: "pending"
  },
  examType:{
    type:String,
    required:true
  }
}, { timestamps: true });

const File = mongoose.model('File', FileSchema);

module.exports = File;
