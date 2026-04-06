import React from "react";

const DropdownSection = ({
  degree,
  setDegree,
  regulation,
  setRegulation,
  semester,
  setSemester,
  branch,
  setBranch,
  subject,
  setSubject,
  examType,
  setExamType,
  paperSides,
  setPaperSides,
}) => {
  return (
    <div className="dropdown-container">
      <label>
        Degree
        <select value={degree} onChange={(e) => setDegree(e.target.value)}>
          <option value="">-- Select Degree --</option>
          <option value="B.Tech">B.Tech</option>
          <option value="M.Tech">M.Tech</option>
        </select>
      </label>

      <label>
        Regulation
        <select
          value={regulation}
          onChange={(e) => setRegulation(e.target.value)}
        >
          <option value="">-- Select Regulation --</option>
          <option value="R22">R22</option>
          <option value="R20">R20</option>
          <option value="R18">R18</option>
        </select>
      </label>

      <label>
        Semester
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">-- Select Semester --</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n}>Semester {n}</option>
          ))}
        </select>
      </label>

      <label>
        Branch
        <select value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="">-- Select Branch --</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="MECH">MECH</option>
          <option value="CIVIL">CIVIL</option>
        </select>
      </label>
      
      <label>
        Exam Type
        <select
          value={examType}
          onChange={(e) => setExamType(e.target.value)}
        >
          <option value="">-- Select Exam Type --</option>
          <option value="Mid-1">Mid-1</option>
          <option value="Mid-2">Mid-2</option>
          <option value="Semester">Semester</option>
          <option value="Supplementary">Supplementary</option>
        </select>
      </label>

      <label>
        Paper Layout
        <select
          value={paperSides}
          onChange={(e) => setPaperSides(e.target.value)}
        >
          <option value="">-- Select Paper Type --</option>
          <option value="one">Single Sided</option>
          <option value="two">Double Sided</option>
        </select>
      </label>
      
      <label className="subject-input-container">
        Subject Name
        <input
          type="text"
          placeholder="e.g. Data Structures and Algorithms"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </label>

    </div>
  );
};

export default DropdownSection;
