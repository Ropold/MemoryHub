import { MemoryModel } from "./model/MemoryModel.ts";
import {useState} from "react";

type PlayProps = {
    activeMemories: MemoryModel[];
};

export default function Play(props: Readonly<PlayProps>) {
    const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

    const filteredMemories = selectedMatchId
        ? props.activeMemories.filter((memory) => memory.matchId === selectedMatchId)
        : props.activeMemories;

    return (
        <div>
            <h2>MemoryHub - Play</h2>

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

            <ul>
                {filteredMemories.length > 0 ? (
                    filteredMemories.map((memory) => (
                        <li key={memory.id}>
                            <h3>{memory.name}</h3>
                        </li>
                    ))
                ) : (
                    <li>Keine Erinnerungen gefunden.</li>
                )}
            </ul>
        </div>
    );
}
