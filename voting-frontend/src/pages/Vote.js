import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import './Vote.css';

const Vote = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { user, refreshUser } = useAuth(); // ✅ added refreshUser

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const { data } = await API.get('/candidate');
                setCandidates(data);
            } catch (err) {
                setError('Failed to load candidates');
            } finally {
                setLoading(false);
            }
        };
        fetchCandidates();
    }, []);

    const handleVote = async (candidateId, candidateName) => {
        if (!window.confirm(`Are you sure you want to vote for ${candidateName}? This cannot be undone.`))
            return;

        setVoting(candidateId);
        setError('');
        setMessage('');
        try {
            const { data } = await API.post(`/candidate/vote/${candidateId}`);
            setMessage(data.message);
            await refreshUser(); // ✅ updates isVoted in context and localStorage
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to cast vote');
        } finally {
            setVoting(null);
        }
    };

    if (loading) return <div className="page-loading">Loading candidates...</div>;

    return (
        <div className="vote-container">
            <div className="vote-header">
                <h2>Cast Your Vote</h2>
                <p>Hello, {user?.name}. Choose your candidate carefully — you can only vote once.</p>
            </div>

            {message && <div className="vote-success">{message}</div>}
            {error && <div className="vote-error">{error}</div>}

            {user?.isVoted && (
                <div className="vote-already">
                    You have already cast your vote. Thank you for participating!
                </div>
            )}

            <div className="candidates-grid">
                {candidates.map((candidate, index) => (
                    <div className="candidate-card" key={index}>
                        <div className="candidate-avatar">
                            {candidate.name.charAt(0)}
                        </div>
                        <div className="candidate-info">
                            <h3>{candidate.name}</h3>
                            <span className="candidate-party">{candidate.party}</span>
                        </div>
                        <button
                            className="btn-vote"
                            onClick={() => handleVote(candidate._id, candidate.name)}
                            disabled={voting === candidate._id || user?.isVoted || message}
                        >
                            {voting === candidate._id ? 'Voting...' : 'Vote'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Vote;