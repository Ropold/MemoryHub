import { MemoryModel } from "./model/MemoryModel.ts";
import { useParams } from "react-router-dom";
import {DefaultMemory} from "./model/DefaultMemory.ts";
import "./styles/Details.css";
import "./styles/Profile.css";
import {useEffect, useState} from "react";
import axios from "axios";

type DetailsProps = {
    allMemories: MemoryModel[];
    favorites: string[];
    user: string;
    toggleFavorite: (memoryId: string) => void;
};

export default function Details(props: Readonly<DetailsProps>) {
    const [memory, setMemory] = useState<MemoryModel>(DefaultMemory);
    const { id } = useParams<{ id: string }>();

    const fetchMemoryDetails = () => {
        if (!id) return;
        axios
            .get(`/api/memory-hub/${id}`)
            .then((response) => setMemory(response.data))
            .catch((error) => console.error("Error fetching memory details", error));
    };

    useEffect(() => {
        fetchMemoryDetails();
    }, [id]);

    const isFavorite = props.favorites.includes(memory.id);

    return (
        <div className="memory-details">
            <h2>{memory.name}</h2>
            <p><strong>Category:</strong> {memory.category}</p>
            <p><strong>Game-Deck-ID:</strong> {memory.matchId}</p>
            <p><strong>Description:</strong> {memory.description || "No description available"}</p>


            {memory.imageUrl && (
                <img src={memory.imageUrl} alt={memory.name} className="memory-card-image" />
            )}

            {props.user !== "anonymousUser" && (
                <div>
                    <button
                        className={`button-group-button ${isFavorite ? "favorite-on" : "favorite-off"}`}
                        onClick={() => props.toggleFavorite(memory.id)}
                    >
                        ♥
                    </button>
                </div>

            )}

            <div className="profile-container">
                <h3>Memory added by GitHub User</h3>
                <div>
                    <p><strong>Username: </strong> {memory.appUserUsername}</p>
                    <p>
                        <strong>GitHub Profile: </strong>
                        <a href={memory.appUserGithubUrl} target="_blank" rel="noopener noreferrer">
                            Visit Profile
                        </a>
                    </p>
                    <img
                        src={memory.appUserAvatarUrl}
                        alt={`${memory.appUserUsername}'s avatar`}
                        className="user-avatar"
                    />
                </div>
            </div>
        </div>
    );
}
