import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import { formatDate } from "../format";

const STATUSES = [
    { value: "todo", label: "To do" },
    { value: "in_progress", label: "In progress" },
    { value: "done", label: "Done" },
];

const EMPTY_TASK = { title: "", description: "", status: "todo", assigned_to: "", due_date: "" };

function ProjectDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [editing, setEditing] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);

    useEffect(() => {
        Promise.all([api(`/project/${id}/`), api(`/project/${id}/tasks/`), api("/users/")])
            .then(([projectData, taskData, userData]) => {
                setProject(projectData);
                setTasks(taskData);
                setUsers(userData);
            })
            .catch((err) => setError(err.status === 404 ? "Project not found or you don't have access to it." : err.message));
    }, [id]);

    if (error) {
        return (
            <div className="empty">
                <p>{error}</p>
                <Link to="/" className="btn btn-ghost">Back to projects</Link>
            </div>
        );
    }
    if (!project) return <p className="status-text">Loading project…</p>;

    const canEdit = user.role === "admin" || project.owner === user.id;

    async function run(action) {
        setActionError("");
        try {
            await action();
        } catch (err) {
            setActionError(err.message);
        }
    }

    const deleteProject = () => run(async () => {
        if (!window.confirm(`Delete "${project.name}" and all of its tasks?`)) return;
        await api(`/project/${id}/`, { method: "DELETE" });
        navigate("/");
    });

    const addTask = (task) => run(async () => {
        const created = await api(`/project/${id}/tasks/`, { method: "POST", body: task });
        setTasks((current) => [...current, created]);
        setShowTaskForm(false);
    });

    const updateTask = (taskId, changes) => run(async () => {
        const updated = await api(`/project/${id}/tasks/${taskId}/`, { method: "PATCH", body: changes });
        setTasks((current) => current.map((t) => (t.id === taskId ? updated : t)));
    });

    const deleteTask = (task) => run(async () => {
        if (!window.confirm(`Delete task "${task.title}"?`)) return;
        await api(`/project/${id}/tasks/${task.id}/`, { method: "DELETE" });
        setTasks((current) => current.filter((t) => t.id !== task.id));
    });

    const doneCount = tasks.filter((t) => t.status === "done").length;
    const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

    return (
        <>
            <Link to="/" className="back-link">← All projects</Link>

            {editing ? (
                <ProjectEditForm
                    project={project}
                    onCancel={() => setEditing(false)}
                    onSave={(changes) => run(async () => {
                        setProject(await api(`/project/${id}/`, { method: "PATCH", body: changes }));
                        setEditing(false);
                    })}
                />
            ) : (
                <section className="project-header card">
                    <div className="page-head">
                        <div>
                            <h1>{project.name}</h1>
                            <div className="card-meta">
                                <span>Owner: {project.owner_username}</span>
                                <span>Created {formatDate(project.created_at)}</span>
                                {project.due_date && <span>Due {formatDate(project.due_date)}</span>}
                            </div>
                        </div>
                        {canEdit && (
                            <div className="form-actions">
                                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={deleteProject}>Delete</button>
                            </div>
                        )}
                    </div>
                    <p className="description">{project.description}</p>
                    <div className="progress" title={`${doneCount} of ${tasks.length} tasks done`}>
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="muted small">{doneCount} of {tasks.length} tasks done ({progress}%)</p>
                </section>
            )}

            {actionError && <p className="alert">{actionError}</p>}

            <div className="page-head">
                <h2>Tasks</h2>
                {canEdit && !showTaskForm && (
                    <button className="btn btn-primary btn-sm" onClick={() => setShowTaskForm(true)}>+ Add task</button>
                )}
            </div>

            {showTaskForm && (
                <TaskForm users={users} onCancel={() => setShowTaskForm(false)} onSave={addTask} />
            )}

            <div className="board">
                {STATUSES.map((column, index) => {
                    // Tasks with a status outside the known list are shown in the first column.
                    const columnTasks = tasks.filter((t) =>
                        t.status === column.value ||
                        (index === 0 && !STATUSES.some((s) => s.value === t.status))
                    );
                    return (
                        <section key={column.value} className={`column column-${column.value}`}>
                            <h3>{column.label} <span className="count">{columnTasks.length}</span></h3>
                            {columnTasks.length === 0 && <p className="muted small">No tasks</p>}
                            {columnTasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    canEdit={canEdit}
                                    isMine={task.assigned_to === user.id}
                                    onStatusChange={(status) => updateTask(task.id, { status })}
                                    onDelete={() => deleteTask(task)}
                                />
                            ))}
                        </section>
                    );
                })}
            </div>
        </>
    );
}

function TaskCard({ task, canEdit, isMine, onStatusChange, onDelete }) {
    return (
        <article className={`card task-card${isMine ? " task-mine" : ""}`}>
            <h4>{task.title}</h4>
            <p className="muted small">{task.description}</p>
            <div className="card-meta">
                <span>{task.assigned_to_username ? `@${task.assigned_to_username}` : "Unassigned"}</span>
                {task.due_date && <span>Due {formatDate(task.due_date)}</span>}
            </div>
            {canEdit && (
                <div className="task-actions">
                    <select value={task.status} onChange={(e) => onStatusChange(e.target.value)} aria-label="Status">
                        {!STATUSES.some((s) => s.value === task.status) && (
                            <option value={task.status}>{task.status}</option>
                        )}
                        {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <button className="btn btn-ghost btn-sm btn-danger-text" onClick={onDelete}>Delete</button>
                </div>
            )}
        </article>
    );
}

function TaskForm({ users, onCancel, onSave }) {
    const [task, setTask] = useState(EMPTY_TASK);
    const set = (field) => (e) => setTask({ ...task, [field]: e.target.value });

    function handleSubmit(event) {
        event.preventDefault();
        onSave({
            ...task,
            assigned_to: task.assigned_to ? Number(task.assigned_to) : null,
            due_date: task.due_date || null,
        });
    }

    return (
        <form className="form card task-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <label>Title
                    <input type="text" maxLength={200} required value={task.title} onChange={set("title")} />
                </label>
                <label>Status
                    <select value={task.status} onChange={set("status")}>
                        {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </label>
            </div>
            <label>Description
                <textarea rows={3} required value={task.description} onChange={set("description")} />
            </label>
            <div className="form-row">
                <label>Assign to
                    <select value={task.assigned_to} onChange={set("assigned_to")}>
                        <option value="">Unassigned</option>
                        {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
                    </select>
                </label>
                <label>Due date
                    <input type="date" value={task.due_date} onChange={set("due_date")} />
                </label>
            </div>
            <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add task</button>
            </div>
        </form>
    );
}

function ProjectEditForm({ project, onCancel, onSave }) {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);
    const [dueDate, setDueDate] = useState(project.due_date || "");

    function handleSubmit(event) {
        event.preventDefault();
        onSave({ name, description, due_date: dueDate || null });
    }

    return (
        <form className="form card project-header" onSubmit={handleSubmit}>
            <label>Name
                <input type="text" maxLength={200} required value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>Description
                <textarea rows={4} required value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <label>Due date
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>
            <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
            </div>
        </form>
    );
}

export default ProjectDetail;
