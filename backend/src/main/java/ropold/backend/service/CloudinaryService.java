package ropold.backend.service;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ropold.backend.exception.ImageDeletionException;

import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile image) throws IOException {
        File fileToUpload = File.createTempFile("practice-hub", "");
        image.transferTo(fileToUpload);

        Map uploadResult = cloudinary.uploader().upload(fileToUpload, Collections.emptyMap());
        return uploadResult.get("secure_url").toString();
    }

    private String extractPublicIdFromUrl(String url) {
        String[] parts = url.split("/");
        String publicId = parts[parts.length - 1].split("\\.")[0]; // extrahiere v1614149342/sample
        return publicId;
    }

    public void deleteImage(String imageUrl) {
        String publicId = extractPublicIdFromUrl(imageUrl);

        try {
            cloudinary.uploader().destroy(publicId, Collections.emptyMap());
        } catch (IOException e) {
            throw new ImageDeletionException("Error deleting image from Cloudinary: " + publicId);
        }
    }
}
