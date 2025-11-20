import React, { useState, useEffect } from "react";
import { skillsApi } from "../utils/api";
import "./css/CandidateList.css"; // Using the same CSS for consistent styling

interface SkillMaster {
  skillId: string;
  skillName: string;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SkillStats {
  total: number;
  accepted: number;
  pending: number;
  mostUsed?: string;
  mostUsedCount?: number;
}

const SkillsManagement: React.FC = () => {
  const [skills, setSkills] = useState<SkillMaster[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<SkillMaster[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "accepted" | "pending"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SkillStats>({
    total: 0,
    accepted: 0,
    pending: 0,
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedSkills, setPaginatedSkills] = useState<SkillMaster[]>([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillMaster | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Form states
  const [newSkillName, setNewSkillName] = useState("");
  const [editSkillName, setEditSkillName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch skills from API
  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      // Use the skillsApi utility function to get only skills used by candidates
      const result = await skillsApi.getUsedMasterSkills();

      if (result.success && result.data) {
        const skillsData = result.data.map((skill: any) => ({
          ...skill,
          createdAt: new Date(skill.createdAt || new Date()),
          updatedAt: new Date(skill.updatedAt || new Date()),
        }));
        setSkills(skillsData);
        calculateStats(skillsData);
        setError(null); // Clear any previous errors
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching skills:", err);
      setError(err instanceof Error ? err.message : "Failed to load skills");
      // Show demo data as fallback
      const demoSkills: SkillMaster[] = [
        {
          skillId: "1",
          skillName: "JavaScript",
          isAccepted: true,
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15"),
        },
        {
          skillId: "2",
          skillName: "React.js",
          isAccepted: true,
          createdAt: new Date("2024-01-20"),
          updatedAt: new Date("2024-01-20"),
        },
        {
          skillId: "3",
          skillName: "Node.js",
          isAccepted: false,
          createdAt: new Date("2024-02-01"),
          updatedAt: new Date("2024-02-01"),
        },
      ];
      setSkills(demoSkills);
      calculateStats(demoSkills);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (skillsData: SkillMaster[]) => {
    const total = skillsData.length;
    const accepted = skillsData.filter((skill) => skill.isAccepted).length;
    const pending = total - accepted;

    setStats({
      total,
      accepted,
      pending,
      mostUsed: skillsData.length > 0 ? skillsData[0].skillName : undefined,
      mostUsedCount: 0,
    });
  };

  // Filter skills based on search and status
  useEffect(() => {
    let filtered = skills;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((skill) =>
        skill.skillName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((skill) =>
        statusFilter === "accepted" ? skill.isAccepted : !skill.isAccepted
      );
    }

    setFilteredSkills(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [skills, searchTerm, statusFilter]);

  // Pagination logic
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filteredSkills.slice(startIndex, endIndex);
    setPaginatedSkills(paginated);
  }, [filteredSkills, currentPage, itemsPerPage]);

  // Pagination helper functions
  const totalPages = Math.ceil(filteredSkills.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredSkills.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Add new skill
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setError(
      "Direct skill creation is not available through this interface. Skills are automatically created when they are added to candidates through the candidate management system. To add a new skill to the master database, please add it to a candidate first."
    );
    setIsSubmitting(false);
  };

  // Edit skill
  const handleEditSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkill || !editSkillName.trim()) return;

    try {
      setIsSubmitting(true);

      const result = await skillsApi.updateSkillMaster(selectedSkill.skillId, {
        skillName: editSkillName.trim(),
      });

      if (result.success) {
        setEditSkillName("");
        setSelectedSkill(null);
        setShowEditModal(false);
        fetchSkills(); // Refresh the list
        setError(null);
      } else {
        throw new Error(result.message || "Failed to update skill");
      }
    } catch (err) {
      console.error("Error updating skill:", err);
      setError(err instanceof Error ? err.message : "Failed to update skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete skill (soft delete by setting isAccepted: false)
  const handleDeleteSkill = async (skillId: string) => {
    if (
      !confirm(
        "Are you sure you want to reject this skill? This will set it as not accepted."
      )
    )
      return;

    try {
      const result = await skillsApi.rejectSkill(skillId);

      if (result.success) {
        fetchSkills(); // Refresh the list
        setError(null);
      } else {
        throw new Error(result.message || "Failed to reject skill");
      }
    } catch (err) {
      console.error("Error rejecting skill:", err);
      setError(err instanceof Error ? err.message : "Failed to reject skill");
    }
  };

  // Toggle skill acceptance
  const handleToggleAcceptance = async (skill: SkillMaster) => {
    try {
      const result = skill.isAccepted
        ? await skillsApi.rejectSkill(skill.skillId)
        : await skillsApi.acceptSkill(skill.skillId);

      if (result.success) {
        fetchSkills(); // Refresh the list
        setError(null);
      } else {
        throw new Error(result.message || "Failed to update skill status");
      }
    } catch (err) {
      console.error("Error toggling skill acceptance:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update skill status"
      );
    }
  };

  // Handle checkbox selection for bulk operations
  const handleSkillSelection = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  };

  // Open edit modal
  const openEditModal = (skill: SkillMaster) => {
    setSelectedSkill(skill);
    setEditSkillName(skill.skillName);
    setShowEditModal(true);
  };

  // Open merge modal
  const openMergeModal = () => {
    if (selectedSkills.length < 2) {
      alert("Please select at least 2 skills to merge");
      return;
    }
    if (selectedSkills.length > 10) {
      alert(
        "You can merge a maximum of 10 skills at once to avoid performance issues"
      );
      return;
    }
    setSelectedSkill(null); // Reset selected target skill
    setShowMergeModal(true);
  };

  // Merge skills (now implemented in backend)
  const handleMergeSkills = async (targetSkillId: string) => {
    try {
      setIsSubmitting(true);

      const sourceSkillIds = selectedSkills.filter(
        (id) => id !== targetSkillId
      );

      if (sourceSkillIds.length === 0) {
        throw new Error("No source skills selected for merging");
      }

      const result = await skillsApi.mergeSkills(targetSkillId, sourceSkillIds);

      if (result.success) {
        setSelectedSkills([]);
        setShowMergeModal(false);
        fetchSkills(); // Refresh the list
        setError(null);
        alert(
          `Successfully merged ${result.data.mergedCount} skills. Updated ${result.data.updatedCandidates} candidate records.`
        );
      } else {
        throw new Error(result.message || "Failed to merge skills");
      }
    } catch (err) {
      console.error("Error merging skills:", err);
      setError(err instanceof Error ? err.message : "Failed to merge skills");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-form-bg">
        <div className="loading-container">
          <h2 className="form-title">Loading Skills...</h2>
        </div>
      </div>
    );
  }

  return (
    <main className="candidate-list">
      <div
        className="candidate-list-header"
        data-text="Accept, reject, and merge skills extracted by the AI"
      >
        <h2>Skills Management</h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close-btn">
            ✕
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="summary-cards">
        <div className="card">
          <h4>Total Skills</h4>
          <div className="number">{stats.total}</div>
          <div className="detail">0 Shown</div>
          <a className="view-more" href="/dashboard">View more →</a>
        </div>
        <div className="card">
          <h4>Accepted</h4>
          <div className="number">{stats.accepted}</div>
          <div className="detail">0 Shown</div>
          <a className="view-more" href="/dashboard">View more →</a>
        </div>
        <div className="card">
          <h4>Pending</h4>
          <div className="number">{stats.pending}</div>
          <div className="detail">0 Shown</div>
          <a className="view-more" href="/dashboard">View more →</a>
        </div>
        <div className="card">
          <h4>Most Used</h4>
          <div className="number">{stats.mostUsed || "None"}</div>
          <div className="detail">
            {stats.mostUsed ? stats.mostUsedCount + " Users" : "No Data"}
          </div>
          <a className="view-more" href="/dashboard">View more →</a>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search candidates, skills, or positions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "accepted" | "pending")
          }
          className="filter-select"
        >
          <option value="all">All Skills</option>
          <option value="accepted">Accepted</option>
          <option value="pending">Pending</option>
        </select>

        <button
          onClick={() => setShowAddModal(true)}
          className="compare-candidates-btn"
        >
          + Add Skill
        </button>

        {selectedSkills.length > 1 && (
          <button onClick={openMergeModal} className="merge-btn">
            Merge Selected ({selectedSkills.length})
          </button>
        )}
      </div>

      {/* Skills Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSkills((prev) => {
                        const newSelected = [...prev];
                        paginatedSkills.forEach((skill) => {
                          if (!newSelected.includes(skill.skillId)) {
                            newSelected.push(skill.skillId);
                          }
                        });
                        return newSelected;
                      });
                    } else {
                      setSelectedSkills((prev) =>
                        prev.filter(
                          (id) =>
                            !paginatedSkills.find(
                              (skill) => skill.skillId === id
                            )
                        )
                      );
                    }
                  }}
                  checked={
                    paginatedSkills.length > 0 &&
                    paginatedSkills.every((skill) =>
                      selectedSkills.includes(skill.skillId)
                    )
                  }
                />
              </th>
              <th>Skill Name</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSkills.map((skill) => (
              <tr key={skill.skillId}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill.skillId)}
                    onChange={() => handleSkillSelection(skill.skillId)}
                  />
                </td>
                <td className="td-skill">{skill.skillName}</td>
                <td>
                  <span
                    className={`status-badge ${
                      skill.isAccepted ? "accepted" : "pending"
                    }`}
                  >
                    {skill.isAccepted ? " Accepted" : " Pending"}
                  </span>
                </td>
                <td className="td-date">
                  {skill.createdAt.toLocaleDateString()}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => openEditModal(skill)}
                      className="action-btn edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleAcceptance(skill)}
                      className={`action-btn ${
                        skill.isAccepted ? "reject" : "accept"
                      }`}
                    >
                      {skill.isAccepted ? "Reject" : "Accept"}
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skill.skillId)}
                      className="action-btn delete"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedSkills.length === 0 && filteredSkills.length === 0 && (
          <div className="no-skills-message">
            {searchTerm || statusFilter !== "all"
              ? "No skills found matching your criteria."
              : "No skills available."}
          </div>
        )}

        {paginatedSkills.length === 0 && filteredSkills.length > 0 && (
          <div className="no-skills-message">
            No skills on this page. Try going to a previous page or changing the
            number of items per page.
          </div>
        )}

        {/* Pagination Controls */}
        {filteredSkills.length > 0 && (
          <div className="pagination-controls">
            {/* Items per page selector */}
            <div className="items-per-page">
              <span className="pagination-label">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="select-text"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="pagination-label">entries</span>
            </div>

            {/* Page info */}
            <div className="pagination-label">
              Showing {startItem} to {endItem} of {filteredSkills.length}{" "}
              entries
            </div>

            {/* Page navigation */}
            <div className="pagination-buttons">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={currentPage === pageNum ? "active" : "inactive"}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Add New Skill</h3>
            <form onSubmit={handleAddSkill}>
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Enter skill name"
                required
                className="modal-input"
              />
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewSkillName("");
                  }}
                  className="modal-button cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="modal-button primary"
                >
                  {isSubmitting ? "Adding..." : "Add Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Skill Modal */}
      {showEditModal && selectedSkill && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit Skill</h3>
            <form onSubmit={handleEditSkill}>
              <input
                type="text"
                value={editSkillName}
                onChange={(e) => setEditSkillName(e.target.value)}
                placeholder="Enter skill name"
                required
                className="modal-input"
              />
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSkill(null);
                    setEditSkillName("");
                  }}
                  className="modal-button cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="modal-button primary"
                >
                  {isSubmitting ? "Updating..." : "Update Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Merge Skills Modal */}
      {showMergeModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Merge Skills</h3>
            <p>
              Select which skill to keep as the target. All other selected
              skills will be merged into this one.
            </p>
            <p>
              <strong>Warning:</strong> This action cannot be undone. All
              candidate associations with the source skills will be transferred
              to the target skill.
            </p>
            <div className="merge-options">
              {selectedSkills.map((skillId) => {
                const skill = skills.find((s) => s.skillId === skillId);
                return skill ? (
                  <div key={skillId} className="merge-option">
                    <label>
                      <input
                        type="radio"
                        name="targetSkill"
                        value={skillId}
                        onChange={() => setSelectedSkill(skill)}
                      />
                      <strong>{skill.skillName}</strong> (
                      {skill.isAccepted ? "Accepted" : "Pending"})
                    </label>
                  </div>
                ) : null;
              })}
            </div>
            <div className="merge-buttons">
              <button
                onClick={() => {
                  setShowMergeModal(false);
                  setSelectedSkills([]);
                  setSelectedSkill(null);
                }}
                className="modal-button cancel"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedSkill) {
                    if (
                      confirm(
                        `Are you sure you want to merge ${
                          selectedSkills.length - 1
                        } skills into "${
                          selectedSkill.skillName
                        }"? This action cannot be undone.`
                      )
                    ) {
                      handleMergeSkills(selectedSkill.skillId);
                    }
                  } else {
                    alert("Please select a target skill first.");
                  }
                }}
                className="modal-button primary"
                disabled={!selectedSkill || isSubmitting}
              >
                {isSubmitting ? "Merging..." : "Merge Skills"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default SkillsManagement;
