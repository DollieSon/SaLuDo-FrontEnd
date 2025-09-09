import "./css/CandidateSelector.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { candidatesApi } from "../utils/api";

interface Candidate {
  candidateId: string;
  name: string;
  email: string[];
  status: string;
  roleApplied: string | null;
  dateCreated: string;
  skills?: any[];
}

const CandidateSelector: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate1, setSelectedCandidate1] = useState<string>("");
  const [selectedCandidate2, setSelectedCandidate2] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await candidatesApi.getAllCandidates();
      if (response.success) {
        setCandidates(response.data);
      } else {
        throw new Error("Failed to fetch candidates");
      }
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load candidates"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.some((email) =>
        email.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (candidate.roleApplied &&
        candidate.roleApplied.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCompare = () => {
    if (selectedCandidate1 && selectedCandidate2) {
      navigate(`/compare/${selectedCandidate1}/${selectedCandidate2}`);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSelectedCandidateInfo = (candidateId: string) => {
    return candidates.find((c) => c.candidateId === candidateId);
  };

  if (isLoading) {
    return (
      <main className="candidate-selector">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading candidates...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="candidate-selector">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={handleGoBack} className="back-button">
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="candidate-selector">
      <div className="selector-header">
        <div className="back-navigation">
          <img
            src="/images/back.png"
            alt="Back"
            onClick={handleGoBack}
            className="back-icon"
          />
          <h2>Compare Candidates</h2>
        </div>
        <p className="selector-description">
          Select two candidates to compare their skills, experience, and
          personality traits.
        </p>
      </div>

      {/* Selection Summary */}
      <div className="selection-summary">
        <div className="selected-candidates">
          <div className="selection-slot">
            <h3>Candidate 1</h3>
            {selectedCandidate1 ? (
              <div className="selected-candidate-info">
                <span className="candidate-name">
                  {getSelectedCandidateInfo(selectedCandidate1)?.name}
                </span>
                <button
                  onClick={() => setSelectedCandidate1("")}
                  className="remove-selection"
                >
                  ✕
                </button>
              </div>
            ) : (
              <p className="placeholder">Select first candidate</p>
            )}
          </div>

          <div className="vs-indicator">VS</div>

          <div className="selection-slot">
            <h3>Candidate 2</h3>
            {selectedCandidate2 ? (
              <div className="selected-candidate-info">
                <span className="candidate-name">
                  {getSelectedCandidateInfo(selectedCandidate2)?.name}
                </span>
                <button
                  onClick={() => setSelectedCandidate2("")}
                  className="remove-selection"
                >
                  ✕
                </button>
              </div>
            ) : (
              <p className="placeholder">Select second candidate</p>
            )}
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={
            !selectedCandidate1 ||
            !selectedCandidate2 ||
            selectedCandidate1 === selectedCandidate2
          }
          className="compare-button"
        >
          Compare Candidates
        </button>
      </div>

      {/* Search */}
      <div className="search-section">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search candidates by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <img src="/images/search.png" alt="Search" className="search-icon" />
        </div>
      </div>

      {/* Candidates List */}
      <div className="candidates-list">
        <div className="list-header">
          <h3>Available Candidates ({filteredCandidates.length})</h3>
        </div>

        <div className="candidates-grid">
          {filteredCandidates.length === 0 ? (
            <div className="no-candidates">
              <p>No candidates found matching your search.</p>
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <div
                key={candidate.candidateId}
                className={`candidate-card ${
                  selectedCandidate1 === candidate.candidateId ||
                  selectedCandidate2 === candidate.candidateId
                    ? "selected"
                    : ""
                } ${
                  selectedCandidate1 &&
                  selectedCandidate2 &&
                  selectedCandidate1 !== candidate.candidateId &&
                  selectedCandidate2 !== candidate.candidateId
                    ? "disabled"
                    : ""
                }`}
                onClick={() => {
                  // Prevent selection if both slots are filled and this candidate isn't already selected
                  if (
                    selectedCandidate1 &&
                    selectedCandidate2 &&
                    selectedCandidate1 !== candidate.candidateId &&
                    selectedCandidate2 !== candidate.candidateId
                  ) {
                    return;
                  }

                  // If already selected, deselect
                  if (selectedCandidate1 === candidate.candidateId) {
                    setSelectedCandidate1("");
                  } else if (selectedCandidate2 === candidate.candidateId) {
                    setSelectedCandidate2("");
                  } else {
                    // Select to first available slot
                    if (!selectedCandidate1) {
                      setSelectedCandidate1(candidate.candidateId);
                    } else if (!selectedCandidate2) {
                      setSelectedCandidate2(candidate.candidateId);
                    }
                  }
                }}
              >
                <div className="candidate-header">
                  <h4>{candidate.name}</h4>
                  <span className={`status ${candidate.status.toLowerCase()}`}>
                    {candidate.status}
                  </span>
                </div>
                <div className="candidate-details">
                  <p>
                    <strong>Email:</strong> {candidate.email[0]}
                  </p>
                  <p>
                    <strong>Role Applied:</strong>{" "}
                    {candidate.roleApplied || "Not specified"}
                  </p>
                  <p>
                    <strong>Skills:</strong> {candidate.skills?.length || 0}
                  </p>
                  <p>
                    <strong>Date Created:</strong>{" "}
                    {formatDate(candidate.dateCreated)}
                  </p>
                </div>
                <div className="selection-indicator">
                  {selectedCandidate1 === candidate.candidateId && (
                    <span className="selection-badge">Candidate 1</span>
                  )}
                  {selectedCandidate2 === candidate.candidateId && (
                    <span className="selection-badge">Candidate 2</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default CandidateSelector;
