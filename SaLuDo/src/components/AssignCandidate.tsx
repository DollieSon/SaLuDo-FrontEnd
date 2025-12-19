import React, { useState, useEffect } from "react";
import { candidatesApi, usersApi, jobsApi } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./css/AssignCandidate.css";

interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface Candidate {
  candidateId: string;
  name: string;
  email: string[];
  assignedHRUserIds?: string[];
  status: string;
  roleApplied: string | null;
  dateCreated: string;
}

interface Job {
  _id: string;
  jobName: string;
}

interface AssignedUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const AssignCandidate: React.FC = () => {
  const { accessToken } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("name-asc");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCandidate) {
      fetchAssignedUsers();
    }
  }, [selectedCandidate]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [candidatesRes, usersRes, jobsRes] = await Promise.all([
        candidatesApi.getAllCandidates(accessToken!),
        usersApi.getAllUsers(accessToken!, { page: 1, limit: 100 }),
        jobsApi.getAllJobs(accessToken!),
      ]);

      if (candidatesRes.success) {
        setCandidates(candidatesRes.data);
      }

      if (usersRes && usersRes.success && usersRes.data) {
        // Filter to only show assignable users (HR_USER, RECRUITER, INTERVIEWER)
        const assignableUsers = usersRes.data.filter(
          (user: User) =>
            ["hr_user", "recruiter", "interviewer"].includes(user.role) &&
            user.isActive
        );
        setUsers(assignableUsers);
      }

      if (jobsRes && jobsRes.success && jobsRes.data) {
        setJobs(jobsRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignedUsers = async () => {
    try {
      const response = await candidatesApi.getCandidateAssignments(
        selectedCandidate,
        accessToken!
      );
      if (response.success && response.data) {
        // response.data is an array of user IDs
        const userIds = response.data;

        // Get full user objects from the users list we already have
        const assignedUserObjects = users.filter((user) =>
          userIds.includes(user.userId)
        );
        setAssignedUsers(assignedUserObjects);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const handleAssign = async () => {
    if (!selectedCandidate || !selectedUser) {
      setMessage({
        type: "error",
        text: "Please select both a candidate and a user",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await candidatesApi.assignUserToCandidate(
        selectedCandidate,
        selectedUser,
        accessToken!
      );

      if (response.success) {
        setMessage({ type: "success", text: "User assigned successfully!" });
        setSelectedUser("");
        fetchAssignedUsers();
      } else {
        setMessage({
          type: "error",
          text: response.message || "Assignment failed",
        });
      }
    } catch (error) {
      console.error("Error assigning user:", error);
      setMessage({ type: "error", text: "Failed to assign user" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassign = async (userId: string) => {
    if (!selectedCandidate) return;

    try {
      setIsLoading(true);
      const response = await candidatesApi.unassignUserFromCandidate(
        selectedCandidate,
        userId,
        accessToken!
      );

      if (response.success) {
        setMessage({ type: "success", text: "User unassigned successfully!" });
        fetchAssignedUsers();
      } else {
        setMessage({
          type: "error",
          text: response.message || "Unassignment failed",
        });
      }
    } catch (error) {
      console.error("Error unassigning user:", error);
      setMessage({ type: "error", text: "Failed to unassign user" });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCandidates = candidates
    .filter((candidate) => {
      // Search filter
      const matchesSearch =
        (candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (candidate.email?.some((e) =>
          e?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ?? false);
      
      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter !== "all" && candidate.status !== statusFilter) {
        return false;
      }

      // Assignment filter
      if (assignmentFilter !== "all") {
        const isAssigned = candidate.assignedHRUserIds && candidate.assignedHRUserIds.length > 0;
        if (assignmentFilter === "assigned" && !isAssigned) return false;
        if (assignmentFilter === "unassigned" && isAssigned) return false;
      }

      // Job filter
      if (jobFilter !== "all") {
        if (jobFilter === "general") {
          // General application (no job)
          if (candidate.roleApplied !== null) return false;
        } else {
          // Specific job
          if (candidate.roleApplied !== jobFilter) return false;
        }
      }

      // Date range filter
      if (dateRangeFilter !== "all") {
        const candidateDate = new Date(candidate.dateCreated);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - candidateDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dateRangeFilter === "7d" && daysDiff > 7) return false;
        if (dateRangeFilter === "30d" && daysDiff > 30) return false;
        if (dateRangeFilter === "90d" && daysDiff > 90) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort logic
      switch (sortOption) {
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "");
        case "date-desc":
          return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
        case "date-asc":
          return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
        default:
          return 0;
      }
    });

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "hr_user":
        return "badge-hr-user";
      case "recruiter":
        return "badge-recruiter";
      case "interviewer":
        return "badge-interviewer";
      default:
        return "badge-default";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "hr_user":
        return "HR User";
      case "recruiter":
        return "Recruiter";
      case "interviewer":
        return "Interviewer";
      default:
        return role;
    }
  };

  return (
    <div className="candidate-list">
      <div className="candidate-list-header" data-text="Assign candidates to HR users, recruiters, or interviewers">
        <h2>Assign Candidates to Users</h2>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      {/* Filters Section - Outside panels */}
      <div className="filters-container">
        <h3>Filters</h3>
        <div className="filters-section">
          <div className="filter-row">
            <div className="filter-group">
              <label>Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Reference Check">Reference Check</option>
                <option value="Offer">Offer</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Assignment:</label>
              <select value={assignmentFilter} onChange={(e) => setAssignmentFilter(e.target.value)}>
                <option value="all">All Candidates</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Job:</label>
              <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
                <option value="all">All Jobs</option>
                <option value="general">General Application</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.jobName}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Date Range:</label>
              <select value={dateRangeFilter} onChange={(e) => setDateRangeFilter(e.target.value)}>
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By:</label>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
              </select>
            </div>

            <div className="filter-group">
              <button 
                className="btn-clear-filters"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setAssignmentFilter("all");
                  setJobFilter("all");
                  setDateRangeFilter("all");
                  setSortOption("name-asc");
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="results-count">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </div>
        </div>
      </div>

      <div className="assign-content">
        {/* Left Panel - Candidate Selection */}
        <div className="panel candidate-panel">
          <h2>Select Candidate</h2>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="candidate-list">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.candidateId}
                className={`candidate-item ${
                  selectedCandidate === candidate.candidateId ? "selected" : ""
                }`}
                onClick={() => setSelectedCandidate(candidate.candidateId)}
              >
                <div className="candidate-info">
                  <h3>{candidate.name}</h3>
                  <p>{candidate.email[0]}</p>
                  {candidate.assignedHRUserIds &&
                    candidate.assignedHRUserIds.length > 0 && (
                      <span className="assignment-count">
                        {candidate.assignedHRUserIds.length} assigned
                      </span>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Panel - Assignment */}
        {selectedCandidate && (
          <div className="panel assignment-panel">
            <h2>Assign User</h2>

            <div className="assign-form">
              <label>Select User to Assign:</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                disabled={isLoading}
              >
                <option value="">-- Select User --</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.firstName} {user.lastName} (
                    {getRoleDisplayName(user.role)})
                  </option>
                ))}
              </select>

              <button
                onClick={handleAssign}
                disabled={!selectedUser || isLoading}
                className="btn-assign"
              >
                {isLoading ? "Assigning..." : "Assign User"}
              </button>
            </div>

            {/* Currently Assigned Users */}
            <div className="assigned-users-section">
              <h3>Currently Assigned Users</h3>
              {assignedUsers.length === 0 ? (
                <p className="no-assignments">No users assigned yet</p>
              ) : (
                <div className="assigned-users-list">
                  {assignedUsers.map((user) => (
                    <div key={user.userId} className="assigned-user-item">
                      <div className="user-info">
                        <strong>
                          {user.firstName} {user.lastName}
                        </strong>
                        <span className="user-email">{user.email}</span>
                        <span
                          className={`role-badge ${getRoleBadgeClass(
                            user.role
                          )}`}
                        >
                          {getRoleDisplayName(user.role)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleUnassign(user.userId)}
                        disabled={isLoading}
                        className="btn-unassign"
                      >
                        Unassign
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Panel - Instructions */}
        {!selectedCandidate && (
          <div className="panel instructions-panel">
            <h2>How to Assign</h2>
            <ol>
              <li>Select a candidate from the list on the left</li>
              <li>
                Choose a user to assign (HR User, Recruiter, or Interviewer)
              </li>
              <li>Click "Assign User" to complete the assignment</li>
              <li>
                Assigned users will be able to view and edit that candidate
              </li>
              <li>You can unassign users at any time</li>
            </ol>

            <div className="tip-box">
              <strong>Note:</strong> Users can only view candidates assigned to
              them, while Managers and Admins can view all candidates.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignCandidate;
