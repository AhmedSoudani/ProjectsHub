import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

function Create(){
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const project = await api("/", {
                method: "POST",
                body: { name, description, due_date: dueDate || null },
            });
            navigate(`/project/${project.id}`);
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    }

    return (
        <div className="form-page card">
            <h1>New project</h1>
            <p className="muted">You'll be the owner and can add tasks right after.</p>

            <form className="form" onSubmit={handleSubmit}>
                <label>Name
                    <input type="text" maxLength={200} required
                        value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label>Description
                    <textarea rows={4} required
                        value={description} onChange={(e) => setDescription(e.target.value)} />
                </label>
                <label>Due date <span className="muted">(optional)</span>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </label>

                {error && <p className="alert">{error}</p>}

                <div className="form-actions">
                    <Link to="/" className="btn btn-ghost">Cancel</Link>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? "Creating…" : "Create project"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Create;
