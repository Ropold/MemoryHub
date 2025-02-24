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
                <>
                    <img src={props.memory.imageUrl} alt={props.memory.name} className="play-card-image" />
                </>
            ) : (
                <div className="card-back">?</div>
            )}
        </div>
    );
}
