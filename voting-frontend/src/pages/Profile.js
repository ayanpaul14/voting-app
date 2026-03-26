import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setMessage('');
        setError('');
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await API.put('/user/profile/password', form);
            setMessage(data.message);
            setForm({ currentPassword: '', newPassword: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-avatar">{user?.name?.charAt(0)}</div>
                <h2>{user?.name}</h2>
                <span className={`profile-role ${user?.role}`}>{user?.role?.toUpperCase()}</span>

                <div className="profile-details">
                    {[
                        { label: 'Address', value: user?.address },
                        { label: 'Age', value: user?.age },
                        { label: 'Email', value: user?.email },
                        { label: 'Mobile', value: user?.mobile },
                    ].map(({ label, value }) => (
                        <div className="detail-row" key={label}>
                            <span className="detail-label">{label}</span>
                            <span className="detail-value">{value || '—'}</span>
                        </div>
                    ))}
                    <div className="detail-row">
                        <span className="detail-label">Voted</span>
                        <span className={`detail-value ${user?.isVoted ? 'voted-yes' : 'voted-no'}`}>
                            {user?.isVoted ? 'Yes — vote cast' : 'Not yet voted'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="password-card">
                <h3>Change Password</h3>
                {message && <div className="success-msg">{message}</div>}
                {error && <div className="error-msg">{error}</div>}
                <form onSubmit={handlePasswordChange}>
                    <div className="form-group">
                        <label>Current Password</label>
                        <input type="password" name="currentPassword"
                            value={form.currentPassword} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <input type="password" name="newPassword"
                            value={form.newPassword} onChange={handleChange}
                            minLength={8} required />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;