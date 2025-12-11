import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usersApi } from "../utils/api";
import { UserProfile, UserRole } from "../types/user";
import ResetPasswordModal from "./ResetPasswordModal";
import "../styles/UserManagement.css";

interface UserManagementProps {
  accessToken: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ accessToken }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // New user form state
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    title: "",
    role: UserRole.HR_USER,
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getAllUsers(accessToken, {
        page: pagination.page,
        limit: pagination.limit,
        role: roleFilter || undefined,
        isActive: statusFilter ? statusFilter === "active" : undefined,
        search: searchTerm || undefined,
      });

      if (response.success) {
        setUsers(response.data);
        setPagination((prev) => ({
          ...prev,
          totalCount: response.pagination.totalCount,
          totalPages: response.pagination.totalPages,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, roleFilter, statusFilter, searchTerm]);

  // Handle create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await usersApi.createUser(accessToken, newUser);
      if (response.success) {
        alert("User created successfully!");
        setShowCreateModal(false);
        setNewUser({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          middleName: "",
          title: "",
          role: UserRole.HR_USER,
        });
        fetchUsers();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await usersApi.setUserActiveStatus(
        accessToken,
        userId,
        !currentStatus
      );
      if (response.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to update user status"
      );
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        const response = await usersApi.deleteUser(accessToken, userId);
        if (response.success) {
          alert("User deleted successfully");
          fetchUsers();
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete user");
      }
    }
  };

  // Handle reset password
  const handleResetPassword = async (data: { reason?: string; customPassword?: string }) => {
    if (!selectedUser) return { password: '' };
    
    try {
      const response = await usersApi.adminResetPassword(
        accessToken,
        selectedUser.userId,
        data.reason,
        data.customPassword
      );
      if (response.success) {
        // Return the password so modal can display it
        return { password: response.data.password };
      }
      return { password: '' };
    } catch (err) {
      throw err; // Let modal handle the error
    }
  };

  // Open reset password modal
  const openResetPasswordModal = (user: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUser(user);
    setShowResetPasswordModal(true);
  };

  // Get role display name
  const getRoleDisplayName = (role: UserRole) => {
    const roleNames: Record<UserRole, string> = {
      [UserRole.ADMIN]: "Administrator",
      [UserRole.HR_MANAGER]: "HR Manager",
      [UserRole.HR_USER]: "HR User",
      [UserRole.RECRUITER]: "Recruiter",
      [UserRole.INTERVIEWER]: "Interviewer",
    };
    return roleNames[role];
  };

  if (loading && users.length === 0) {
    return <div className="user-management-loading">Loading users...</div>;
  }

  return (
    <div className="candidate-list">
      <div className="candidate-list-header" data-text="Create and update user accounts">
        <h2>User Management</h2>
        <div className="header-actions">
          <button
          className="compare-candidates-btn"
          onClick={() => setShowCreateModal(true)}
          >
            + Create New User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="controls" style={{margin: "20px 30px"}}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Roles</option>
          <option value="admin">Administrator</option>
          <option value="hr_manager">HR Manager</option>
          <option value="hr_user">HR User</option>
          <option value="recruiter">Recruiter</option>
          <option value="interviewer">Interviewer</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Users Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Title</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr 
                key={user.userId}
                onClick={(e) => {
                  // Don't navigate if clicking on action buttons
                  if ((e.target as HTMLElement).closest('.actions-buttons')) {
                    return;
                  }
                  navigate(`/user-profile/${user.userId}`);
                }}
                style={{ cursor: 'pointer' }}
                title="Click to view profile"
              >
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.title}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      user.isActive ? "status-active" : "status-inactive"
                    }`}
                  >
                    {user.isActive ? " Active" : " Inactive"}
                  </span>
                </td>
                <td>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "--"}
                </td>
                <td>
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "No logins yet"}
                </td>
                <td>
                  <div className="actions-buttons">
                    <button
                      className="action-btn edit btn-reset-password"
                      onClick={(e) => openResetPasswordModal(user, e)}
                      title="Reset user password - set custom or generate random"
                    >
                      Reset Password
                    </button>
                    <button
                      className={`action-btn edit ${
                        user.isActive ? "btn-deactivate" : "btn-activate"
                      }`}
                      onClick={() =>
                        handleToggleStatus(user.userId, user.isActive)
                      }
                      title={user.isActive ? "Deactivate" : "Activate"}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="delete-candidate"
                      onClick={() => handleDeleteUser(user.userId, user.fullName)}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={pagination.page === 1}
          onClick={() =>
            setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
          }
          className="pagination-btn"
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {pagination.page} of {pagination.totalPages} (
          {pagination.totalCount} total users)
        </span>
        <button
          disabled={pagination.page >= pagination.totalPages}
          onClick={() =>
            setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
          }
          className="pagination-btn"
        >
          Next
        </button>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New User</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    required
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Middle Name</label>
                  <input
                    type="text"
                    value={newUser.middleName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, middleName: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  required
                  value={newUser.title}
                  onChange={(e) =>
                    setNewUser({ ...newUser, title: e.target.value })
                  }
                  placeholder="e.g., Senior Recruiter"
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  required
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value as UserRole })
                  }
                >
                  <option value={UserRole.HR_USER}>HR User</option>
                  <option value={UserRole.RECRUITER}>Recruiter</option>
                  <option value={UserRole.INTERVIEWER}>Interviewer</option>
                  <option value={UserRole.HR_MANAGER}>HR Manager</option>
                  <option value={UserRole.ADMIN}>Administrator</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {selectedUser && (
        <ResetPasswordModal
          isOpen={showResetPasswordModal}
          onClose={() => {
            setShowResetPasswordModal(false);
            setSelectedUser(null);
          }}
          onConfirm={handleResetPassword}
          userName={selectedUser.fullName}
          userEmail={selectedUser.email}
        />
      )}
    </div>
  );
};

export default UserManagement;
