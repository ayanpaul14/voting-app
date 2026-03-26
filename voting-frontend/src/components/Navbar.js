import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { isLoggedIn, user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMenuOpen(false);
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" onClick={closeMenu}>VoteApp</Link>
            </div>

            {/* Hamburger button - only visible on mobile */}
            <button
                className={`hamburger ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                <span /><span /><span />
            </button>

            {/* Nav links */}
            <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
                {isLoggedIn ? (
                    <>
                        <Link to="/vote" onClick={closeMenu}>Vote</Link>
                        <Link to="/results" onClick={closeMenu}>Results</Link>
                        <Link to="/profile" onClick={closeMenu}>Profile</Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin" onClick={closeMenu}>Admin</Link>
                        )}
                        <button onClick={handleLogout} className="btn-logout">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" onClick={closeMenu}>Login</Link>
                        <Link to="/signup" onClick={closeMenu}>Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;