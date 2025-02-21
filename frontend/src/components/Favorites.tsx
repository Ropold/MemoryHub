import {MemoryModel} from "./model/MemoryModel.ts";
import {useEffect, useState} from "react";
import axios from "axios";
import MemoryCard from "./MemoryCard.tsx";

type FavoritesProps = {
    favorites: string[];
    user: string;
    toggleFavorite: (memoryId: string) => void;
}

export default function Favorites(props: Readonly<FavoritesProps>) {
    const [favoritesMemories, setFavoritesMemories] = useState<MemoryModel[]>([]);

    useEffect(() => {
        axios
            .get(`/api/memories/favorites`)
            .then((response) => {
                setFavoritesMemories(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [props.user, props.favorites]);

    return (
        <div className={"memory-card-container"}>
            {favoritesMemories.length > 0 ? (
                favoritesMemories.map((memory) => (
                    <MemoryCard key={memory.id} memory={memory} user={props.user} favorites={props.favorites} toggleFavorite={props.toggleFavorite} />
                ))
            ) : (
                <p>No memories in favorites.</p>
            )}

        </div>
    );
}