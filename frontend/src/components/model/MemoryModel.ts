import { Category } from "./Category.ts";

export type MemoryModel = {
    id: string;
    name: string;
    matchId: number;
    category: Category;
    description: string;
    isActive: boolean;
    appUserGithubId: string;
    appUserUsername: string;
    appUserAvatarUrl: string;
    appUserGithubUrl: string;
    imageUrl: string;
}


