import { MemoryModel } from "./model/MemoryModel.ts";
import {useEffect, useState} from "react";
import PlayMemoryCard from "./PlayMemoryCard.tsx";

type PlayProps = {
    activeMemories: MemoryModel[];
};

export default function Play(props: Readonly<PlayProps>) {
    const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
    const [selectedMemoriesMatchId, setSelectedMemoriesMatchId] = useState<MemoryModel[]>([]);

    useEffect(() => {
        if (selectedMatchId) {
            setSelectedMemoriesMatchId(props.activeMemories.filter(memory => memory.matchId === selectedMatchId));
        } else {
            setSelectedMemoriesMatchId(props.activeMemories);
        }
    }, [selectedMatchId, props.activeMemories]);

    return (
        <div>
            <div className="matchId-select">
            <label htmlFor="matchIdFilter">Wählen Sie eine Match-ID:</label>
            <select
                id="matchIdFilter"
                value={selectedMatchId ?? ""}
                onChange={(e) => setSelectedMatchId(Number(e.target.value))}
            >
                <option value="">Alle anzeigen</option>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((id) => (
                    <option key={id} value={id}>
                        {id}
                    </option>
                ))}
            </select>
            </div>

            <div className="button-group">
            <button>Play</button>
            <button>Reset</button>
            </div>

            <PlayMemoryCard selectedMatchId={selectedMatchId} selectedMemoriesMatchId={selectedMemoriesMatchId}/>

        </div>
    );
}
