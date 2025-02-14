import axios from "axios";
import {useNavigate} from "react-router-dom";
import "./styles/Navbar.css";

type NavbarProps = {
    user: string
    getUser: () => void
}

export default function Navbar(props: Readonly<NavbarProps>) {
    const navigate = useNavigate();

    function loginWithGithub() {
        const host = window.location.host === "localhost:5173" ? "http://localhost:8080" : window.location.origin;
        window.open(host + "/oauth2/authorization/github", "_self");
    }

    function logoutFromGithub() {
        axios
            .post("/api/users/logout")
            .then(() => {
                props.getUser();
                navigate("/");
            })
            .catch((error) => {
                console.error("Logout failed:", error);
            });
    }


    return (
        <nav className="navbar">
            <div>
                <h2>Navbar</h2>
                <p>User: {props.user}</p>

                <div>
                    <button className="clickable-header" onClick={()=>navigate("/")}>Home</button>
                    <button onClick={()=>navigate("/play")}>Play</button>
                    <button onClick={loginWithGithub}>LoginWithGithub</button>
                    <button onClick={logoutFromGithub}>Logout</button>
                </div>

            </div>
        </nav>
    );
}