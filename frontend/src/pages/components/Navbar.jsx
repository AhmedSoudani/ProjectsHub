import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <header className="navbar">
            <nav className="navbar-inner">
                <NavLink to="/" className="brand">
                    <span className="brand-mark">P</span> ProjectsHub
                </NavLink>

                <div className="nav-links">
                    {user ? (
                        <>
                            <NavLink to="/" end>Projects</NavLink>
                            <NavLink to="/create" className="btn btn-primary btn-sm">+ Create Project</NavLink>
                            <span className="user-chip" title={`Role: ${user.role}`}>
                                {user.username}
                                {user.role === "admin" && <span className="badge">admin</span>}
                            </span>
                            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login">Login</NavLink>
                            <NavLink to="/register" className="btn btn-primary btn-sm">Register</NavLink>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}

export default Navbar;
