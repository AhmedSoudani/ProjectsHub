import { Link } from "react-router-dom";
import { formatDate } from "../../format";

function ProjectCard({ project, isOwner }) {
    return (
        <Link to={`/project/${project.id}`} className="card project-card">
            <div className="card-head">
                <h3>{project.name}</h3>
                {isOwner && <span className="badge">owner</span>}
            </div>
            <p className="muted clamp">{project.description}</p>
            <div className="card-meta">
                <span>by {project.owner_username}</span>
                {project.due_date
                    ? <span>Due {formatDate(project.due_date)}</span>
                    : <span>Created {formatDate(project.created_at)}</span>}
            </div>
        </Link>
    )
}

export default ProjectCard;
