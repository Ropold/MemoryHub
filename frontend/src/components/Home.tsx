import {MemoryModel} from "./model/MemoryModel.ts";
import MemoryCard from "./MemoryCard";


type HomeProps = {
    user: string;
    activeMemories: MemoryModel[];
    toggleFavorite: (memoryId: string) => void;
    favorites: string[];
    showSearch: boolean;
    currentPage: number;
    paginate: (pageNumber: number) => void;
}

export default function Home(props: Readonly<HomeProps>) {
    return (
        <div>
            <div className="memory-card-container">
                {props.activeMemories.map(memory => (
                    <MemoryCard key={memory.id} memory={memory} favorites={props.favorites} user={props.user} toggleFavorite={props.toggleFavorite} />
                ))}
            </div>
        </div>
    );
}