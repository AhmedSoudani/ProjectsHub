import { useState } from "react";
import {Link} from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Register(){
    const navigate = useNavigate();
    const { register } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function RegisterSubmission(event){
        event.preventDefault();
        setError("");

        if(password !== confirmation){
            setError("The confirmation and the password must be identical.");
            return;
        }

        setSubmitting(true);
        try {
            await register(username, password);
            navigate("/");
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    }

    return(
        <div className="auth-card card">
            <h1>Register</h1>
            <p className="muted">Create an account to start managing projects.</p>

            <form className="form" onSubmit={RegisterSubmission}>
                <label>Username
                    <input type="text" placeholder="username" autoComplete="username" required
                        value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <label>Password
                    <input type="password" placeholder="password" autoComplete="new-password" required
                        value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <label>Confirm password
                    <input type="password" placeholder="confirm password" autoComplete="new-password" required
                        value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
                </label>

                {error && <p className="alert">{error}</p>}

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Creating account…" : "Register"}
                </button>
            </form>

            <p className="muted switch">Already have an account? <Link to="/login" >Click here</Link></p>
        </div>
    )
}
export default Register;
