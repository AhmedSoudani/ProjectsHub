import {Link} from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Register(){
    const navigate = useNavigate();

    async function RegisterSubmission(){
        const username = document.getElementsByClassName("username").value;
        const password = document.getElementsByClassName("password").value;
        const confirmation = document.getElementsByClassName("re-password").value;

        if(password != confirmation){
            document.getElementsByClassName("error").innerHTML = "the confirmation and the password must be identical";
            return;
        }

        const response = await fetch("http://127.0.0.1/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
            })
        })

        const data = await response.json();
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refersh);
        navigate("/");

    }

    return(
        <>
            <h1>Register</h1>

            <form method="post" onSubmit={RegisterSubmission()}>
                <label>Username: <input type="text" className="username" placeholder="username" required/></label>
                <label>password: <input type="password" className="password" placeholder="password" required/></label>
                <span className="error"></span>
                <label>confirm password: <input type="password" className="re-password" placeholder="confirm password" required/></label>

                <button type="submit">Register</button>

                <p>already have an account? <Link to="/login" >Click here</Link></p>
            </form>
        
        </>
    )
}
export default Register;