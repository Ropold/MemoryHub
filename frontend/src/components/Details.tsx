import { MemoryModel } from "./model/MemoryModel.ts";
import { useParams } from "react-router-dom";

type DetailsProps = {
    allMemories: MemoryModel[];
};

export default function Details(props: Readonly<DetailsProps>) {
    const { id } = useParams<{ id: string }>();

    // Suche das Memory-Objekt mit der passenden ID
    const memory = props.allMemories.find(mem => mem.id === id);

    return (
        <div>
            <h2>Memory Details</h2>
            {memory ? (
                <div>
                    <h3>{memory.name}</h3>
                    <p><strong>Category:</strong> {memory.category}</p>
                    <p><strong>Description:</strong> {memory.description}</p>
                    <p><strong>Active:</strong> {memory.isActive ? "Yes" : "No"}</p>
                    <p>
                        <strong>Created by:</strong>
                        <a href={memory.appUserGithubUrl} target="_blank" rel="noopener noreferrer">
                            {memory.appUserUsername}
                        </a>
                    </p>
                    <img src={memory.imageUrl} alt={memory.name} width={300} />
                </div>
            ) : (
                <p>Memory not found.</p>
            )}
        </div>
    );
}
