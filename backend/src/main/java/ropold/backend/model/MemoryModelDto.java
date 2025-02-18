package ropold.backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MemoryModelDto(
        @NotBlank
        @Size (min = 3, message = "Name must contain at least 3 characters")
        String name,

        int matchId,
        Category category,
        String description,
        boolean isActive,
        String appUserGithubId,
        String appUserUsername,
        String appUserAvatarUrl,
        String appUserGithubUrl,
        @NotBlank(message = "Image can't be empty")
        String imageUrl
) {
}
