import {MemoryModel} from "./model/MemoryModel.ts";
import MemoryCard from "./MemoryCard";


type HomeProps = {
    activeMemories: MemoryModel[];
}

export default function Home(props: Readonly<HomeProps>) {
    return (
        <div>
            <div>
                {props.activeMemories.map(memory => (
                    <MemoryCard key={memory.id} memory={memory} />
                ))}
            </div>
        </div>
    );
}