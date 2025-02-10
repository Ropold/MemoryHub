package ropold.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MemoryNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public MemoryError handleMemoryNotFoundException(MemoryNotFoundException e) {
        e.printStackTrace();
        return new MemoryError(e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();

        e.getBindingResult().getFieldErrors().forEach(fieldError -> {
            String fieldName = fieldError.getField();
            String errorMessage = fieldError.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }

    @ExceptionHandler(ImageDeletionException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public MemoryError handleImageDeletionException(ImageDeletionException e) {
        return new MemoryError(e.getMessage());
    }

}
