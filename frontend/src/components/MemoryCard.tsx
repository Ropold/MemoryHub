import {useNavigate} from "react-router-dom";
import {MemoryModel} from "./model/MemoryModel.ts";

type MemoryCardProps = {
    memory: MemoryModel
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