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

export default function ListOfAllCards(props: Readonly<HomeProps>) {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filteredMemories, setFilteredMemories] = useState<MemoryModel[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<MemoryModel["category"] | "">("");
    const [selectedMatchId, setSelectedMatchId] = useState<string>("");
    const [memoriesPerPage, setMemoriesPerPage] = useState<number>(9);

    useEffect(() => {
        if (!props.showSearch) {
            setSearchQuery("");
            setSelectedCategory("");
            setSelectedMatchId("");
        }
    }, [props.showSearch]);

    useEffect(() => {
        const updateMemoriesPerPage = () => {
            if (window.innerWidth < 768) {
                setMemoriesPerPage(8);
            } else if (window.innerWidth < 1200) {
                setMemoriesPerPage(9);
            } else {
                setMemoriesPerPage(12);
            }
        };

        updateMemoriesPerPage();
        window.addEventListener("resize", updateMemoriesPerPage);

        return () => {
            window.removeEventListener("resize", updateMemoriesPerPage);
        };
    }, []);

    useEffect(() => {
        const filtered = filterMemories(props.activeMemories, searchQuery, selectedCategory, selectedMatchId);
        setFilteredMemories(filtered);
    }, [props.activeMemories, searchQuery, selectedCategory, selectedMatchId]);

    const filterMemories = (
        memories: MemoryModel[],
        query: string,
        category: string,
        matchId: string
    ) => {
        const lowerQuery = query.toLowerCase();

        return memories.filter((memory) => {
            const matchesCategory = category ? memory.category === category : true;
            const matchesMatchId = matchId ? memory.matchId.toString() === matchId : true;
            const matchesSearch =
                memory.name.toLowerCase().includes(lowerQuery) ||
                memory.description.toLowerCase().includes(lowerQuery); // 🔥 NEU: description wird jetzt mit durchsucht!

            return matchesCategory && matchesMatchId && matchesSearch;
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
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedMatchId={selectedMatchId}
                    setSelectedMatchId={setSelectedMatchId}
                    memories={props.activeMemories}
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
                            id={index + 1 === props.currentPage ? "active-paginate" : undefined}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
