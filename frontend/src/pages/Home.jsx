import ProjectCard from "./components/ProjectCard";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";


function Home(){
    const { user, loading } = useAuth();

    if (loading) {
        return <p className="status-text">Loading page....</p>
    }
    if (!user) {
        return (
            <section className="hero">
                <h1>Organize your projects and the tasks inside them.</h1>
                <p className="muted">
                    Create projects, add tasks, assign them to teammates and track progress.
                </p>
                <div className="hero-actions">
                    <Link to="/register" className="btn btn-primary">Get started</Link>
                    <Link to="/login" className="btn btn-ghost">I have an account</Link>
                </div>
            </section>
        )
    }
    return <ProjectList user={user} />
}

function ProjectList({ user }) {
    const [projects, setProjects] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        api("/")
            .then(setProjects)
            .catch((err) => setError(err.message));
    }, [])

    if (error) {
        return <p className="alert">{error}</p>
    }
    if(!projects) {
        return <p className="status-text">Loading projects....</p>
    }
    return (
        <>
        <div className="page-head">
            <div>
                <h1>{user.role === "admin" ? "All projects" : "Your projects"}</h1>
                <p className="muted">Projects you own or have tasks assigned in.</p>
            </div>
            <Link to="/create" className="btn btn-primary">+ New project</Link>
        </div>

        {projects.length === 0 ? (
            <div className="empty">
                <p>No projects yet.</p>
                <Link to="/create" className="btn btn-primary">Create your first project</Link>
            </div>
        ) : (
            <div className="grid">
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} isOwner={project.owner === user.id} />
                ))}
            </div>
        )}
        </>
    )

}

export default Home;
