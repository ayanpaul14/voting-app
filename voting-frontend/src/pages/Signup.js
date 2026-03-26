import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import './Auth.css';

const Signup = () => {
    const [form, setForm] = useState({
        name: '', age: '', address: '', email: '',
        mobile: '', aadharCardNumber: '', password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await API.post('/user/signup', {
                ...form,
                age: Number(form.age)
            });
            login(data.token, data.user);
            navigate('/vote');
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card wide">
                <h2>Create account</h2>
                <p className="auth-subtitle">Register as a voter</p>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" placeholder="Your full name"
                                value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Age</label>
                            <input type="number" name="age" placeholder="Your age"
                                value={form.age} onChange={handleChange} min={18} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" placeholder="your@email.com"
                                value={form.email} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Mobile</label>
                            <input type="text" name="mobile" placeholder="10-digit mobile"
                                value={form.mobile} onChange={handleChange} maxLength={10} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <input type="text" name="address" placeholder="Your address"
                            value={form.address} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Aadhar Card Number</label>
                        <input type="text" name="aadharCardNumber" placeholder="12-digit Aadhar number"
                            value={form.aadharCardNumber} onChange={handleChange} maxLength={12} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" placeholder="Min 8 characters"
                            value={form.password} onChange={handleChange} minLength={8} required />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>
                <p className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;