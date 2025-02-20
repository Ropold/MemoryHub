import {MemoryModel} from "./model/MemoryModel.ts";
import {useEffect, useState} from "react";
import {Category} from "./model/Category.ts";
import * as React from "react";
import axios from "axios";

type MyMemoriesProps = {
    user: string;
    favorites: string[];
    toggleFavorite: (memoryId: string) => void;
    allMemories: MemoryModel[];
    setAllMemories: React.Dispatch<React.SetStateAction<MemoryModel[]>>;
}

export default function MyMemories(props: Readonly<MyMemoriesProps>) {

    const [userMemories, setUserMemories] = useState<MemoryModel[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedMemory, setEditedMemory] = useState<MemoryModel | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [category, setCategory] = useState<Category>("CLOUDINARY_IMAGE");
    const [showPopup, setShowPopup] = useState(false);
    const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);

    useEffect(() => {
        setUserMemories(props.allMemories.filter(memory => memory.appUserGithubId === props.user));
    }, [props.allMemories, props.user]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value as Category);  // Setze den Wert und zwinge TypeScript, ihn als Category zu behandeln
    };


    const handleEditToggle = (memoryId: string) => {
        const memoryToEdit = props.allMemories.find((memory) => memory.id === memoryId);
        if (memoryToEdit) {
            setEditedMemory(memoryToEdit);
            setIsEditing(true);
            if (memoryToEdit.imageUrl) {
                fetch(memoryToEdit.imageUrl)
                    .then((response) => response.blob())
                    .then((blob) => {
                        const file = new File([blob], "current-image.jpg", {type: blob.type});
                        setImage(file);
                    })
                    .catch((error) => console.error("Error loading current image:", error));
            } else {
                setImage(null);
            }
        }
    };

    const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!editedMemory) return;

        const data = new FormData();
        if (image) {
            data.append("image", image);
        }

        const updatedMemoryData = {
            ...editedMemory,
            imageUrl: "",  // You may want to update this after uploading the image
        };

        data.append("memoryModelDto", new Blob([JSON.stringify(updatedMemoryData)], {type: "application/json"}));

        axios
            .put(`/api/memory-hub/${editedMemory.id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((response) => {
                console.log("Antwort vom Server:", response.data);
                props.setAllMemories((prevMemories) =>
                    prevMemories.map((memory) =>
                        memory.id === editedMemory.id ? {...memory, ...response.data} : memory
                    )
                );
                setIsEditing(false);  // Exit edit mode
            })
            .catch((error) => {
                console.error("Error saving memory edits:", error);
                alert("An unexpected error occurred. Please try again.");
            });
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImage(e.target.files[0]);
        }
    };

    const handleConfirmDelete = () => {
        if (memoryToDelete) {
            axios
                .delete(`/api/memory-hub/${memoryToDelete}`)
                .then(() => {
                    props.setAllMemories((prevMemories) => prevMemories.filter((memory) => memory.id !== memoryToDelete));  // Remove the deleted memory from the list
                })
                .catch((error) => {
                    console.error("Error deleting memory:", error);
                    alert("An error occurred while deleting the memory.");
                });
        }
    }


    const handleToggleActiveStatus = (memoryId: string) => {
        axios
            .put(`/api/memory-hub/${memoryId}/toggle-active`)
            .then(() => {
                // Once the response comes, update the status of the memories
                props.setAllMemories((prevMemories) =>
                    prevMemories.map((memory) =>
                        memory.id === memoryId ? {...memory, isActive: !memory.isActive} : memory
                    )
                );
            })
            .catch((error) => {
                console.error("Error during Toggle Offline/Active", error);
                alert("An Error while changing the status of Active/Offline.");
            });
    }

    const handleDeleteClick = (id: string) => {
        setMemoryToDelete(id);
        setShowPopup(true);
    };

    const handleCancel = () => {
        setShowPopup(false);
        setMemoryToDelete(null);
    };

    return (
        <div>
            <h2>My Memories Cards</h2>
        </div>
    );
}