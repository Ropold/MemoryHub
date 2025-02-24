import { UserDetails } from "./model/UserDetailsModel.ts";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/AddMemoryCard.css";
import "./styles/Buttons.css";
import "./styles/Popup.css";
import {MemoryModel} from "./model/MemoryModel.ts";

type MemoryCardProps = {
    userDetails: UserDetails | null;
    handleSubmit: (memory: MemoryModel) => void;
}

export default function AddMemoryCard(props: Readonly<MemoryCardProps>) {

    const [name, setName] = useState<string>("");
    const [category, setCategory] = useState<string>("CLOUDINARY_IMAGE");
    const [description, setDescription] = useState<string>("");
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>(""); // Setzt den Image-URL State
    const [matchId, setMatchId] = useState<number>(1); // Defaultwert als Zahl (1)
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [showPopup, setShowPopup] = useState(false);

    const navigate = useNavigate();

    // useEffect, um imageUrl zu setzen, wenn die Kategorie sich ändert und GitHub Avatar ausgewählt wird
    useEffect(() => {
        if (category === "GITHUB_AVATAR" && props.userDetails?.avatar_url) {
            setImageUrl(props.userDetails.avatar_url); // Setze imageUrl auf die GitHub URL
        } else {
            setImageUrl(""); // Leere das imageUrl bei anderen Kategorien
        }
    }, [category, props.userDetails?.avatar_url]); // Abhängig von der Kategorie und der GitHub-URL des Benutzers

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const memoryData = {
            name,
            matchId,
            category,
            description,
            isActive: true,
            appUserGithubId: props.userDetails?.id,
            appUserUsername: props.userDetails?.login,
            appUserAvatarUrl: props.userDetails?.avatar_url,
            appUserGithubUrl: props.userDetails?.html_url,
            imageUrl: imageUrl,
        };

        if (category === "GITHUB_AVATAR") {
            // JSON-POST an den Avatar-Endpunkt
            axios
                .post("/api/memory-hub/avatar", memoryData, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                .then((response) => {
                    console.log("Avatar Memory gespeichert:", response.data);
                    navigate(`/memory/${response.data.id}`);
                })
                .catch((error) => {
                    if (error.response && error.response.status === 400 && error.response.data) {
                        const errorMessages = error.response.data;
                        const errors: string[] = [];
                        Object.keys(errorMessages).forEach((field) => {
                            errors.push(`${field}: ${errorMessages[field]}`);
                        });

                        setErrorMessages(errors);
                        setShowPopup(true);
                    } else {
                        alert("An unexpected error occurred. Please try again.");
                    }
                });
        } else {
            // Multipart-POST an den Standard-Endpunkt
            const data = new FormData();

            if (image) {
                data.append("image", image);
            }

            data.append("memoryModelDto", new Blob([JSON.stringify(memoryData)], { type: "application/json" }));

            axios
                .post("/api/memory-hub", data, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                })
                .then((response) => {
                    console.log("Memory gespeichert:", response.data);
                    navigate(`/memory/${response.data.id}`);
                })
                .catch((error) => {
                    if (error.response && error.response.status === 400 && error.response.data) {
                        const errorMessages = error.response.data;
                        const errors: string[] = [];
                        Object.keys(errorMessages).forEach((field) => {
                            errors.push(`${field}: ${errorMessages[field]}`);
                        });

                        setErrorMessages(errors);
                        setShowPopup(true);
                    } else {
                        alert("An unexpected error occurred. Please try again.");
                    }
                });
        }
    };


    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            setImage(file);
            setImageUrl("temp-image"); // Temporärer Wert, um die Validierung zu bestehen
        }
    }

    const handleClosePopup = () => {
        setShowPopup(false);
        setErrorMessages([]);
    };

    return (
        <div className="edit-form">
            <h2>Add Memory Card</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input
                        className="input-small"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>

                <label>
                    Bildquelle:
                    <select
                        className="input-small"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="CLOUDINARY_IMAGE">Cloudinary Image</option>
                        <option value="GITHUB_AVATAR">GitHub Avatar</option>
                    </select>
                </label>

                <label>
                    Description:
                    <textarea
                        className="textarea-large"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </label>

                <label>
                    Match ID:
                    <select
                        className="input-small"
                        value={matchId}
                        onChange={(e) => setMatchId(Number(e.target.value))}
                        required
                    >
                        {[...Array(20).keys()].map((n) => n + 1).map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </label>


                <label>
                    Image:
                    <input
                        type="file"
                        onChange={onFileChange}
                        disabled={category === "GITHUB_AVATAR"} // Deaktiviert das Dateiauswahlfeld, wenn GitHub Avatar ausgewählt ist
                    />
                </label>

                {category === "GITHUB_AVATAR" && props.userDetails?.avatar_url && (
                    <img
                        src={props.userDetails.avatar_url}
                        className="memory-card-image"
                        alt="GitHub Avatar"
                    />
                )}

                {image && category === "CLOUDINARY_IMAGE" && (
                    <img src={URL.createObjectURL(image)} className="memory-card-image" alt="Preview" />
                )}

                <div className="space-between">
                    <button className="button-group-button" type="submit">Add Memory Card</button>
                </div>
            </form>

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Validation Errors</h3>
                        <ul>
                            {errorMessages.map((msg, index) => (
                                <li key={index}>{msg}</li>
                            ))}
                        </ul>
                        <div className="popup-actions">
                            <button className="popup-cancel" onClick={handleClosePopup}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}