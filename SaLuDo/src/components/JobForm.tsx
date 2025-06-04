
import React, { useState } from 'react';
import { apiUrl } from '../utils/api';

const JobForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        console.log('Job Title:', title);
        console.log('Job Details:', details);
        try {
        console.log('formData', formData)
        console.log(Object.fromEntries(formData.entries()))
        const response = await fetch( apiUrl + 'job', {
            method: 'POST',
            body: formData,
        })
        if (response.ok) {
            alert('Job data submitted successfully!')
        } else {
            alert('Failed to submit Job data.')
        }
        } catch (error) {
        alert('An error occurred while submitting the form.')
        }
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
                            name = "title"
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
                            name='details'
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