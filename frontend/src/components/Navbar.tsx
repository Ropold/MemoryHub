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
            <p>User: {props.user}</p>
            <div
                className="clickable-header"
                onClick={() => {
                    navigate("/");
                }}
            >
                <h2 className="header-title">MemoryHub</h2>
                <img src="/MemoryHub-logo-single.jpg" alt="MemoryHub Logo" className="logo-image" />
            </div>

            <button onClick={() => navigate("/play")}>Play</button>

            {props.user !== "anonymousUser" ? (
                <>
                    <button onClick={() => navigate("/add")}>Add Memory</button>
                    <button onClick={() => navigate("/my-memories")}>My Memories</button>
                    <button onClick={() => navigate("/profile")}>Profile</button>
                    <button onClick={logoutFromGithub}>Logout</button>
                </>
            ) : (
                <button onClick={loginWithGithub}>Login with GitHub</button>
            )}
        </nav>
    );

}