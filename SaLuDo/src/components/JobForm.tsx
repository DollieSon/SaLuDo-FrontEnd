
import React, { useState } from 'react';
import { apiUrl } from '../utils/api';
import './css/CandidateForm.css'; // Using the same CSS as CandidateForm

const JobForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const jobData = {
                jobName: title,
                jobDescription: details
            };

            const response = await fetch(`${apiUrl}jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSuccess(true);
                setTitle('');
                setDetails('');
                console.log('Job created successfully:', result.data);
            } else {
                throw new Error(result.message || 'Failed to create job');
            }
        } catch (err) {
            console.error('Error creating job:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while creating the job');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='candidateform-bg'>
            <form className="form-container" onSubmit={handleSubmit}>
                <h2 className="form-title">Post a Job</h2>
                <hr />
                <div className="form-body">
                    {/* Success Message */}
                    {success && (
                        <div className="form-group">
                            <div style={{ 
                                backgroundColor: '#d4edda', 
                                color: '#155724', 
                                padding: '12px', 
                                borderRadius: '4px',
                                textAlign: 'center',
                                border: '1px solid #c3e6cb'
                            }}>
                                Job created successfully! The AI will automatically parse and extract required skills.
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="form-group">
                            <div style={{ 
                                backgroundColor: '#f8d7da', 
                                color: '#721c24', 
                                padding: '12px', 
                                borderRadius: '4px',
                                textAlign: 'center',
                                border: '1px solid #f5c6cb'
                            }}>
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Job Title */}
                    <div className="form-group">
                        <label className="field-label">Job Title</label>
                        <div className="form-row">
                            <input
                                type="text"
                                name="title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                disabled={isSubmitting}
                                required
                                placeholder="Enter job title"
                            />
                        </div>
                    </div>

                    {/* Job Description */}
                    <div className="form-group">
                        <label className="field-label">Job Description</label>
                        <div className="form-row">
                            <textarea
                                name="details"
                                value={details}
                                onChange={e => setDetails(e.target.value)}
                                disabled={isSubmitting}
                                required
                                rows={8}
                                placeholder="Enter detailed job description including responsibilities, requirements, and qualifications..."
                                style={{ 
                                    width: '100%',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    fontSize: 'inherit',
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    opacity: isSubmitting ? 0.6 : 1
                                }}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="form-group">
                        <div className="form-row">
                            <button 
                                type="submit" 
                                className="submit-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'CREATING JOB...' : 'CREATE JOB'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default JobForm;