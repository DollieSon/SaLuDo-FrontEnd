import "./css/CandidateList.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { candidatesApi, jobsApi, skillsApi, usersApi } from "../utils/api";
import { predictiveScoreApi } from "../utils/scoringApi";
import { useAuth } from "../context/AuthContext";
import { CandidateProfile } from "../types/profile";
import { CandidateStatus as CandidateStatusEnum } from "../../ForFrontEnd/types/CandidateApiTypes";

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

interface AssignmentUser {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface EnhancedCandidate extends CandidateProfile {
  jobMatchScore?: number;
  matchedSkills?: number;
  totalJobSkills?: number;
  missingSkills?: string[];
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "Applied":
      return "#2563eb"; // blue
    case "Reference Check":
      return "#7c3aed"; // purple
    case "Offer":
      return "#0ea5e9"; // sky
    case "Hired":
      return "#10b981"; // green
    case "Rejected":
      return "#ef4444"; // red
    case "Withdrawn":
      return "#6b7280"; // gray
    default:
      return "#f59e0b"; // amber fallback
  }
};

const CandidateList: React.FC = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [assignmentUsers, setAssignmentUsers] = useState<AssignmentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [appliedDateStart, setAppliedDateStart] = useState<string>("");
  const [appliedDateEnd, setAppliedDateEnd] = useState<string>("");
  const [predictiveScoreFilter, setPredictiveScoreFilter] = useState<string>("all");
  const [timeInStageFilter, setTimeInStageFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("score_desc");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [openMultiSelect, setOpenMultiSelect] = useState<"status" | "role" | "assignment" | null>(null);
  const [jobSearchTerm, setJobSearchTerm] = useState<string>("");
  const [roleSearchTerm, setRoleSearchTerm] = useState<string>("");
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState<string>("");
  const [predictiveScoreMap, setPredictiveScoreMap] = useState<Record<string, number>>({});

  // Fetch candidates and jobs from API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = accessToken || localStorage.getItem("accessToken") || undefined;

      const usersRequest = token
        ? usersApi.getAllUsers(token, {
            page: 1,
            limit: 100,
            isActive: true,
          })
        : Promise.resolve(null);

      // Fetch candidates and jobs in parallel
      const [candidatesResult, jobsResult, usersResult] = await Promise.allSettled([
        candidatesApi.getAllCandidates(),
        jobsApi.getAllJobs(),
        usersRequest,
      ]);

      if (candidatesResult.status !== "fulfilled") {
        throw new Error("Failed to fetch candidates");
      }

      const candidatesResponse = candidatesResult.value;

      if (candidatesResponse.success) {
        setCandidates(candidatesResponse.data);
      } else {
        throw new Error("Failed to fetch candidates");
      }

      const jobsResponse =
        jobsResult.status === "fulfilled"
          ? jobsResult.value
          : { success: false, data: [] as Job[] };

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
                  ms.skillId === skill.skillId || ms._id === skill.skillId,
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

      if (jobsResponse.success) {
        // Enrich job skills with names
        const jobsWithSkillNames = await Promise.all(
          jobsResponse.data.map(async (job: any) => {
            const enrichedJob = { ...job };
            await enrichJobSkillsWithNames(enrichedJob);
            return enrichedJob;
          }),
        );
        setJobs(jobsWithSkillNames);
      } else {
        console.warn("Failed to fetch jobs:", jobsResponse);
        setJobs([]);
      }

      if (usersResult.status === "fulfilled" && usersResult.value && usersResult.value.success) {
        const assignableRoles = ["hr_user", "recruiter", "interviewer", "hr_manager", "admin"];
        const users = (usersResult.value.data || []).filter(
          (user: AssignmentUser) => assignableRoles.includes(user.role) && user.isActive,
        );
        setAssignmentUsers(users);
      } else {
        setAssignmentUsers([]);
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
    job: Job,
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
          cs.skillId === jobSkill.skillId ||
          cs.skillName === jobSkill.skillName,
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
  }, [accessToken]);

  // Update sort option when job selection changes
  useEffect(() => {
    if (selectedJob !== "all" && sortOption.includes("score")) {
      // Keep score-based sorting when job is selected
      setSortOption("score_desc");
    }
  }, [selectedJob]);

  const NO_ROLE_FILTER_KEY = "__NO_ROLE__";
  const UNASSIGNED_ASSIGNMENT_KEY = "__UNASSIGNED__";

  const toggleMultiValue = (
    values: string[],
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    if (values.includes(value)) {
      setter(values.filter((item) => item !== value));
      return;
    }
    setter([...values, value]);
  };

  function getJobNameById(jobId: string | null): string {
    if (!jobId) return "No Role Applied";
    const job = jobs.find((candidateJob) => candidateJob._id === jobId);
    return job ? job.jobName : jobId;
  }

  const getLatestPredictiveScore = (candidate: CandidateProfile): number | null => {
    const history = candidate.scoreHistory as
      | Array<{ overallScore?: number; score?: number; calculatedAt?: string }>
      | undefined;

    if (!history || history.length === 0) {
      return null;
    }

    const latestEntry = [...history].sort(
      (a, b) =>
        new Date(b.calculatedAt || 0).getTime() - new Date(a.calculatedAt || 0).getTime(),
    )[0];

    const resolvedScore =
      typeof latestEntry?.overallScore === "number"
        ? latestEntry.overallScore
        : latestEntry?.score;

    if (resolvedScore === undefined || Number.isNaN(Number(resolvedScore))) {
      return null;
    }

    return Number(resolvedScore);
  };

  const getCurrentStageDays = (candidate: CandidateProfile): number => {
    const latestHistory = candidate.statusHistory && candidate.statusHistory.length > 0
      ? [...candidate.statusHistory].sort(
          (a, b) =>
            new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
        )[0]
      : null;

    const stageStart = latestHistory
      ? new Date(latestHistory.changedAt)
      : new Date(candidate.dateUpdated || candidate.dateCreated);

    const diffMs = Date.now() - stageStart.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  };

  const getAssignedUserIds = (candidate: CandidateProfile): string[] => {
    return Array.isArray(candidate.assignedHRUserIds)
      ? candidate.assignedHRUserIds.filter(Boolean)
      : [];
  };

  const getAssignedUserNameById = (userId: string): string => {
    const foundUser = assignmentUsers.find((user) => user.userId === userId);
    if (!foundUser) {
      return "Deleted User";
    }

    const fullName = `${foundUser.firstName} ${foundUser.lastName}`.trim();
    return fullName || userId;
  };

  const getAssignedUserSummary = (candidate: CandidateProfile): {
    text: string;
    title: string;
  } => {
    const assignedUserIds = getAssignedUserIds(candidate);
    if (assignedUserIds.length === 0) {
      return { text: "Unassigned", title: "Unassigned" };
    }

    const names = assignedUserIds.map(getAssignedUserNameById);
    const title = names.join(", ");

    if (names.length <= 2) {
      return { text: title, title };
    }

    return {
      text: `${names.slice(0, 2).join(", ")} +${names.length - 2} more`,
      title,
    };
  };

  const formatTimeInStatus = (candidate: CandidateProfile): string => {
    const stageDays = getCurrentStageDays(candidate);
    if (stageDays === 0) {
      return "Today";
    }

    if (stageDays === 1) {
      return "1 day";
    }

    return `${stageDays} days`;
  };

  const getDisplayScore = (candidate: EnhancedCandidate): number | undefined => {
    if (selectedJob !== "all") {
      return candidate.jobMatchScore;
    }

    const mappedScore = predictiveScoreMap[candidate.candidateId];
    if (typeof mappedScore === "number" && !Number.isNaN(mappedScore)) {
      return mappedScore;
    }

    const latestPredictiveScore = getLatestPredictiveScore(candidate);
    return latestPredictiveScore === null ? undefined : latestPredictiveScore;
  };

  const fetchMissingPredictiveScores = React.useCallback(async () => {
    if (selectedJob !== "all" || candidates.length === 0) {
      return;
    }

    const candidatesNeedingScore = candidates.filter((candidate) => {
      const hasHistoryScore = getLatestPredictiveScore(candidate) !== null;
      const hasMappedScore = typeof predictiveScoreMap[candidate.candidateId] === "number";
      return !hasHistoryScore && !hasMappedScore;
    });

    if (candidatesNeedingScore.length === 0) {
      return;
    }

    const results = await Promise.allSettled(
      candidatesNeedingScore.map(async (candidate) => {
        const response = await predictiveScoreApi.calculateScore(candidate.candidateId);
        return {
          candidateId: candidate.candidateId,
          score: response.score?.overallScore,
        };
      }),
    );

    const nextScores: Record<string, number> = {};
    results.forEach((result) => {
      if (
        result.status === "fulfilled" &&
        typeof result.value.score === "number" &&
        !Number.isNaN(result.value.score)
      ) {
        nextScores[result.value.candidateId] = result.value.score;
      }
    });

    if (Object.keys(nextScores).length > 0) {
      setPredictiveScoreMap((prev) => ({
        ...prev,
        ...nextScores,
      }));
    }
  }, [candidates, predictiveScoreMap, selectedJob]);

  useEffect(() => {
    fetchMissingPredictiveScores();
  }, [fetchMissingPredictiveScores]);

  const availableRoleFilters = React.useMemo(() => {
    const roleMap = new Map<string, string>();

    candidates.forEach((candidate) => {
      const roleValue = candidate.roleApplied;
      if (roleValue && !roleMap.has(roleValue)) {
        roleMap.set(roleValue, getJobNameById(roleValue));
      }
    });

    return Array.from(roleMap.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [candidates, jobs]);

  const filteredJobs = React.useMemo(() => {
    const searchLower = jobSearchTerm.trim().toLowerCase();
    if (!searchLower) {
      return jobs;
    }
    return jobs.filter((job) =>
      job.jobName.toLowerCase().includes(searchLower),
    );
  }, [jobs, jobSearchTerm]);

  const filteredRoleOptions = React.useMemo(() => {
    const searchLower = roleSearchTerm.trim().toLowerCase();
    if (!searchLower) {
      return availableRoleFilters;
    }
    return availableRoleFilters.filter((roleOption) =>
      roleOption.label.toLowerCase().includes(searchLower),
    );
  }, [availableRoleFilters, roleSearchTerm]);

  const filteredAssignmentUsers = React.useMemo(() => {
    const searchLower = assignmentSearchTerm.trim().toLowerCase();
    if (!searchLower) {
      return assignmentUsers;
    }
    return assignmentUsers.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.trim().toLowerCase();
      return fullName.includes(searchLower);
    });
  }, [assignmentUsers, assignmentSearchTerm]);

  // Enhanced filtering and sorting with job matching
  const filteredCandidates = React.useMemo(() => {
    let processedCandidates = [...candidates];

    // If a specific job is selected, calculate match scores
    if (selectedJob !== "all") {
      const selectedJobData = jobs.find((job) => job._id === selectedJob);
      if (selectedJobData) {
        processedCandidates = candidates.map((candidate) =>
          calculateJobMatchScore(candidate, selectedJobData),
        );
      }
    }

    // Apply filters
    const filtered = processedCandidates.filter((c) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        c.name?.toLowerCase().includes(searchLower) ||
        c.roleApplied?.toLowerCase().includes(searchLower) ||
        c.status?.toLowerCase().includes(searchLower);

      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(c.status);

      const roleKey = c.roleApplied || NO_ROLE_FILTER_KEY;
      const matchesRole =
        selectedRoles.length === 0 || selectedRoles.includes(roleKey);

      const createdDate = new Date(c.dateCreated);
      const matchesAppliedStart =
        !appliedDateStart ||
        createdDate >= new Date(`${appliedDateStart}T00:00:00`);
      const matchesAppliedEnd =
        !appliedDateEnd ||
        createdDate <= new Date(`${appliedDateEnd}T23:59:59`);

      const assignedUserIds = getAssignedUserIds(c);
      const matchesAssignment =
        selectedAssignments.length === 0 ||
        selectedAssignments.some((selectedAssignment) => {
          if (selectedAssignment === UNASSIGNED_ASSIGNMENT_KEY) {
            return assignedUserIds.length === 0;
          }
          return assignedUserIds.includes(selectedAssignment);
        });

      const latestPredictiveScore = getLatestPredictiveScore(c);
      let matchesPredictiveScore = true;
      if (predictiveScoreFilter === "uncalculated") {
        matchesPredictiveScore = latestPredictiveScore === null;
      } else if (predictiveScoreFilter === "0-39") {
        matchesPredictiveScore =
          latestPredictiveScore !== null && latestPredictiveScore < 40;
      } else if (predictiveScoreFilter === "40-59") {
        matchesPredictiveScore =
          latestPredictiveScore !== null &&
          latestPredictiveScore >= 40 &&
          latestPredictiveScore < 60;
      } else if (predictiveScoreFilter === "60-79") {
        matchesPredictiveScore =
          latestPredictiveScore !== null &&
          latestPredictiveScore >= 60 &&
          latestPredictiveScore < 80;
      } else if (predictiveScoreFilter === "80-100") {
        matchesPredictiveScore =
          latestPredictiveScore !== null && latestPredictiveScore >= 80;
      }

      const stageDays = getCurrentStageDays(c);
      let matchesTimeInStage = true;
      if (timeInStageFilter === "0-2") {
        matchesTimeInStage = stageDays <= 2;
      } else if (timeInStageFilter === "3-7") {
        matchesTimeInStage = stageDays >= 3 && stageDays <= 7;
      } else if (timeInStageFilter === "8-14") {
        matchesTimeInStage = stageDays >= 8 && stageDays <= 14;
      } else if (timeInStageFilter === "15+") {
        matchesTimeInStage = stageDays >= 15;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole &&
        matchesAppliedStart &&
        matchesAppliedEnd &&
        matchesAssignment &&
        matchesPredictiveScore &&
        matchesTimeInStage
      );
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortOption === "alpha_asc") return a.name.localeCompare(b.name);
      if (sortOption === "alpha_desc") return b.name.localeCompare(a.name);

      if (sortOption === "score_asc") {
        const scoreA = getDisplayScore(a as EnhancedCandidate) || 0;
        const scoreB = getDisplayScore(b as EnhancedCandidate) || 0;
        return scoreA - scoreB;
      }

      if (sortOption === "score_desc") {
        const scoreA = getDisplayScore(a as EnhancedCandidate) || 0;
        const scoreB = getDisplayScore(b as EnhancedCandidate) || 0;
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
  }, [
    candidates,
    jobs,
    selectedJob,
    selectedStatuses,
    selectedRoles,
    selectedAssignments,
    appliedDateStart,
    appliedDateEnd,
    predictiveScoreFilter,
    timeInStageFilter,
    searchTerm,
    sortOption,
  ]);

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

  // Most common job role (convert IDs to names, exclude candidates with no role)
  const candidatesWithRoles = candidates.filter(
    (candidate) => candidate.roleApplied,
  );
  const roleCount = candidatesWithRoles.reduce(
    (acc, candidate) => {
      const roleName = getJobNameById(candidate.roleApplied);
      acc[roleName] = (acc[roleName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const mostCommonRole =
    Object.keys(roleCount).length > 0
      ? Object.entries(roleCount).reduce((a, b) =>
          roleCount[a[0]] > roleCount[b[0]] ? a : b,
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
    candidateName: string,
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${candidateName}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await candidatesApi.deleteCandidate(candidateId);
      // Remove the candidate from the list
      setCandidates((prev) =>
        prev.filter((c) => c.candidateId !== candidateId),
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

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedJob("all");
    setSelectedStatuses([]);
    setSelectedRoles([]);
    setSelectedAssignments([]);
    setAppliedDateStart("");
    setAppliedDateEnd("");
    setPredictiveScoreFilter("all");
    setTimeInStageFilter("all");
    setSortOption("score_desc");
    setOpenMultiSelect(null);
  };

  // Canonical candidate statuses (aligned with backend)
  const STATUS_OPTIONS: string[] = React.useMemo(
    () => Object.values(CandidateStatusEnum),
    []
  );

  const getStatusLabel = () => {
    if (selectedStatuses.length === 0) {
      return "All Statuses";
    }
    return `${selectedStatuses.length} selected`;
  };

  const getRoleLabel = () => {
    if (selectedRoles.length === 0) {
      return "All Roles";
    }
    return `${selectedRoles.length} selected`;
  };

  const getAssignmentLabel = () => {
    if (selectedAssignments.length === 0) {
      return "All Assignments";
    }
    return `${selectedAssignments.length} selected`;
  };

  const activeFilterCount = [
    selectedJob !== "all",
    selectedStatuses.length > 0,
    selectedRoles.length > 0,
    selectedAssignments.length > 0,
    Boolean(appliedDateStart),
    Boolean(appliedDateEnd),
    predictiveScoreFilter !== "all",
    timeInStageFilter !== "all",
    sortOption !== "score_desc",
  ].filter(Boolean).length;

  return (
    <main className="candidate-list">
      <div
        className="candidate-list-header"
        data-text="Manage and review job applicants with AI assistance"
      >
        <h2>Candidate Management</h2>
        <div className="header-actions">
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

      {isFilterModalOpen && (
        <div
          className="filters-modal-overlay"
          onClick={() => {
            setIsFilterModalOpen(false);
            setOpenMultiSelect(null);
          }}
        >
          <div
            className="filters-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="filters-modal-header">
              <h3>Candidate Filters</h3>
              <button
                type="button"
                className="filters-modal-close"
                onClick={() => {
                  setIsFilterModalOpen(false);
                  setOpenMultiSelect(null);
                }}
              >
                Close
              </button>
            </div>

            <div className="job-filter">
              <div className="filter-item">
                <label>Applied Date From</label>
                <input
                  type="date"
                  className="filter-input"
                  value={appliedDateStart}
                  onChange={(e) => setAppliedDateStart(e.target.value)}
                />
              </div>

              <div className="filter-item">
                <label>Applied Date To</label>
                <input
                  type="date"
                  className="filter-input"
                  value={appliedDateEnd}
                  onChange={(e) => setAppliedDateEnd(e.target.value)}
                />
              </div>

              <div className="filter-item">
                <label>Status</label>
                <div className="multi-select-wrapper">
                  <button
                    type="button"
                    className="filter-tab multi-trigger"
                    onClick={() =>
                      setOpenMultiSelect(
                        openMultiSelect === "status" ? null : "status",
                      )
                    }
                  >
                    {getStatusLabel()}
                  </button>
                  {openMultiSelect === "status" && (
                    <div className="multi-dropdown-panel">
                      {STATUS_OPTIONS.map((status) => (
                        <label key={status} className="multi-dropdown-option">
                          <input
                            type="checkbox"
                            checked={selectedStatuses.includes(status)}
                            onChange={() =>
                              toggleMultiValue(
                                selectedStatuses,
                                status,
                                setSelectedStatuses,
                              )
                            }
                          />
                          <span>{status}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="filter-item">
                <label>Predictive Success Score</label>
                <select
                  className="filter-tab"
                  value={predictiveScoreFilter}
                  onChange={(e) => setPredictiveScoreFilter(e.target.value)}
                >
                  <option value="all">All Scores</option>
                  <option value="uncalculated">Uncalculated</option>
                  <option value="80-100">80 - 100</option>
                  <option value="60-79">60 - 79</option>
                  <option value="40-59">40 - 59</option>
                  <option value="0-39">0 - 39</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Time In Current Stage</label>
                <select
                  className="filter-tab"
                  value={timeInStageFilter}
                  onChange={(e) => setTimeInStageFilter(e.target.value)}
                >
                  <option value="all">Any Duration</option>
                  <option value="0-2">0 - 2 days</option>
                  <option value="3-7">3 - 7 days</option>
                  <option value="8-14">8 - 14 days</option>
                  <option value="15+">15+ days</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Sort</label>
                <select
                  className="filter-tab"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
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
                  <option value="alpha_asc">A -&gt; Z</option>
                  <option value="alpha_desc">Z -&gt; A</option>
                </select>
              </div>

              <div className="filter-grid-row">
                <div className="filter-grid-column">
                  <label>Score Context Job</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Search jobs"
                    value={jobSearchTerm}
                    onChange={(e) => setJobSearchTerm(e.target.value)}
                  />
                  <div className="grid-items-list">
                    <label className="grid-item-option">
                      <input
                        type="radio"
                        name="jobSelect"
                        checked={selectedJob === "all"}
                        onChange={(e) => setSelectedJob("all")}
                      />
                      <span>All Jobs</span>
                    </label>
                    {filteredJobs.map((job) => (
                      <label key={job._id} className="grid-item-option">
                        <input
                          type="radio"
                          name="jobSelect"
                          checked={selectedJob === job._id}
                          onChange={(e) => setSelectedJob(job._id)}
                        />
                        <span>{job.jobName}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-grid-column">
                  <label>Role Applied</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Search roles"
                    value={roleSearchTerm}
                    onChange={(e) => setRoleSearchTerm(e.target.value)}
                  />
                  <div className="grid-items-list">
                    <label className="grid-item-option">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(NO_ROLE_FILTER_KEY)}
                        onChange={() =>
                          toggleMultiValue(
                            selectedRoles,
                            NO_ROLE_FILTER_KEY,
                            setSelectedRoles,
                          )
                        }
                      />
                      <span>No Role Applied</span>
                    </label>
                    {filteredRoleOptions.map((roleOption) => (
                      <label key={roleOption.value} className="grid-item-option">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(roleOption.value)}
                          onChange={() =>
                            toggleMultiValue(
                              selectedRoles,
                              roleOption.value,
                              setSelectedRoles,
                            )
                          }
                        />
                        <span>{roleOption.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-grid-column">
                  <label>Assignment</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Search assignees"
                    value={assignmentSearchTerm}
                    onChange={(e) => setAssignmentSearchTerm(e.target.value)}
                  />
                  <div className="grid-items-list">
                    <label className="grid-item-option">
                      <input
                        type="checkbox"
                        checked={selectedAssignments.includes(
                          UNASSIGNED_ASSIGNMENT_KEY,
                        )}
                        onChange={() =>
                          toggleMultiValue(
                            selectedAssignments,
                            UNASSIGNED_ASSIGNMENT_KEY,
                            setSelectedAssignments,
                          )
                        }
                      />
                      <span>Unassigned</span>
                    </label>
                    {filteredAssignmentUsers.map((user) => {
                      const userLabel = `${user.firstName} ${user.lastName}`.trim();
                      return (
                        <label key={user.userId} className="grid-item-option">
                          <input
                            type="checkbox"
                            checked={selectedAssignments.includes(user.userId)}
                            onChange={() =>
                              toggleMultiValue(
                                selectedAssignments,
                                user.userId,
                                setSelectedAssignments,
                              )
                            }
                          />
                          <span>{userLabel}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="filters-modal-actions">
              <button
                type="button"
                className="reset-filters-btn"
                onClick={handleResetFilters}
              >
                Reset All Filters
              </button>
              <button
                type="button"
                className="compare-candidates-btn"
                onClick={() => {
                  setIsFilterModalOpen(false);
                  setOpenMultiSelect(null);
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

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

      <div className="table-toolbar">
        <div className="search-candidate">
          <input
            type="text"
            placeholder="Search candidates"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <img src="/images/search.png" alt="Search" />
        </div>
        <button
          className="filter-popup-btn"
          onClick={() => {
            setIsFilterModalOpen(true);
            setOpenMultiSelect(null);
          }}
          title="Open Filters"
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>
      </div>

      <div className="table-wrapper" style={{ maxHeight: "60%" }}>
        <table>
          <thead>
            <tr>
              <th>{/* <img src="/images/sort.png" alt="Sort" /> */}</th>
              <th>Name</th>
              <th>{selectedJob !== "all" ? "Job Match" : "Predictive Score"}</th>
              <th>Skills {selectedJob !== "all" ? "Match" : "(Amount)"}</th>
              <th>Status</th>
              <th>Time In Status</th>
              <th>Assigned User</th>
              <th>Role</th>
              <th>Date Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={10}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Loading candidates...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={10}
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
                  colSpan={10}
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
                const score = getDisplayScore(enhancedCandidate);

                // Get match category only for job-specific scoring
                const category =
                  selectedJob !== "all" &&
                  enhancedCandidate.jobMatchScore !== undefined
                    ? getMatchCategory(enhancedCandidate.jobMatchScore)
                    : null;

                // Determine tooltip position based on row index
                const totalRows = filteredCandidates.length;
                const isTopHalf = idx < totalRows / 2;
                const assignedUsers = getAssignedUserSummary(c);
                const roleLabel = c.roleApplied
                  ? getJobNameById(c.roleApplied)
                  : "No Role";

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
                      <div className="candidate-score-cell">
                        <span
                          className="candidate-score-value"
                          style={{ color: category ? category.color : getScoreColor(score) }}
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
                                      isTopHalf ? "tooltip-below" : ""
                                    }`}
                                  >
                                    <div className="tooltip-title">
                                      Missing Skills (
                                      {enhancedCandidate.missingSkills.length})
                                    </div>
                                    <ul className="missing-skills-list">
                                      {enhancedCandidate.missingSkills
                                        .slice(0, 3)
                                        .map((skill, idx) => (
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
                        className="candidate-status-pill"
                        style={{ color: getStatusColor(c.status), borderColor: getStatusColor(c.status) }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <span className="candidate-time-in-status">
                        {formatTimeInStatus(c)}
                      </span>
                    </td>
                    <td>
                      <span className="assigned-users-cell" title={assignedUsers.title}>
                        {assignedUsers.text}
                      </span>
                    </td>
                    <td>
                      <span className="candidate-role-cell" title={roleLabel}>
                        {roleLabel}
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
                              c.name || "this candidate",
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
