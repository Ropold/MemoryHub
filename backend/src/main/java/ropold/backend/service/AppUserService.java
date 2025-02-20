package ropold.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ropold.backend.model.AppUser;
import ropold.backend.repository.AppUserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppUserService {

    private final AppUserRepository appUserRepository;

    public AppUser getUserById(String userId) {
        return appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<String> getUserFavorites(String userId) {
        AppUser user = getUserById(userId);
        return user.favorites();
    }

    public void addMemoryToFavorites(String userId, String memoryId) {
        AppUser user = getUserById(userId);

        if (!user.favorites().contains(memoryId)) {
            user.favorites().add(memoryId);
            appUserRepository.save(user);
        }
    }

    public void removeMemoryFromFavorites(String userId, String memoryId) {
        AppUser user = getUserById(userId);

        if (user.favorites().contains(memoryId)) {
            user.favorites().remove(memoryId);
            appUserRepository.save(user);
        }
    }
}
