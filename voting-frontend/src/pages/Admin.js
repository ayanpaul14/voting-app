import { useState, useEffect } from 'react';
import API from '../api/axios';
import './Admin.css';

const tabs = ['Candidates', 'Voters', 'Results'];

const Admin = () => {
    const [activeTab, setActiveTab] = useState('Candidates');

    // Candidates state
    const [candidates, setCandidates] = useState([]);
    const [candLoading, setCandLoading] = useState(true);
    const [form, setForm] = useState({ name: '', party: '', age: '' });
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Voters state
    const [voters, setVoters] = useState([]);
    const [votersLoading, setVotersLoading] = useState(true);
    const [blockingId, setBlockingId] = useState(null);

    // Results state
    const [results, setResults] = useState([]);
    const [resultsLoading, setResultsLoading] = useState(true);

    // Shared
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const clearMsg = () => { setMessage(''); setError(''); };

    // ── Fetch functions ──
    const fetchCandidates = async () => {
        setCandLoading(true);
        try {
            const { data } = await API.get('/candidate');
            setCandidates(data);
        } catch { setError('Failed to load candidates'); }
        finally { setCandLoading(false); }
    };

    const fetchVoters = async () => {
        setVotersLoading(true);
        try {
            const { data } = await API.get('/user/voters');
            setVoters(data.voters);
        } catch { setError('Failed to load voters'); }
        finally { setVotersLoading(false); }
    };

    const fetchResults = async () => {
        setResultsLoading(true);
        try {
            const { data } = await API.get('/candidate/vote/count');
            setResults(data);
        } catch { setError('Failed to load results'); }
        finally { setResultsLoading(false); }
    };

    useEffect(() => {
        fetchCandidates();
        fetchVoters();
        fetchResults();
    }, []);

    // ── Candidate handlers ──
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        clearMsg();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true); clearMsg();
        try {
            if (editId) {
                await API.put(`/candidate/${editId}`, form);
                setMessage('Candidate updated!');
            } else {
                await API.post('/candidate', { ...form, age: Number(form.age) });
                setMessage('Candidate added!');
            }
            setForm({ name: '', party: '', age: '' });
            setEditId(null);
            fetchCandidates();
        } catch (err) {
            setError(err.response?.data?.error || 'Operation failed');
        } finally { setSubmitting(false); }
    };

    const handleEdit = (c) => {
        setEditId(c._id);
        setForm({ name: c.name, party: c.party, age: c.age });
        clearMsg();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete ${name}?`)) return;
        try {
            await API.delete(`/candidate/${id}`);
            setMessage('Candidate deleted!');
            fetchCandidates();
        } catch (err) { setError(err.response?.data?.error || 'Delete failed'); }
    };

    const handleCancel = () => {
        setEditId(null);
        setForm({ name: '', party: '', age: '' });
        clearMsg();
    };

    // ── Block/Unblock handler ──
    const handleBlock = async (voter) => {
        setBlockingId(voter._id); clearMsg();
        try {
            const { data } = await API.put(`/user/block/${voter._id}`, {
                isBlocked: !voter.isBlocked
            });
            setMessage(data.message);
            fetchVoters();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update user');
        } finally { setBlockingId(null); }
    };

    // ── Results: find winner ──
    const maxVotes = results.length ? Math.max(...results.map(r => r.voteCount)) : 0;

    return (
        <div className="admin-container">
            <h2 className="admin-title">Admin Panel</h2>

            {/* Tabs */}
            <div className="admin-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => { setActiveTab(tab); clearMsg(); }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {message && <div className="success-msg">{message}</div>}
            {error && <div className="error-msg">{error}</div>}

            {/* ── CANDIDATES TAB ── */}
            {activeTab === 'Candidates' && (
                <>
                    <div className="admin-card">
                        <h3>{editId ? 'Edit Candidate' : 'Add Candidate'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name</label>
                                <input name="name" value={form.name} onChange={handleChange} required placeholder="Full name" />
                            </div>
                            <div className="form-group">
                                <label>Party</label>
                                <input name="party" value={form.party} onChange={handleChange} required placeholder="Party name" />
                            </div>
                            <div className="form-group">
                                <label>Age</label>
                                <input name="age" type="number" value={form.age} onChange={handleChange} required min={25} placeholder="Min. 25" />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : editId ? 'Update' : 'Add Candidate'}
                                </button>
                                {editId && <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>}
                            </div>
                        </form>
                    </div>

                    <div className="admin-card">
                        <h3>All Candidates ({candidates.length})</h3>
                        {candLoading ? <p className="loading-text">Loading...</p> :
                            candidates.length === 0 ? <p className="loading-text">No candidates yet.</p> :
                            <div className="candidates-list">
                                {candidates.map(c => (
                                    <div className="candidate-row" key={c._id}>
                                        <div className="candidate-avatar">{c.name.charAt(0)}</div>
                                        <div className="candidate-info">
                                            <span className="candidate-name">{c.name}</span>
                                            <span className="candidate-party">{c.party}</span>
                                        </div>
                                        <div className="candidate-actions">
                                            <button className="btn-edit" onClick={() => handleEdit(c)}>Edit</button>
                                            <button className="btn-delete" onClick={() => handleDelete(c._id, c.name)}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                </>
            )}

            {/* ── VOTERS TAB ── */}
            {activeTab === 'Voters' && (
                <div className="admin-card">
                    <h3>All Voters ({voters.length})</h3>
                    {votersLoading ? <p className="loading-text">Loading...</p> :
                        voters.length === 0 ? <p className="loading-text">No voters yet.</p> :
                        <div className="voters-list">
                            {voters.map(voter => (
                                <div className="voter-row" key={voter._id}>
                                    <div className="candidate-avatar">{voter.name.charAt(0)}</div>
                                    <div className="voter-info">
                                        <span className="candidate-name">{voter.name}</span>
                                        <div className="voter-badges">
                                            <span className={`badge ${voter.isVoted ? 'badge-voted' : 'badge-not-voted'}`}>
                                                {voter.isVoted ? 'Voted' : 'Not voted'}
                                            </span>
                                            {voter.isBlocked && <span className="badge badge-blocked">Blocked</span>}
                                        </div>
                                    </div>
                                    <button
                                        className={voter.isBlocked ? 'btn-unblock' : 'btn-block'}
                                        onClick={() => handleBlock(voter)}
                                        disabled={blockingId === voter._id}
                                    >
                                        {blockingId === voter._id ? '...' : voter.isBlocked ? 'Unblock' : 'Block'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    }
                </div>
            )}

            {/* ── RESULTS TAB ── */}
            {activeTab === 'Results' && (
                <div className="admin-card">
                    <h3>Vote Counts</h3>
                    {resultsLoading ? <p className="loading-text">Loading...</p> :
                        results.length === 0 ? <p className="loading-text">No votes yet.</p> :
                        <div className="results-list">
                            {results.map((r, i) => {
                                const isWinner = r.voteCount === maxVotes && maxVotes > 0;
                                const pct = results.reduce((a, b) => a + b.voteCount, 0) === 0
                                    ? 0
                                    : Math.round((r.voteCount / results.reduce((a, b) => a + b.voteCount, 0)) * 100);
                                return (
                                    <div className={`result-row ${isWinner ? 'winner' : ''}`} key={i}>
                                        <div className="result-top">
                                            <div className="result-left">
                                                {isWinner && <span className="crown">👑</span>}
                                                <div>
                                                    <span className="candidate-name">{r.name}</span>
                                                    <span className="candidate-party">{r.party}</span>
                                                </div>
                                            </div>
                                            <span className="vote-count">{r.voteCount} votes</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="pct-label">{pct}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    }
                </div>
            )}
        </div>
    );
};

export default Admin;