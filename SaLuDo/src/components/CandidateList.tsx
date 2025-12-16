import "./css/CandidateList.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { candidatesApi, skillsApi } from "../utils/api";
import { JobApiClient } from '../../ForFrontEnd/clients/AllApiClients';
import { CandidateProfile } from "../types/profile";

interface JobSkillRequirement {
  skillId: string;
  requiredLevel: number;
  skillName?: string;
}

interface Job {
  _id: string;
  jobName: string;
  skills: JobSkillRequirement[];
}

interface EnhancedCandidate extends CandidateProfile {
  jobMatchScore?: number;
  matchedSkills?: number;
  totalJobSkills?: number;
  missingSkills?: string[];
}

const CandidateList: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("score_desc");

  // Fetch candidates and jobs from API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch candidates and jobs in parallel
      const [candidatesResponse, jobs] = await Promise.all([
        candidatesApi.getAllCandidates(),
        JobApiClient.getAllJobs(),
      ]);

      if (candidatesResponse.success) {
        setCandidates(candidatesResponse.data);
      } else {
        throw new Error("Failed to fetch candidates");
      }

      // Enrich job skills with proper names
      const enrichJobSkillsWithNames = async (job: Job) => {
        try {
          const skillResponse = await skillsApi.getAllMasterSkills();
          let masterSkills: any[] = [];

          if (skillResponse.success && skillResponse.data) {
            masterSkills = skillResponse.data;
          }

          job.skills = job.skills.map((skill: JobSkillRequirement) => {
            if (!skill.skillName && skill.skillId) {
              const masterSkill = masterSkills.find(
                (ms: any) =>
                  ms.skillId === skill.skillId || ms._id === skill.skillId
              );

              if (masterSkill) {
                skill.skillName = masterSkill.skillName;
              } else {
                skill.skillName = skill.skillId
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str: string) => str.toUpperCase())
                  .trim();
              }
            }
            return skill;
          });
        } catch (err) {
          console.error("Error enriching job skills:", err);
        }
      };

      // Enrich job skills with names
      const jobsWithSkillNames = await Promise.all(
        jobs.map(async (job: any) => {
          const enrichedJob = { ...job };
          await enrichJobSkillsWithNames(enrichedJob);
          return enrichedJob;
        })
      );
      setJobs(jobsWithSkillNames);
      } else {
        console.warn("Failed to fetch jobs:", jobsResponse);
        setJobs([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate job match score for candidates
  const calculateJobMatchScore = (
    candidate: CandidateProfile,
    job: Job
  ): EnhancedCandidate => {
    if (!job.skills || job.skills.length === 0) {
      return {
        ...candidate,
        jobMatchScore: 0,
        matchedSkills: 0,
        totalJobSkills: 0,
        missingSkills: [],
      };
    }

    let totalScore = 0;
    let maxPossibleScore = 0;
    let matchedSkills = 0;
    const missingSkills: string[] = [];

    job.skills.forEach((jobSkill) => {
      const candidateSkill = candidate.skills?.find(
        (cs) =>
          cs.skillId === jobSkill.skillId || cs.skillName === jobSkill.skillName
      );

      if (candidateSkill && candidateSkill.score !== undefined) {
        const skillScore = jobSkill.requiredLevel * candidateSkill.score;
        totalScore += skillScore;
        matchedSkills++;
      } else {
        missingSkills.push(jobSkill.skillName || jobSkill.skillId);
      }

      maxPossibleScore += jobSkill.requiredLevel * 10; // Max candidate score is 10
    });

    const matchScore =
      maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

    return {
      ...candidate,
      jobMatchScore: Math.round(matchScore * 10) / 10,
      matchedSkills,
      totalJobSkills: job.skills.length,
      missingSkills,
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update sort option when job selection changes
  useEffect(() => {
    if (selectedJob !== "all" && sortOption.includes("score")) {
      // Keep score-based sorting when job is selected
      setSortOption("score_desc");
    }
  }, [selectedJob]);

  // Calculate average score from skills
  const calculateAverageScore = (
    skills: CandidateProfile["skills"]
  ): number | undefined => {
    if (!skills || skills.length === 0) return undefined;
    const validScores = skills.filter(
      (s) => s.score !== undefined && !isNaN(s.score)
    );
    if (validScores.length === 0) return undefined;
    const total = validScores.reduce((sum, s) => sum + (s.score || 0), 0);
    return total / validScores.length;
  };

  // Enhanced filtering and sorting with job matching
  const filteredCandidates = React.useMemo(() => {
    let processedCandidates = [...candidates];

    // If a specific job is selected, calculate match scores
    if (selectedJob !== "all") {
      const selectedJobData = jobs.find((job) => job._id === selectedJob);
      if (selectedJobData) {
        processedCandidates = candidates.map((candidate) =>
          calculateJobMatchScore(candidate, selectedJobData)
        );
      }
    }

    // Apply filters
    const filtered = processedCandidates.filter((c) => {
      const matchesSearch =
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.roleApplied?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.status?.toLowerCase().includes(searchTerm.toLowerCase());

      // Job role filter - now just for display filtering, not matching
      let matchesJob = selectedJob === "all";
      if (!matchesJob && c.roleApplied) {
        matchesJob = c.roleApplied === selectedJob;

        if (!matchesJob) {
          const selectedJobData = jobs.find((job) => job._id === selectedJob);
          if (selectedJobData) {
            matchesJob = c.roleApplied === selectedJobData.jobName;
          }
        }
      }

      const matchesStatus =
        selectedStatus === "all" || c.status === selectedStatus;

      return matchesSearch && matchesStatus; // Remove job filter for matching
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortOption === "alpha_asc") return a.name.localeCompare(b.name);
      if (sortOption === "alpha_desc") return b.name.localeCompare(a.name);

      if (sortOption === "score_asc") {
        const scoreA =
          selectedJob !== "all"
            ? a.jobMatchScore || 0
            : calculateAverageScore(a.skills) || 0;
        const scoreB =
          selectedJob !== "all"
            ? b.jobMatchScore || 0
            : calculateAverageScore(b.skills) || 0;
        return scoreA - scoreB;
      }

      if (sortOption === "score_desc") {
        const scoreA =
          selectedJob !== "all"
            ? a.jobMatchScore || 0
            : calculateAverageScore(a.skills) || 0;
        const scoreB =
          selectedJob !== "all"
            ? b.jobMatchScore || 0
            : calculateAverageScore(b.skills) || 0;
        return scoreB - scoreA;
      }

      if (sortOption === "date_asc")
        return (
          new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
        );
      if (sortOption === "date_desc")
        return (
          new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        );

      return 0;
    });
  }, [candidates, jobs, selectedJob, selectedStatus, searchTerm, sortOption]);

  // Get top candidate for selected job
  const topCandidateForJob = React.useMemo(() => {
    if (selectedJob === "all" || filteredCandidates.length === 0) return null;

    // Find candidate with highest job match score
    return filteredCandidates.reduce((best, current) => {
      const bestScore = best.jobMatchScore || 0;
      const currentScore = current.jobMatchScore || 0;
      return currentScore > bestScore ? current : best;
    });
  }, [selectedJob, filteredCandidates]);

  // Calculate summary statistics
  const totalCandidates = candidates.length;

  // Helper function to get job name from job ID
  const getJobNameById = (jobId: string | null): string => {
    if (!jobId) return "No Role Applied";
    const job = jobs.find((job) => job._id === jobId);
    return job ? job.jobName : jobId; // Fallback to ID if job not found
  };

  // Most common job role (convert IDs to names, exclude candidates with no role)
  const candidatesWithRoles = candidates.filter(
    (candidate) => candidate.roleApplied
  );
  const roleCount = candidatesWithRoles.reduce((acc, candidate) => {
    const roleName = getJobNameById(candidate.roleApplied);
    acc[roleName] = (acc[roleName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonRole =
    Object.keys(roleCount).length > 0
      ? Object.entries(roleCount).reduce((a, b) =>
          roleCount[a[0]] > roleCount[b[0]] ? a : b
        )[0]
      : "No Roles Available";

  // Newest candidate
  const newestCandidate = candidates.reduce((newest, candidate) => {
    return new Date(candidate.dateCreated) > new Date(newest.dateCreated)
      ? candidate
      : newest;
  }, candidates[0]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle candidate deletion
  const handleDeleteCandidate = async (
    candidateId: string,
    candidateName: string
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${candidateName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await candidatesApi.deleteCandidate(candidateId);
      // Remove the candidate from the list
      setCandidates((prev) =>
        prev.filter((c) => c.candidateId !== candidateId)
      );
      alert("Candidate deleted successfully");
    } catch (err) {
      console.error("Error deleting candidate:", err);
      alert("Failed to delete candidate. Please try again.");
    }
  };

  // Format score for display
  const formatScore = (score: number | undefined): string => {
    if (score === undefined || score === null) return "N/A";
    return `${score.toFixed(1)}`;
  };

  // Get score color based on value
  const getScoreColor = (score: number | undefined): string => {
    if (score === undefined || score === null) return "#6b7280";
    if (score >= 80) return "#10b981"; // Green for high scores
    if (score >= 60) return "#f59e0b"; // Yellow for medium scores
    return "#ef4444"; // Red for low scores
  };

  const getMatchCategory = (score: number | undefined) => {
    if (score === undefined) return { label: "N/A", color: "#6b7280" };
    if (score >= 90) return { label: "Perfect Match", color: "#10b981" };
    if (score >= 70) return { label: "Good Match", color: "#f59e0b" };
    if (score >= 50) return { label: "Partial Match", color: "#f97316" };
    return { label: "Poor Match", color: "#ef4444" };
  };

  // Handle candidate click to navigate to profile
  const handleCandidateClick = (candidateId: string) => {
    navigate(`/profile/${candidateId}`);
  };

  // Handle compare candidates
  const handleCompareClick = () => {
    navigate("/compare-candidates");
  };

  const selectedJobName =
    selectedJob !== "all" ? getJobNameById(selectedJob) : "All Roles";
  const [activeFilter, setActiveFilter] = useState("job");

  return (
    <main className="candidate-list">
      <div
        className="candidate-list-header"
        data-text="Manage and review job applicants with AI assistance"
      >
        <h2>Candidate Management</h2>
        <div className="header-actions">
          <div className="search-candidate">
            <input
              type="text"
              placeholder="Search candidates, skills, or positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <img src="/images/search.png" alt="Search" />
          </div>
          <button
            className="compare-candidates-btn"
            onClick={handleCompareClick}
            title="Compare Candidates"
          >
            <img src="/images/compare.png" alt="Compare" />
            Compare
          </button>
          {/* <img src="/images/filter.png" alt="Filter" /> */}
        </div>
      </div>

      <div className="summary-cards">
        <div className="card">
          <h4>Total Candidates</h4>
          <div className="number">{totalCandidates}</div>
          <div className="detail">{filteredCandidates.length} Shown</div>
          <a className="view-more" href="/dashboard">
            View more →
          </a>
        </div>
        <div className="card">
          <h4>{selectedJob !== "all" ? "Top Match" : "Most Common Role"}</h4>
          <div className="number">
            {selectedJob !== "all" && topCandidateForJob
              ? topCandidateForJob.name.length > 15
                ? `${topCandidateForJob.name.substring(0, 15)}...`
                : topCandidateForJob.name
              : mostCommonRole.length > 15
              ? `${mostCommonRole.substring(0, 15)}...`
              : mostCommonRole}
          </div>
          <div className="detail">
            {selectedJob !== "all" && topCandidateForJob
              ? `${formatScore(topCandidateForJob.jobMatchScore)}% Match`
              : `${roleCount[mostCommonRole] || 0} Candidates`}
          </div>
          <a className="view-more" href="/dashboard">
            View more →
          </a>
        </div>
        <div className="card">
          <h4>Newest Candidate</h4>
          <div className="number">
            {newestCandidate ? newestCandidate.name : "None"}
          </div>
          <div className="detail">
            {newestCandidate
              ? formatDate(newestCandidate.dateCreated)
              : "No Data"}
          </div>
          <a className="view-more" href="/dashboard">
            View more →
          </a>
        </div>
      </div>

      <div className="job-filter">
        <select
          className={`filter-tab ${activeFilter === "job" ? "active" : ""}`}
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          onClick={() => setActiveFilter("job")}
        >
          <option value="all">All Jobs</option>
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.jobName}
            </option>
          ))}
        </select>

        {/* 🔹 Status filter */}
        <select
          className={`filter-tab ${activeFilter === "status" ? "active" : ""}`}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          onClick={() => setActiveFilter("status")}
        >
          <option value="all">All Statuses</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Pending">Pending</option>
        </select>

        <select
          className={`filter-tab ${activeFilter === "order" ? "active" : ""}`}
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          onClick={() => setActiveFilter("order")}
        >
          <option value="score_desc">
            {selectedJob !== "all"
              ? "Best Job Match First"
              : "Highest Avg Score"}
          </option>
          <option value="score_asc">
            {selectedJob !== "all"
              ? "Worst Job Match First"
              : "Lowest Avg Score"}
          </option>
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="alpha_asc">A → Z</option>
          <option value="alpha_desc">Z → A</option>
        </select>
      </div>

      {selectedJob !== "all" && topCandidateForJob && (
        <div
          className="card highlight-card"
          style={{ margin: "0 2rem 0rem 2rem" }}
        >
          <h4>Best Match for {getJobNameById(selectedJob)}</h4>
          <div className="number">{topCandidateForJob.name}</div>
          <div className="detail">
            Match Score: {formatScore(topCandidateForJob.jobMatchScore)}% (
            {topCandidateForJob.matchedSkills}/
            {topCandidateForJob.totalJobSkills} skills)
          </div>
          <button
            className="open-profile"
            onClick={() => handleCandidateClick(topCandidateForJob.candidateId)}
          >
            View Profile
          </button>
        </div>
      )}

      <div className="table-wrapper" style={{maxHeight: "50%"}}>
        <table>
          <thead>
            <tr>
              <th>{/* <img src="/images/sort.png" alt="Sort" /> */}</th>
              <th>Name</th>
              <th>{selectedJob !== "all" ? "Job Match" : "Average Score"}</th>
              <th>Skills {selectedJob !== "all" ? "Match" : "(Amount)"}</th>
              <th>Status</th>
              <th>Date Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Loading candidates...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#ef4444",
                  }}
                >
                  {error}
                </td>
              </tr>
            ) : filteredCandidates.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#6b7280",
                  }}
                >
                  No candidates found
                </td>
              </tr>
            ) : (
              filteredCandidates.map((c, idx) => {
                // Cast candidate to enhanced type to access job match properties
                const enhancedCandidate = c as EnhancedCandidate;

                // Calculate the appropriate score based on context
                const score =
                  selectedJob !== "all"
                    ? enhancedCandidate.jobMatchScore
                    : calculateAverageScore(c.skills);

                // Get match category only for job-specific scoring
                const category =
                  selectedJob !== "all" &&
                  enhancedCandidate.jobMatchScore !== undefined
                    ? getMatchCategory(enhancedCandidate.jobMatchScore)
                    : null;

                // Determine tooltip position based on row index
                const totalRows = filteredCandidates.length;
                const isTopHalf = idx < totalRows / 2;

                return (
                  <tr
                    key={c.candidateId}
                    onClick={() => handleCandidateClick(c.candidateId)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{idx + 1}</td>
                    <td>
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        {c.name}
                      </a>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            color: category
                              ? category.color
                              : getScoreColor(score),
                            fontWeight: "bold",
                          }}
                        >
                          {formatScore(score)}
                          {selectedJob !== "all" ? "%" : ""}
                        </span>
                        {category && (
                          <span
                            style={{ fontSize: "11px", color: category.color }}
                          >
                            {category.label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {selectedJob !== "all" &&
                      enhancedCandidate.jobMatchScore !== undefined ? (
                        <div className="skills-cell">
                          <span className="skills-match">
                            {enhancedCandidate.matchedSkills || 0}/
                            {enhancedCandidate.totalJobSkills || 0}
                            {enhancedCandidate.missingSkills &&
                              enhancedCandidate.missingSkills.length > 0 && (
                                <>
                                  <span className="missing-skills-indicator">
                                    !
                                  </span>
                                  <div 
                                    className={`missing-skills-tooltip ${
                                      isTopHalf ? 'tooltip-below' : ''
                                    }`}
                                  >
                                    <div className="tooltip-title">
                                      Missing Skills ({enhancedCandidate.missingSkills.length})
                                    </div>
                                    <ul className="missing-skills-list">
                                      {enhancedCandidate.missingSkills.slice(0, 3).map((skill, idx) => (
                                        <li key={idx}>{skill}</li>
                                      ))}
                                      <li>...</li>
                                    </ul>
                                  </div>
                                </>
                              )}
                          </span>
                        </div>
                      ) : c.skills ? (
                        c.skills.length
                      ) : (
                        0
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          color:
                            c.status === "Approved"
                              ? "#10b981"
                              : c.status === "Rejected"
                              ? "#ef4444"
                              : "#f59e0b",
                          fontWeight: "bold",
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>{formatDate(c.dateCreated)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCandidateClick(c.candidateId);
                          }}
                        >
                          Open Profile
                        </button>
                        <button
                          className="delete-candidate"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCandidate(
                              c.candidateId,
                              c.name || "this candidate"
                            );
                          }}
                          title="Delete candidate"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default CandidateList;
