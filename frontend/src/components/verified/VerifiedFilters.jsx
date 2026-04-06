import React, { useEffect } from "react";

const VerifiedFilters = ({
  degree,
  setDegree,
  regulation,
  setRegulation,
  semester,
  setSemester,
  branch,
  setBranch,
  examType,
  setExamType,
}) => {
  const updateFilter = (key, value) => {
    localStorage.setItem(key, value);
  };

  useEffect(() => {
    const saveDegree = localStorage.getItem("degree");
    const saveRegulation = localStorage.getItem("regulation");
    const saveSemester = localStorage.getItem("semester");
    const saveBranch = localStorage.getItem("branch");
    const saveExamType = localStorage.getItem("examType");

    if (saveDegree) setDegree(saveDegree);
    if (saveRegulation) setRegulation(saveRegulation);
    if (saveSemester) setSemester(saveSemester);
    if (saveBranch) setBranch(saveBranch);
    if (saveExamType) setExamType(saveExamType);
  }, []);

  return (
    <div className="filters-grid">
      <label>
        Degree
        <select
          value={degree}
          onChange={(e) => {
            setDegree(e.target.value);
            updateFilter("degree", e.target.value);
          }}
        >
          <option value="">-- Select Degree --</option>
          <option value="B.Tech">B.Tech</option>
          <option value="M.Tech">M.Tech</option>
        </select>
      </label>

      <label>
        Regulation
        <select
          value={regulation}
          onChange={(e) => {
            setRegulation(e.target.value);
            updateFilter("regulation", e.target.value);
          }}
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
          onChange={(e) => {
            setSemester(e.target.value);
            updateFilter("semester", e.target.value);
          }}
        >
          <option value="">-- Select Semester --</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n}>Semester {n}</option>
          ))}
        </select>
      </label>
      
      <label>
        Branch
        <select
          value={branch}
          onChange={(e) => {
            setBranch(e.target.value);
            updateFilter("branch", e.target.value);
          }}
        >
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
          onChange={(e) => {
            setExamType(e.target.value);
            updateFilter("examType", e.target.value);
          }}
        >
          <option value="">-- Select Exam Type --</option>
          <option value="Mid-1">Mid-1</option>
          <option value="Mid-2">Mid-2</option>
          <option value="Semester">Semester</option>
          <option value="Supplementary">Supplementary</option>
        </select>
      </label>
    </div>
  );
};

export default VerifiedFilters;
