import {MemoryModel} from "./model/MemoryModel.ts";
import {useEffect, useState} from "react";
import {Category} from "./model/Category.ts";

type MyMemoriesProps = {
    user: string;
    allMemories: MemoryModel[];
    toggleFavorite: (memoryId: string) => void;
    favorites: string[];
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



    return (
        <div>
            <h2>My Memories Cards</h2>
        </div>
    );
}