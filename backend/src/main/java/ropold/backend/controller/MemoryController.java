package ropold.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ropold.backend.exception.AccessDeniedException;
import ropold.backend.model.MemoryModel;
import ropold.backend.model.MemoryModelDto;
import ropold.backend.service.AppUserService;
import ropold.backend.service.CloudinaryService;
import ropold.backend.service.MemoryService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/memory-hub")
@RequiredArgsConstructor
public class MemoryController {

    private final MemoryService memoryService;
    private final CloudinaryService cloudinaryService;
    private final AppUserService appUserService;

    @GetMapping()
    public List<MemoryModel> getAllMemories() {
        return memoryService.getAllMemories();
    }

    @GetMapping("/active")
    public List<MemoryModel> getActiveMemories() {
        return memoryService.getActiveMemories();
    }

    @GetMapping("/{id}")
    public MemoryModel getMemoryById(@PathVariable String id) {
        return memoryService.getMemoryById(id);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public MemoryModel addMemory(
            @RequestPart("memoryModelDto") @Valid MemoryModelDto memoryModelDto,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal OAuth2User authentication) throws IOException {

        String authenticatedUserId = authentication.getName();
        if (!authenticatedUserId.equals(memoryModelDto.appUserGithubId())) {
            throw new AccessDeniedException("You are not allowed to create memories for other users");
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image);
        }

        return memoryService.addMemory(
                new MemoryModel(
                        null,
                        memoryModelDto.name(),
                        memoryModelDto.matchId(),
                        memoryModelDto.category(),
                        memoryModelDto.description(),
                        memoryModelDto.isActive(),
                        memoryModelDto.appUserGithubId(),
                        memoryModelDto.appUserUsername(),
                        memoryModelDto.appUserAvatarUrl(),
                        memoryModelDto.appUserGithubUrl(),
                        imageUrl
                ));
    }

    @PutMapping("/{id}")
    public MemoryModel updateMemory(
            @PathVariable String id,
            @RequestPart("memoryModelDto") @Valid MemoryModelDto memoryModelDto,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal OAuth2User authentication) throws IOException {

        String authenticatedUserId = authentication.getName();
        MemoryModel existingMemory = memoryService.getMemoryById(id);

        if(!authenticatedUserId.equals(existingMemory.appUserGithubId())) {
            throw new AccessDeniedException("You are not allowed to update memories for other users");
        }

        String newImageUrl;
        if (image != null && !image.isEmpty()) {
            if (existingMemory.imageUrl() != null) {
                cloudinaryService.deleteImage(existingMemory.imageUrl());
            }
            newImageUrl = cloudinaryService.uploadImage(image);
        } else {
            newImageUrl = existingMemory.imageUrl();
        }

        return memoryService.updateMemoryWithPut(
                id,
                new MemoryModel(
                        id,
                        memoryModelDto.name(),
                        memoryModelDto.matchId(),
                        memoryModelDto.category(),
                        memoryModelDto.description(),
                        memoryModelDto.isActive(),
                        memoryModelDto.appUserGithubId(),
                        memoryModelDto.appUserUsername(),
                        memoryModelDto.appUserAvatarUrl(),
                        memoryModelDto.appUserGithubUrl(),
                        newImageUrl
                )
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMemory(@PathVariable String id, @AuthenticationPrincipal OAuth2User authentication) {
        String authenticatedUserId = authentication.getName();

        MemoryModel memoryModel = memoryService.getMemoryById(id);

        if (!authenticatedUserId.equals(memoryModel.appUserGithubId())) {
            throw new AccessDeniedException("You are not allowed to delete memories for other users");
        }

        memoryService.deleteMemory(id);
    }
}


