import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function loginSubmission(event){
        event.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await login(username, password);
            navigate(location.state?.from || "/");
        } catch (err) {
            setError(err.status === 401 ? "Wrong username or password." : err.message);
            setSubmitting(false);
        }
    }


    return (
        <div className="auth-card card">
            <h1>Login</h1>
            <p className="muted">Welcome back to ProjectsHub.</p>

            <form className="form" onSubmit={loginSubmission}>
                <label>Username
                    <input type="text" placeholder="username" autoComplete="username" required
                        value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <label>Password
                    <input type="password" placeholder="password" autoComplete="current-password" required
                        value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>

                {error && <p className="alert">{error}</p>}

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Logging in…" : "Login"}
                </button>
            </form>

            <p className="muted switch">Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    )
}

export default Login;
