import React, { useState } from 'react';
import './css/CandidateForm.css';

const CandidateForm: React.FC<{ jobTitle: string }> = ({ jobTitle }) => {
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleModalClose = () => {
    // Refresh the page to clear form fields
    window.location.reload();
  };

  return (
    <div className='candidateform-bg'>
      <form className="form-container" onSubmit={handleSubmit}>
        <h2 className="form-title">Candidate Information Form</h2>
        <hr />
        <div className="form-body">
          {/* Full Name */}
          <div className="form-group">
            <label className="field-label">Full Name</label>
            <div className="form-row">
              <input type="text" name="firstName" placeholder="First Name" required />
              <input type="text" name="middleName" placeholder="Middle Name" required />
              <input type="text" name="lastName" placeholder="Last Name" required />
            </div>
          </div>

          {/* Birthdate */}
          <div className="form-group">
            <label className="field-label">Birthdate</label>
            <div className="form-row">
              <input type="date" name="birthdate" required />
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="field-label">Address</label>
            <div className="form-row">
              <input type="text" name="address" required />
            </div>
          </div>

          {/* Role */}
          <div className="form-group">
            <label className="field-label">Applying For</label>
            <div className="form-row">
              <input type="text" name="role" value={jobTitle} readOnly placeholder="Job Title" />
            </div>
          </div>

          {/* Contact */}
          <div className="form-group">
            <label className="field-label">Contact Information</label>
            <div className="form-row">
              <input type="tel" name="phone" placeholder="Phone Number" required />
              <input type="email" name="email" placeholder="Email Address" required />
            </div>
          </div>

          {/* Resume */}
          <div className="form-group">
            <label className="field-label">Resume Upload (PDF only)</label>
            <div className="form-row">
              <input type="file" name="resume" accept="application/pdf" required />
            </div>
          </div>

          {/* Submit */}
          <div className="form-group">
            <div className="form-row">
              <button type="submit" className="submit-button">SUBMIT</button>
            </div>
          </div>
        </div>
      </form>

      {/* ✅ Modal on submission */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Application Submitted</h3>
            <p>Your application was submitted successfully.</p>
            <p>Please look out for further notices sent to your provided contact information.</p>
            <button onClick={handleModalClose} className="modal-button">Understood</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateForm;
