import {MemoryModel} from "./model/MemoryModel.ts";
import "./styles/PlayMemoryCard.css";

type PlayMemoryCardProps = {
    selectedMatchId: number | null;
    selectedMemoriesMatchId: MemoryModel[];
}

export default function PlayMemoryCard(props: Readonly<PlayMemoryCardProps>) {
    return (
       <>
        <h2>MatchId {props.selectedMatchId}</h2>
        <div className="play-card">
            {props.selectedMemoriesMatchId.map((memory) => (
                <div key={memory.id}>
                    <h3>{memory.name}</h3>
                    <img src={memory.imageUrl} alt={memory.name} className="play-card-image" />
                </div>
            ))}
        </div>
       </>
    )
}