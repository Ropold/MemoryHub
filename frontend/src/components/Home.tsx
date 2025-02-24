import { MemoryModel } from "./model/MemoryModel.ts";
import { useEffect, useState } from "react";
import MemoryCard from "./MemoryCard";
import SearchBar from "./SearchBar.tsx";

type HomeProps = {
    user: string;
    activeMemories: MemoryModel[];
    toggleFavorite: (memoryId: string) => void;
    favorites: string[];
    showSearch: boolean;
    currentPage: number;
    paginate: (pageNumber: number) => void;
};

export default function Home(props: Readonly<HomeProps>) {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filteredMemories, setFilteredMemories] = useState<MemoryModel[]>([]);
    const [filterType, setFilterType] = useState<"name" | "category" | "matchId" | "all">("name");
    const [selectedCategory, setSelectedCategory] = useState<MemoryModel["category"] | "">("");
    const memoriesPerPage = 9;

    useEffect(() => {
        if (!props.showSearch) {
            setSearchQuery("");
        }
    }, [props.showSearch]);

    useEffect(() => {
        const filtered = filterMemories(props.activeMemories, searchQuery, filterType, selectedCategory);
        setFilteredMemories(filtered);
    }, [props.activeMemories, searchQuery, filterType, selectedCategory]);

    const filterMemories = (memories: MemoryModel[], query: string, filterType: string, category: string | "") => {
        const lowerQuery = query.toLowerCase();

        return memories.filter((memory) => {
            const matchesCategory = category ? memory.category === category : true;
            const matchesName = filterType === "name" && memory.name.toLowerCase().includes(lowerQuery);
            const matchesMatchId = filterType === "matchId" && memory.matchId.toString().includes(lowerQuery);
            const matchesAll =
                filterType === "all" &&
                (memory.name.toLowerCase().includes(lowerQuery) ||
                    memory.category.toLowerCase().includes(lowerQuery) ||
                    memory.matchId.toString().includes(lowerQuery));

            return matchesCategory && (matchesName || matchesMatchId || matchesAll);
        });
    };

    const getPaginationData = (memories: MemoryModel[]) => {
        const indexOfLastMemory = props.currentPage * memoriesPerPage;
        const indexOfFirstMemory = indexOfLastMemory - memoriesPerPage;
        const currentMemories = memories.slice(indexOfFirstMemory, indexOfLastMemory);
        const totalPages = Math.ceil(memories.length / memoriesPerPage);
        return { currentMemories, totalPages };
    };

    const { currentMemories, totalPages } = getPaginationData(filteredMemories);

    return (
        <>
            {props.showSearch && (
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    memories={props.activeMemories}
                    setFilteredMemories={setFilteredMemories}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />
            )}

            <div className="memory-card-container">
                {currentMemories.map((memory) => (
                    <MemoryCard
                        key={memory.id}
                        memory={memory}
                        user={props.user}
                        favorites={props.favorites}
                        toggleFavorite={props.toggleFavorite}
                    />
                ))}
            </div>

            <div className="space-between">
                <div>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => props.paginate(index + 1)}
                            className="button-group-button"
                            id={index + 1 === props.currentPage ? "active-paginate" : undefined} // ID nur für den aktiven Button
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
