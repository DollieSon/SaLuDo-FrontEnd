import React, { useState, useEffect } from "react";
import "./css/CandidateForm.css";
import { apiUrl, candidatesApi } from "../utils/api";

interface Job {
  _id: string;
  jobName: string;
  jobDescription: string;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  birthdate: string;
  // address: string;
  // phone: string;
  email: string;
  resume: File | null;
  introductionVideo?: File | null;
  socialLinks: SocialLink[];
}

const CandidateForm: React.FC<{ jobId: string }> = ({ jobId }) => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    birthdate: "",
    // address: '',
    // phone: '',
    email: "",
    resume: null,
    introductionVideo: null,
    socialLinks: [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if ((name === "resume" || name === "introductionVideo") && files) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file } as any));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "LinkedIn", url: "" }],
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const updateSocialLink = (
    index: number,
    field: "platform" | "url",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create FormData for multipart/form-data
      const submitData = new FormData();

      // Combine names into full name
      const fullName =
        `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim();
      submitData.append("name", fullName);
      submitData.append("email", formData.email);
      submitData.append("birthdate", formData.birthdate);

      // Only include roleApplied if we have a jobId, otherwise leave it empty/null
      if (jobId) {
        submitData.append("roleApplied", jobId);
      } else {
        submitData.append("roleApplied", ""); // or you could omit this entirely
      }

      if (formData.resume) {
        submitData.append("resume", formData.resume);
      }

      // Add social links if any
      if (formData.socialLinks.length > 0) {
        submitData.append("socialLinks", JSON.stringify(formData.socialLinks));
      }

      const response = await fetch(`${apiUrl}candidates`, {
        method: "POST",
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit application");
      }

      const result = await response.json();
      console.log("Application submitted successfully:", result);

      // If an introduction video was provided, upload it to the candidate's video endpoint
      try {
        const candidateId = result?.data?.candidateId;
        if (formData.introductionVideo && candidateId) {
          const introForm = new FormData();
          introForm.append("video", formData.introductionVideo);
          // Use the existing API helper so headers/urls remain consistent
          await candidatesApi.uploadIntroductionVideo(candidateId, introForm);
          console.log(
            "Introduction video uploaded successfully for candidate",
            candidateId
          );
        }
      } catch (videoErr) {
        // Non-fatal: log and show a non-blocking error message
        console.error("Failed to upload introduction video:", videoErr);
        setError(
          "Application submitted but failed to upload introduction video."
        );
      }

      setShowModal(true);
    } catch (err) {
      console.error("Error submitting application:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while submitting your application"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setError(null);
    // Reset form data
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      birthdate: "",
      // address: '',
      // phone: '',
      email: "",
      resume: null,
      introductionVideo: null,
    });
    // Refresh the page to fully reset everything
    window.location.reload();
  };

  // Fetch job details when component mounts
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) {
        // No job ID provided - this is fine, user can access form without specific job
        setIsLoadingJob(false);
        return;
      }

      try {
        setIsLoadingJob(true);
        const response = await fetch(`${apiUrl}jobs/${jobId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch job details");
        }

        const result = await response.json();
        if (result.success && result.data) {
          setJob(result.data);
        } else {
          throw new Error("Job not found");
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load job details"
        );
      } finally {
        setIsLoadingJob(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  return (
    <div className="candidateform-bg">
      {isLoadingJob ? (
        <div className="form-container">
          <h2 className="form-title">Loading...</h2>
          <p style={{ textAlign: "center", padding: "20px" }}>
            Loading job details...
          </p>
        </div>
      ) : jobId && !job ? (
        <div className="form-container">
          <h2 className="form-title">Job Not Found</h2>
          <p style={{ textAlign: "center", padding: "20px", color: "red" }}>
            {error || "The requested job could not be found."}
          </p>
        </div>
      ) : (
        <form className="form-container" onSubmit={handleSubmit}>
          <h2 className="form-title">Candidate Information Form</h2>
          {job ? (
            <p
              style={{
                textAlign: "center",
                marginBottom: "20px",
                color: "#666",
              }}
            >
              Applying for: <strong>{job.jobName}</strong>
            </p>
          ) : (
            <p
              style={{
                textAlign: "center",
                marginBottom: "20px",
                color: "#666",
              }}
            >
              General Application Form
            </p>
          )}
          <hr />
          <div className="form-body">
            {/* Full Name */}
            <div className="form-group">
              <label className="field-label">Full Name</label>
              <div className="form-row">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="middleName"
                  placeholder="Middle Name"
                  value={formData.middleName}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Birthdate */}
            <div className="form-group">
              <label className="field-label">Birthdate</label>
              <div className="form-row">
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Address */}
            {/* <div className="form-group">
            <label className="field-label">Address</label>
            <div className="form-row">
              <input 
                type="text" 
                name="address" 
                value={formData.address}
                onChange={handleInputChange}
                required 
              />
            </div>
          </div> */}

            {/* Contact */}
            <div className="form-group">
              <label className="field-label">Email Address</label>
              <div className="form-row">
                {/* <input 
                type="tel" 
                name="phone" 
                placeholder="Phone Number" 
                value={formData.phone}
                onChange={handleInputChange}
                required 
              /> */}
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="form-group">
              <label className="field-label">Social Links (Optional)</label>
              {formData.socialLinks.map((link, index) => (
                <div key={index} className="form-row" style={{ marginBottom: "10px" }}>
                  <select
                    value={link.platform}
                    onChange={(e) =>
                      updateSocialLink(index, "platform", e.target.value)
                    }
                    style={{ flex: "0 0 150px", marginRight: "10px" }}
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="GitHub">GitHub</option>
                    <option value="Portfolio">Portfolio</option>
                    <option value="Behance">Behance</option>
                    <option value="Dribbble">Dribbble</option>
                    <option value="Twitter">Twitter</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Medium">Medium</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) =>
                      updateSocialLink(index, "url", e.target.value)
                    }
                    style={{ flex: "1" }}
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    style={{
                      marginLeft: "10px",
                      padding: "8px 15px",
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSocialLink}
                style={{
                  marginTop: "10px",
                  padding: "8px 15px",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                + Add Social Link
              </button>
            </div>

            {/* Resume Upload */}
            <div className="form-group">
              <label className="field-label">Resume Upload (PDF only)</label>
              <div className="form-row">
                <input
                  type="file"
                  name="resume"
                  accept="application/pdf"
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Introduction Video */}
            <div className="form-group">
              <label className="field-label">
                Introduction Video (optional)
              </label>
              <div className="form-row">
                <input
                  type="file"
                  name="introductionVideo"
                  accept="video/*"
                  onChange={handleInputChange}
                />
              </div>
              <p
                style={{ color: "#6b7280", fontSize: "12px", marginTop: "6px" }}
              >
                Optional — upload a short introduction video to help recruiters
                get to know you.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="form-group">
                <div
                  className="error-message"
                  style={{ color: "red", textAlign: "center" }}
                >
                  {error}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="form-group">
              <div className="form-row">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
                </button>
              </div>
            </div>
          </div>{" "}
        </form>
      )}

      {/* ✅ Modal on submission */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Application Submitted</h3>
            <p>Your application was submitted successfully.</p>
            <p>
              Please look out for further notices sent to your provided contact
              information.
            </p>
            <button onClick={handleModalClose} className="modal-button">
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateForm;
