import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminPapers.css";
import Navbar from "../Navbar";
import Footer from "../landing/Footer";
import ImageModal from "../verified/ImageModal";
import { API_BASE_URL } from "../../config/api";

const AdminPapers = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Filter States
  const [status, setStatus] = useState("pending"); // Default to pending as requested

  // Data States
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // Track loading state of individual actions (approve/delete)

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch papers
  const fetchFiles = async () => {
    if (!API_BASE_URL) {
      setError("API URL is not configured.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (status) params.append("status", status); // Can be empty for 'All'

      const response = await axios.get(`${API_BASE_URL}/api/getfile?${params.toString()}`);
      setFiles(response.data);
    } catch (err) {
      setError("Unable to load papers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when authenticated and filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles();
    }
  }, [isAuthenticated, status]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) {
      setLoginError("Password is required");
      return;
    }

    try {
      setLoginLoading(true);
      setLoginError("");
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { password });
      
      if (response.data.success && response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError("Invalid credentials");
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || "Login failed. Check server connection.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setPassword("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this paper from the database? This action cannot be undone.")) return;

    const token = localStorage.getItem("adminToken");
    setActionLoading((prev) => ({ ...prev, [id]: "deleting" }));

    try {
      await axios.delete(`${API_BASE_URL}/api/deletefile/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from UI list
      setFiles((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      alert("Failed to delete paper: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-page">
        <Navbar />
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h2>Admin Access Gate</h2>
              <p>Please enter the administrator password to manage exam papers.</p>
            </div>
            
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="password">Security Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {loginError && <div className="login-error-alert">{loginError}</div>}

              <button type="submit" className="btn btn-primary login-btn" disabled={loginLoading}>
                {loginLoading ? <span className="small-spinner"></span> : "Authenticate"}
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <Navbar />

      <div className="container dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Admin Panel</h1>
            <p>Review, verify, or remove exam papers uploaded by students.</p>
          </div>
          <div className="dashboard-controls">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="status-select-header"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="verified">Verified Papers</option>
            </select>
            <button onClick={handleLogout} className="btn btn-outline logout-btn">
              Sign Out
            </button>
          </div>
        </div>

        {/* Results directory */}
        <div className="results-section">
          <div className="results-header-admin">
            <h2>Paper Catalog</h2>
            {!loading && (
              <span className="count-badge">
                {files.length} {files.length === 1 ? "paper" : "papers"} listed
              </span>
            )}
          </div>

          {loading ? (
            <div className="admin-status-box">
              <div className="spinner"></div>
              <p>Fetching papers from directory...</p>
            </div>
          ) : error ? (
            <div className="admin-error-box">{error}</div>
          ) : files.length === 0 ? (
            <div className="admin-empty-box">
              <p>No papers match the current filters.</p>
              <span className="text-muted">All clear! No pending reviews found for these criteria.</span>
            </div>
          ) : (
            <div className="admin-grid">
              {files.map((file) => (
                <div key={file._id} className={`admin-paper-card ${file.status === "verified" ? "verified-border" : "pending-border"}`}>
                  <div className="card-top">
                    <div className="card-title-section">
                      <h4>{file.subject || "Exam Paper"}</h4>
                      <span className={`status-pill ${file.status}`}>
                        {file.status}
                      </span>
                    </div>
                    
                    <div className="metadata-tag-grid">
                      <span className="meta-tag">{file.degree}</span>
                      <span className="meta-tag">{file.regulation}</span>
                      <span className="meta-tag">{file.semester}</span>
                      <span className="meta-tag">{file.branch}</span>
                      <span className="meta-tag">{file.examType}</span>
                    </div>

                    <p className="upload-date">
                      Uploaded on {new Date(file.createdAt).toLocaleDateString()} at {new Date(file.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="card-actions-row">
                    <button
                      className="btn btn-outline view-action-btn"
                      onClick={() => setSelectedFileUrl(file.fileUrl)}
                      disabled={actionLoading[file._id]}
                    >
                      View
                    </button>
                    

                    <button
                      className="btn delete-action-btn"
                      onClick={() => handleDelete(file._id)}
                      disabled={actionLoading[file._id]}
                    >
                      {actionLoading[file._id] === "deleting" ? <span className="small-spinner"></span> : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ImageModal 
        fileUrl={selectedFileUrl} 
        onClose={() => setSelectedFileUrl(null)} 
      />

      <Footer />
    </div>
  );
};

export default AdminPapers;
