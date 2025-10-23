import React, { useState, useEffect } from "react";
import { candidatesApi, usersApi } from "../utils/api";
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
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);

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
      const [candidatesRes, usersRes] = await Promise.all([
        candidatesApi.getAllCandidates(accessToken!),
        usersApi.getAllUsers(accessToken!, { page: 1, limit: 100 }),
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

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.some((e) =>
        e.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

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
    <div className="assign-candidate-container">
      <div className="assign-header">
        <h1>Assign Candidates to Users</h1>
        <p>Assign candidates to HR users, recruiters, or interviewers</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)}>×</button>
        </div>
      )}

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

            <div className="info-box">
              <strong>💡 Tip:</strong> Users can only see candidates assigned to
              them, while Managers and Admins can see all candidates.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignCandidate;
