import { useEffect, useState } from "react";
import { Category } from "./model/Category.ts";
import axios from "axios";
import MemoryCard from "./MemoryCard.tsx";
import "./styles/MemoryCard.css";
import "./styles/AddMemoryCard.css";
import "./styles/Buttons.css";
import "./styles/Popup.css";
import { UserDetails } from "./model/UserDetailsModel.ts";
import { MemoryModel } from "./model/MemoryModel.ts";

type MyMemoriesProps = {
    userDetails: UserDetails | null;
    user: string;
    favorites: string[];
    toggleFavorite: (memoryId: string) => void;
    allMemories: MemoryModel[];
    setAllMemories: React.Dispatch<React.SetStateAction<MemoryModel[]>>;
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    getAllMemories: () => void;
};

export default function MyMemories(props: Readonly<MyMemoriesProps>) {
    const [userMemories, setUserMemories] = useState<MemoryModel[]>([]);
    const [editedMemory, setEditedMemory] = useState<MemoryModel | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [category, setCategory] = useState<Category>("CLOUDINARY_IMAGE");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);
    const [imageChanged, setImageChanged] = useState(false);

    useEffect(() => {
        props.getAllMemories();
    }, []);


    // Filtere die Erinnerungen, die zum Benutzer gehören
    useEffect(() => {
        setUserMemories(props.allMemories.filter(memory => memory.appUserGithubId === props.user));
    }, [props.allMemories, props.user]);

    // Setze das Avatar-Image, wenn die Kategorie auf "GITHUB_AVATAR" gesetzt ist
    useEffect(() => {
        if (category === "GITHUB_AVATAR" && props.userDetails?.avatar_url) {
            setImageUrl(props.userDetails.avatar_url);
        } else {
            setImage(null);
        }
    }, [category, props.userDetails?.avatar_url]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value as Category);
    };

    const handleEditToggle = (memoryId: string) => {
        const memoryToEdit = props.allMemories.find(memory => memory.id === memoryId);
        if (memoryToEdit) {
            setEditedMemory(memoryToEdit);
            props.setIsEditing(true); // Umschalten in den Bearbeitungsmodus

            // Setze die Kategorie, falls erforderlich
            if (memoryToEdit.imageUrl === memoryToEdit.appUserAvatarUrl) {
                setCategory("GITHUB_AVATAR");
            } else {
                setCategory(memoryToEdit.category);
            }

            if (memoryToEdit.category === "GITHUB_AVATAR" && props.userDetails?.avatar_url) {
                setImageUrl(props.userDetails.avatar_url);
            } else {
                setImageUrl("");
            }

            if (memoryToEdit.category === "CLOUDINARY_IMAGE" && memoryToEdit.imageUrl) {
                fetch(memoryToEdit.imageUrl)
                    .then(response => response.blob())
                    .then(blob => {
                        const file = new File([blob], "current-image.jpg", { type: blob.type });
                        setImage(file);
                    })
                    .catch(error => console.error("Error loading current image:", error));
            } else {
                setImage(null); // Setze das Bild auf null, wenn keins vorhanden ist
            }
        }
    };

    const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editedMemory) return;

        if (category === "GITHUB_AVATAR") {
            // JSON-Request für GitHub Avatar
            const updatedMemoryData = { ...editedMemory, imageUrl: imageUrl ?? "" };

            axios.put(`/api/memory-hub/avatar/${editedMemory.id}`, updatedMemoryData, {
                headers: { "Content-Type": "application/json" }
            })
                .then(response => {
                    props.setAllMemories(prevMemories =>
                        prevMemories.map(memory => memory.id === editedMemory.id ? { ...memory, ...response.data } : memory)
                    );
                    props.setIsEditing(false); // Beende den Bearbeitungsmodus
                })
                .catch(error => {
                    console.error("Error saving changes:", error);
                    alert("An unexpected error occurred. Please try again later.");
                });

        } else {
            // Multipart-Request für andere Kategorien
            const data = new FormData();

            if (imageChanged && image) {
                data.append("image", image);
                setEditedMemory(prev => prev ? { ...prev, imageUrl: "temp-image" } : null);
            }

            const updatedMemoryData = { ...editedMemory };
            data.append("memoryModelDto", new Blob([JSON.stringify(updatedMemoryData)], { type: "application/json" }));

            axios.put(`/api/memory-hub/${editedMemory.id}`, data, { headers: { "Content-Type": "multipart/form-data" } })
                .then(response => {
                    props.setAllMemories(prevMemories =>
                        prevMemories.map(memory => memory.id === editedMemory.id ? { ...memory, ...response.data } : memory)
                    );
                    props.setIsEditing(false); // Beende den Bearbeitungsmodus
                })
                .catch(error => {
                    console.error("Error saving changes:", error);
                    alert("An unexpected error occurred. Please try again later.");
                });
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImage(e.target.files[0]);
            setImageChanged(true);
        }
    };

    const handleConfirmDelete = () => {
        if (memoryToDelete) {
            axios.delete(`/api/memory-hub/${memoryToDelete}`)
                .then(() => {
                    props.setAllMemories(prevMemories => prevMemories.filter(memory => memory.id !== memoryToDelete));
                })
                .catch(error => {
                    console.error("Error deleting memory:", error);
                    alert("An error occurred while deleting the memory.");
                });
            setShowPopup(false);
            setMemoryToDelete(null);
        }
    };

    const handleDeleteClick = (id: string) => {
        setMemoryToDelete(id);
        setShowPopup(true);
    };

    const handleCancel = () => {
        setShowPopup(false);
        setMemoryToDelete(null);
    };

    const handleToggleActiveStatus = (memoryId: string) => {
        axios
            .put(`/api/memory-hub/${memoryId}/toggle-active`)
            .then(() => {
                props.setAllMemories((prevMemories) =>
                    prevMemories.map((memory) =>
                        memory.id === memoryId ? { ...memory, isActive: !memory.isActive } : memory
                    )
                );
            })
            .catch((error) => {
                console.error("Error during Toggle Offline/Active", error);
                alert("An Error while changing the status of Active/Offline.");
            });
    };

    const handleMatchIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEditedMemory(prev => {
            if (prev) {
                return { ...prev, matchId: parseInt(e.target.value) }; // Setze matchId im editedMemory
            }
            return prev;
        });
    };


    return (
        <div>
            {props.isEditing ? (
                <div className="edit-form">
                    <h2>Edit Memory</h2>
                    <form onSubmit={handleSaveEdit}>
                        <label>
                            Name:
                            <input
                                className="input-small"
                                type="text"
                                value={editedMemory?.name ?? ""}
                                onChange={(e) =>
                                    setEditedMemory({ ...editedMemory!, name: e.target.value })
                                }
                            />
                        </label>

                        <label>
                            Category:
                            <select
                                className="input-small"
                                value={category}
                                onChange={handleCategoryChange}
                            >
                                <option value="GITHUB_AVATAR">GitHub Avatar</option>
                                <option value="CLOUDINARY_IMAGE">Cloudinary Image</option>
                            </select>
                        </label>

                        <label>
                            Game-Deck-ID:
                            <select
                                className="input-small"
                                value={editedMemory?.matchId ?? ""} // Setze den Wert aus editedMemory
                                onChange={handleMatchIdChange} // Event-Handler für matchId
                            >
                                <option value="">Select Game-Deck-ID</option> {/* Standardwert */}
                                {/* Dynamische Erstellung der Optionen für MatchId von 1 bis 20 */}
                                {Array.from({ length: 20 }, (_, index) => (
                                    <option key={index + 1} value={index + 1}>
                                        Deck {index + 1}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Description:
                            <textarea
                                className="textarea-large"
                                value={editedMemory?.description ?? ""}
                                onChange={(e) =>
                                    setEditedMemory({ ...editedMemory!, description: e.target.value })
                                }
                            />
                        </label>

                        <label>
                            Image:
                            {category === "GITHUB_AVATAR" && imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="GitHub Avatar"
                                    className="memory-card-image"
                                />
                            ) : (
                                <>
                                    <input type="file" onChange={onFileChange} />
                                    {image && (
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt="Memory"
                                            className="memory-card-image"
                                        />
                                    )}
                                </>
                            )}
                        </label>

                        <div className="space-between">
                            <button className="button-group-button" type="submit">Save Changes</button>
                            <button className="button-group-button" type="button" onClick={() => props.setIsEditing(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="memory-card-container">
                    {userMemories.length > 0 ? (
                        userMemories.map((memory) => (
                            <div key={memory.id}>
                                <MemoryCard
                                    memory={memory}
                                    favorites={props.favorites}
                                    user={props.user}
                                    toggleFavorite={props.toggleFavorite}
                                />
                                <div className="space-between">
                                    <button
                                        id={memory.isActive ? "active-button" : "inactive-button"}
                                        onClick={() => handleToggleActiveStatus(memory.id)} // Event-Handler für das toggeln
                                    >
                                        {memory.isActive ? "Active" : "Offline"}
                                    </button>

                                    <button className="button-group-button" onClick={() => handleEditToggle(memory.id)}>Edit</button>
                                    <button id="button-delete" onClick={() => handleDeleteClick(memory.id)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No memories found for this user.</p>
                    )}
                </div>
            )}

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this memory?</p>
                        <div className="popup-actions">
                            <button onClick={handleConfirmDelete} className="popup-confirm">
                                Yes, Delete
                            </button>
                            <button onClick={handleCancel} className="popup-cancel">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}