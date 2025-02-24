import axios from "axios";
import {useNavigate} from "react-router-dom";
import "./styles/Navbar.css";

type NavbarProps = {
    user: string
    getUser: () => void
    getActiveMemories: () => void
    getAllMemories: () => void
    toggleSearchBar: () => void
    showSearch: boolean
    resetCurrentPage: () => void
    resetEditingState: () => void
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
            <div
                className="clickable-header"
                onClick={() => {
                    props.getActiveMemories();
                    props.getAllMemories();
                    props.resetCurrentPage();
                    navigate("/");
                }}
            >
                <h2 className="header-title">MemoryHub</h2>
                <img src="/src/assets/MemoryHub-logo-single.jpg" alt="MemoryHub Logo" className="logo-image" />
            </div>

            <button id="play-button-navbar" onClick={() => navigate("/play")}>Play</button>

            <button
                onClick={() => {
                    props.toggleSearchBar();
                    navigate("/");
                }}
                className={props.showSearch ? "toggle-search-on" : "button-group-button"}
            >
                {props.showSearch ? "Hide Search" : "Search"} {/* Dynamischer Text */}
            </button>

            {props.user !== "anonymousUser" ? (
                <>
                    <button className="button-group-button" onClick={() => navigate(`/favorites`)}>Favorites</button>
                    <button className="button-group-button" onClick={() => navigate("/add")}>Add Memory</button>
                    <button className="button-group-button" onClick={() => {props.resetEditingState(); navigate("/my-memories")}}>My Memories</button>
                    <button className="button-group-button" onClick={() => navigate("/profile")}>Profile</button>
                    <button className="button-group-button" onClick={logoutFromGithub}>Logout</button>
                </>
            ) : (
                <button className="button-group-button" onClick={loginWithGithub}>Login with GitHub</button>
            )}
        </nav>
    );


}