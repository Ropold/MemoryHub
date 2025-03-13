import welcomePic from "../assets/memory-pixa.png"
import "./styles/Welcome.css"
import {useNavigate} from "react-router-dom";
import {UserDetails} from "./model/UserDetailsModel.ts";

type WelcomeProps = {
    userDetails: UserDetails | null;
}

export default function Welcome(props: Readonly<WelcomeProps>) {
    const navigate = useNavigate();

    return (
            <div className="welcome">
                <h2>Welcome {props.userDetails !== null && props.userDetails.login} to MemoryHub!</h2>
                <p>Click on the Picture or the green button to start playing!</p>
                <img
                    src={welcomePic}
                    alt="Welcome to MemoryHub"
                    className="logo-welcome"
                    onClick={() => navigate("/play")}
                />
            </div>
    );
}