import { MemoryModel } from "./model/MemoryModel.ts";
import "./styles/SearchBar.css";
import "./styles/Buttons.css";
import "./styles/AddMemoryCard.css";

type SearchBarProps = {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    selectedCategory: MemoryModel["category"] | "";
    setSelectedCategory: (category: MemoryModel["category"] | "") => void;
    selectedMatchId: string;
    setSelectedMatchId: (matchId: string) => void;
    memories: MemoryModel[];
};

const SearchBar: React.FC<SearchBarProps> = ({
                                                 searchQuery,
                                                 setSearchQuery,
                                                 selectedCategory,
                                                 setSelectedCategory,
                                                 selectedMatchId,
                                                 setSelectedMatchId,
                                                 memories,
                                             }) => {
    const matchIds = Array.from(new Set(memories.map((memory) => memory.matchId.toString())));

    const handleReset = () => {
        setSearchQuery("");
        setSelectedCategory("");
        setSelectedMatchId("");
    };

    return (
        <div className="search-bar">
            {/* Name-Suche */}
            <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
            />

            <div className="filter-buttons">
                {/* Match-ID-Filter (jetzt zuerst) */}
                <label>
                    <select
                        className="input-small"
                        value={selectedMatchId}
                        onChange={(event) => setSelectedMatchId(event.target.value)}
                    >
                        <option value="">Filter by Game Deck ID</option>
                        {matchIds.map((id) => (
                            <option key={id} value={id}>
                                {id}
                            </option>
                        ))}
                    </select>
                </label>

                {/* Kategorie-Filter (jetzt danach) */}
                <label>
                    <select
                        className="input-small"
                        value={selectedCategory}
                        onChange={(event) => setSelectedCategory(event.target.value as MemoryModel["category"] | "")}
                    >
                        <option value="">Filter by Category</option>
                        <option value="GITHUB_AVATAR">GitHub Avatar</option>
                        <option value="CLOUDINARY_IMAGE">Cloudinary Image</option>
                    </select>
                </label>

                {/* Reset-Button */}
                <button onClick={handleReset} className="button-group-button">
                    Reset Filters
                </button>
            </div>
        </div>
    );
};

export default SearchBar;
