import {useNavigate} from "react-router-dom";
import {MemoryModel} from "./model/MemoryModel.ts";
import "./styles/MemoryCard.css";
import "./styles/Buttons.css";

type MemoryCardProps = {
    memory: MemoryModel
    favorites: string[];
    user: string;
    toggleFavorite: (memoryId: string) => void;
}

export default function MemoryCard(props: Readonly<MemoryCardProps>) {

    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/memory/${props.memory.id}`);
    }

    const isFavorite = props.favorites.includes(props.memory.id);

    return (
        <div className="memory-card" onClick={handleCardClick}>
            <h3>{props.memory.name}</h3>
            <img src={props.memory.imageUrl} alt={props.memory.name} className="memory-card-image" />

            {props.user !== "anonymousUser" && (
                <button
                    id="button-favorite-memory-card"
                    onClick={(event) => {
                        event.stopPropagation(); // Verhindert die Weitergabe des Klicks an die Karte
                        props.toggleFavorite(props.memory.id);
                    }}
                    className={isFavorite ? "favorite-on" : "favorite-off"}
                >
                    ♥
                </button>
            )}
        </div>
    );
}