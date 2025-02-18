import {UserDetails} from "./model/UserDetailsModel.ts";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

type MemoryCardProps = {
    userDetails: UserDetails | null;
}

export default function AddMemoryCard(props: Readonly<MemoryCardProps>) {

    const [name, setName] = useState<string>("");
    const [category, setCategory] = useState<string>("CLOUDINARY_IMAGE");
    const [description, setDescription] = useState<string>("");

    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const memoryData = {
            name,
            matchId: "1",
            category: category,
            description,
            isActive: true,
            appUserGithubId: props.userDetails?.id,
            appUserUsername: props.userDetails?.login,
            appUserAvatarUrl: props.userDetails?.avatar_url,
            appUserGithubUrl: props.userDetails?.html_url,
            imageUrl: "",
        };

        console.log("memoryData:", memoryData);

    }


    return (
        <div>
            <h2>Add Memory Card</h2>
        </div>
    );

}