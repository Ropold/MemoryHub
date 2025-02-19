import {MemoryModel} from "./model/MemoryModel.ts";
import {useEffect, useState} from "react";

type MyMemoriesProps = {
    user: string;
    allMemories: MemoryModel[];
}

export default function MyMemories(props: Readonly<MyMemoriesProps>) {

    const [userMemories, setUserMemories] = useState<MemoryModel[]>([]);

    useEffect(() => {
        setUserMemories(props.allMemories.filter(memory => memory.appUserGithubId === props.user));
    }, [props.allMemories, props.user]);

    return (
        <div>
            <h2>My Memories Cards</h2>
        </div>
    );
}