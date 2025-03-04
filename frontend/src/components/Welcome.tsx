import welcomePic from "../assets/memory-pixa.png"
import "./styles/Welcome.css"
import {useNavigate} from "react-router-dom";


export default function Welcome(){
    const navigate = useNavigate();

    return (
        <div className="welcome">
            <h2>Welcome to the MemoryHub!</h2>
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