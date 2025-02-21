import { MemoryModel } from "./model/MemoryModel.ts";
import { useParams } from "react-router-dom";
import {DefaultMemory} from "./model/DefaultMemory.ts";
import "./styles/Details.css";
import "./styles/Profile.css";

type DetailsProps = {
    allMemories: MemoryModel[];
    favorites: string[];
    user: string;
    toggleFavorite: (memoryId: string) => void;
};

export default function Details(props: Readonly<DetailsProps>) {
    const { id } = useParams<{ id: string }>();

    const memory = props.allMemories.find(mem => mem.id === id) || DefaultMemory;
    const isFavorite = props.favorites.includes(memory.id);

    return (
        <div className="memory-details">
            <h2>{memory.name}</h2>
            <p><strong>Category:</strong> {memory.category}</p>
            <p><strong>Description:</strong> {memory.description}</p>

            {memory.imageUrl && (
                <img src={memory.imageUrl} alt={memory.name} className="memory-card-image" />
            )}

            {props.user !== "anonymousUser" && (
                <div className="button-group">
                    <button
                        onClick={() => props.toggleFavorite(memory.id)}
                        className={isFavorite ? "favorite-on" : "favorite-off"}
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
