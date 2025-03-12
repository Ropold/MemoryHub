import axios from "axios";
import {useNavigate} from "react-router-dom";
import "./styles/Navbar.css";
import headerLogo from "../assets/MemoryHub-logo-single.jpg";

type NavbarProps = {
    user: string
    getUser: () => void
    getActiveMemories: () => void
    toggleSearchBar: () => void
    showSearch: boolean
    resetCurrentPage: () => void
    resetEditingState: () => void
    getHighScoresFor10Cards: () => void;
    getHighScoresFor20Cards: () => void;
    getHighScoresFor32Cards: () => void;
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

            <button className="button-group-button" onClick={() => navigate("/")}>Home</button>

            <div className="clickable-header-play" onClick={() => navigate("/play")}>
                <h2 className="header-title">Play</h2>
                <img src={headerLogo} alt="MemoryHub Logo" className="logo-image" />
            </div>

            <div
                className="clickable-header"
                onClick={() => {
                    props.getActiveMemories();
                    props.resetCurrentPage();
                    navigate("/list-of-all-cards");
                }}
            >
                <h2 className="header-title">Memory Collection</h2>
                <img src={headerLogo} alt="MemoryHub Logo" className="logo-image" />
            </div>


            <button
                onClick={() => {
                    props.toggleSearchBar();
                    navigate("/list-of-all-cards");
                }}
                className={props.showSearch ? "toggle-search-on" : "button-group-button"}
            >
                {props.showSearch ? "Hide Search" : "Search"} {/* Dynamischer Text */}
            </button>

            <button
                id="button-high-score"
                onClick={() => {
                    props.getHighScoresFor10Cards();
                    props.getHighScoresFor20Cards();
                    props.getHighScoresFor32Cards();
                    navigate("/high-score");
                }}
            >
                High-Score
            </button>


            {props.user !== "anonymousUser" ? (
                <>
                    <button className="button-group-button" onClick={() => navigate(`/favorites`)}>Favorites</button>
                    <button className="button-group-button" onClick={() => navigate("/add")}>Add Memory</button>
                    <button className="button-group-button" onClick={() => {props.resetEditingState(); navigate("/my-memories")}}>My Memories</button>
                    <button id="button-profile" onClick={() => navigate("/profile")}>Profile</button>
                    <button className="button-group-button" onClick={logoutFromGithub}>Logout</button>
                </>
            ) : (
                <button className="button-group-button" onClick={loginWithGithub}>Login with GitHub</button>
            )}
        </nav>
    );

}