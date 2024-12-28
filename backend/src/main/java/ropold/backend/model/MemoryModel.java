package ropold.backend.model;

import org.springframework.data.mongodb.core.mapping.Document;

@Document("memoryModel")
public record MemoryModel(
        String id,
        String name,
        String matchId,
        Category category,
        String description,
        boolean isActive,
        String appUserGithubId,
        String appUserUsername,
        String appUserAvatarUrl,
        String appUserGithubUrl,
        String imageUrl
) {
}
