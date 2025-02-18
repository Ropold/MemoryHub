package ropold.backend.model;


public record MemoryModel(
        String id,
        String name,
        int matchId,
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
