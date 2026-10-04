import ProjectCard from "./components/ProjectCard";
import { useEffect } from "react";
import { useState } from "react";


function Home(){
    const [projects, setProjects] = useState(null);


    useEffect(() => {

        async function getProjects() {
            const response = await fetch(`http://127.0.0.1:8000/`)
            const data = await response.json();

            setProjects(data);
            
        }   

        getProjects();
    }, [])

    if(!projects) {
        return <p>Loading page....</p>
    }
    return (
        <main>
        <h1>Upcoming Events</h1>
        <div className="events-grid">
            {projects.map((project) => (
                <ProjectCard key={project.id} event={project} />
            ))}
        </div>
        </main>
    )

}

export default Home;