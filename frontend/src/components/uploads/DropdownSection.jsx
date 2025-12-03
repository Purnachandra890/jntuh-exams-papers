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
        <select value={degree} onChange={(e) => setDegree(e.target.value)}>
          <option value="">-- Select Degree --</option>
          <option value="B.Tech">B.Tech</option>
          <option value="M.Tech">M.Tech</option>
        </select>
      </label>

      <label>
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
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">-- Select Semester --</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>

      <label>
        <select value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="">-- Select Branch --</option>
          <option>CSE</option>
          <option>ECE</option>
          <option>EEE</option>
          <option>MECH</option>
          <option>CIVIL</option>
        </select>
      </label>

      <label className="subject-input-container">
        <input
          type="text"
          placeholder="Enter Subject Name"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </label>

      <label>
        <select
          value={examType}
          onChange={(e) => setExamType(e.target.value)}
        >
          <option value="">-- Select Exam Type --</option>
          <option>Mid-1</option>
          <option>Mid-2</option>
          <option>Semester</option>
          <option>Supplementary</option>
        </select>
      </label>

      <label>
        <select
          value={paperSides}
          onChange={(e) => setPaperSides(e.target.value)}
        >
          <option value="">-- Exam Paper Sides --</option>
          <option value="one">One Side</option>
          <option value="two">Two Sides</option>
        </select>
      </label>
    </div>
  );
};

export default DropdownSection;
