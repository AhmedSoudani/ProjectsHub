import {useNavigate} from "react-router-dom"
import { Link } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    async function loginSubmission(){

        

        const username = document.getElementsByClassName("username").value;
        const password = document.getElementsByClassName("password").value;

        const response = await fetch("http://127.0.0.1:8000/token/", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })

        const data = await response.json();
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refersh);
        navigate("/");
    }


    return (
        <>
            <h1>login page</h1>

            <form method="post" onSubmit={loginSubmission()}>
                <label>Username: <input type="text" className="username" placeholder="username" required/></label>
                <label>password: <input type="text" className="password" placeholder="password" required/></label>

                <button type="submit">Login</button>
            </form>

            <p>don't have an account? <Link to="/register">Register here</Link>
            </p>
        </>
    )
}

export default Login;