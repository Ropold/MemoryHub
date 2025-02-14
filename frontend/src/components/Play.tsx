import { MemoryModel } from "./model/MemoryModel.ts";

type PlayProps = {
    activeMemories: MemoryModel[];
}

export default function Play(props: Readonly<PlayProps>) {
    return (
        <div>
            <h2>MemoryHub - Play</h2>
            <ul>
                {props.activeMemories.map((memory) => (
                    <li key={memory.id}>
                        <h3>{memory.name}</h3>
                    </li>
                ))}
            </ul>
        </div>
);
}
