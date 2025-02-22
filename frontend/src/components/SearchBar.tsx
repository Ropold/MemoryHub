import { MemoryModel } from "./model/MemoryModel.ts";
import React, { ChangeEvent, useEffect } from "react";
import "./styles/SearchBar.css";

type SearchBarProps = {
    value: string;
    onChange: (value: string) => void;
    memories: MemoryModel[];
    setFilteredMemories: (memories: MemoryModel[]) => void;
    filterType: "name" | "category" | "matchId" | "all";
    setFilterType: (filterType: "name" | "category" | "matchId" | "all") => void;
    selectedCategory: MemoryModel["category"] | "";
    setSelectedCategory: (category: MemoryModel["category"] | "") => void;
};

const SearchBar: React.FC<SearchBarProps> = ({
                                                 value,
                                                 onChange,
                                                 memories,
                                                 setFilteredMemories,
                                                 filterType,
                                                 setFilterType,
                                                 selectedCategory,
                                                 setSelectedCategory
                                             }) => {
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(event.target.value as MemoryModel["category"] | "");
    };

    const handleMatchIdChange = (event: ChangeEvent<HTMLSelectElement>) => {
        onChange(event.target.value);
    };

    useEffect(() => {
        const lowerQuery = value.toLowerCase();

        const filtered = memories.filter((memory) => {
            const matchesCategory = selectedCategory ? memory.category === selectedCategory : true;
            const matchesName = filterType === "name" && memory.name.toLowerCase().includes(lowerQuery);
            const matchesMatchId = filterType === "matchId" && memory.matchId.toString() === value;
            const matchesAll =
                filterType === "all" &&
                (memory.name.toLowerCase().includes(lowerQuery) ||
                    memory.category.toLowerCase().includes(lowerQuery) ||
                    memory.matchId.toString().includes(lowerQuery));

            return matchesCategory && (matchesName || matchesMatchId || matchesAll);
        });

        setFilteredMemories(filtered);
    }, [value, filterType, memories, selectedCategory, setFilteredMemories]);

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search Memories..."
                value={value}
                onChange={handleInputChange}
            />
            <div className="filter-buttons">
                <button
                    onClick={() => setFilterType("name")}
                    className={filterType === "name" ? "active" : ""}
                >
                    Name
                </button>
                <button
                    onClick={() => setFilterType("matchId")}
                    className={filterType === "matchId" ? "active" : ""}
                >
                    Match ID
                </button>
                <button
                    onClick={() => {
                        setFilterType("all");
                        setSelectedCategory("");
                        onChange('');
                    }}
                    className={filterType === "all" && selectedCategory === "" ? "active" : ""}
                >
                    No Filter
                </button>
                <label>
                    <select
                        className="input-small"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                    >
                        <option value="">Filter by a category</option>
                        <option value="GITHUB_AVATAR">GitHub Avatar</option>
                        <option value="CLOUDINARY_IMAGE">Cloudinary Image</option>
                    </select>
                </label>
                <label>
                    <select
                        className="input-small"
                        value={filterType === "matchId" ? value : ""}
                        onChange={handleMatchIdChange}
                        disabled={filterType !== "matchId"}
                    >
                        <option value="">Filter by Match ID</option>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((id) => (
                            <option key={id} value={id.toString()}>
                                {id}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </div>
    );
};

export default SearchBar;
