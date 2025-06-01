
import React, { useState } from 'react';

const JobForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Job Title:', title);
        console.log('Job Details:', details);
        // Temporary: just print inputted text
    };

    return (
        <div>
            <h2>Post a Job</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12 }}>
                    <label>
                        Job Title:
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            // style={{ width: '100%', padding: 8, marginTop: 4 }}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>
                        Job Details:
                        <textarea
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            required
                            // rows={4}
                            // style={{ width: '100%', padding: 8, marginTop: 4 }}
                        />
                    </label>
                </div>
                <button type="submit">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default JobForm;