import {useNavigate} from "react-router-dom";
import {MemoryModel} from "./model/MemoryModel.ts";
import "./styles/MemoryCard.css";

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

    return (
        <div className="memory-card" onClick={handleCardClick}>
            <h3>{props.memory.name}</h3>
            <img src={props.memory.imageUrl} alt={props.memory.name} className="memory-card-image" />
        </div>
    );
}