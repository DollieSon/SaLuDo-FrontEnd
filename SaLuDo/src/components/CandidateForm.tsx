import React from 'react';
import './css/CandidateForm.css';

const CandidateForm: React.FC<{ jobTitle: string }> = ({ jobTitle }) => {
  return (
    <div className='candidateform-bg'>
      <form className="form-container">
        <h2 className="form-title">Candidate Information Form</h2>
        <hr />
        <div className="form-body">
          <div className="form-group">
            <label className="field-label">Full Name</label>
            <div className="form-row">
              <input type="text" name="firstName" placeholder="First Name" required />
              <input type="text" name="middleName" placeholder="Middle Name" required />
              <input type="text" name="lastName" placeholder="Last Name" required />
            </div>
          </div>

          <div className="form-group">
            <label className="field-label">Birthdate</label>
            <div className="form-row">
              <input type="date" name="birthdate" required />
            </div>
          </div>

          <div className="form-group">
            <label className="field-label">Address</label>
            <div className="form-row">
              <input type="text" name="address" required />
            </div>
          </div>

          <div className="form-group">
            <label className="field-label">Applying For</label>
            <div className="form-row">
              <input type="text" name="role" value={jobTitle} readOnly placeholder="Job Title" />
            </div>
          </div>

          <div className="form-group">
            <label className="field-label">Contact Information</label>
            <div className="form-row">
              <input type="tel" name="phone" placeholder="Phone Number" required />
              <input type="email" name="email" placeholder="Email Address" required />
            </div>
          </div>

          <div className="form-group">
            <label className="field-label">Resume Upload (PDF only)</label>
            <div className="form-row">
              <input type="file" name="resume" accept="application/pdf" required />
            </div>
          </div>
          <div className='form-group'>
            <button type="submit" className="submit-button">SUBMIT</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CandidateForm;
