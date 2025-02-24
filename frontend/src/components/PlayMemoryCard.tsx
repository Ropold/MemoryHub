import { MemoryModel } from "./model/MemoryModel.ts";
import "./styles/PlayMemoryCard.css";

type PlayMemoryCardProps = {
    memory: MemoryModel;
    onClick: () => void;
    isFlipped: boolean;
    isMatched: boolean;
};

export default function PlayMemoryCard(props: Readonly<PlayMemoryCardProps>) {
    return (
        <div className={`play-card ${props.isFlipped ? "flipped" : ""} ${props.isMatched ? "matched" : ""}`} onClick={props.onClick}>
            {props.isFlipped || props.isMatched ? (
                <img src={props.memory.imageUrl} alt={props.memory.name} className="play-card-image" />
            ) : (
                <img src="/flip-card-cover.png" alt="Card Back" className="card-back-image" />
            )}
        </div>
    );
}
