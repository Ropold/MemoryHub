package ropold.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ropold.backend.model.MemoryModel;
import ropold.backend.model.MemoryModelDto;
import ropold.backend.service.MemoryService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/memory-hub")
@RequiredArgsConstructor
public class MemoryController {

    private final MemoryService memoryService;
    private final CloudinaryService cloudinaryService;

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
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {

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
                        memoryModelDto.imageUrl()
                ));
    }

}


