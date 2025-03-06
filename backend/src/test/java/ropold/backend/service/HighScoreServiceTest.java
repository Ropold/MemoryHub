package ropold.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ropold.backend.model.HighScoreModel;
import ropold.backend.repository.HighScoreRepository;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HighScoreServiceTest {

    IdService idService = mock(IdService.class);
    HighScoreRepository highScoreRepository = mock(HighScoreRepository.class);
    HighScoreService highScoreService = new HighScoreService(highScoreRepository, idService);

    HighScoreModel highScore1 = new HighScoreModel(
            "1",
            "Player1",
            "github1",
            1,
            10,
            10.5,
            LocalDateTime.of(2025, 3, 5, 12, 0, 0)
    );

    HighScoreModel highScore2 = new HighScoreModel(
            "2",
            "Player2",
            "github2",
            1,
            10,
            12.3,
            LocalDateTime.of(2025, 3, 5, 12, 1, 0)
    );

    List<HighScoreModel> highScores = List.of(highScore1, highScore2);

    @BeforeEach
    void setup() {
        highScoreRepository.deleteAll();
        highScoreRepository.saveAll(highScores);
    }

    @Test
    void getBestHighScoresForCards10() {
        // Given
        when(highScoreRepository.findTop10ByNumberOfCardsOrderByScoreTimeAsc(10)).thenReturn(highScores);

        // When
        List<HighScoreModel> expected = highScoreService.getBestHighScoresForCards(10);

        // Then
        assertEquals(expected, highScores);
    }


    @Test
    void deleteHighScore() {
        // Given
        String idToDelete = "1";

        // When
        highScoreService.deleteHighScore(idToDelete);

        // Then
        verify(highScoreRepository, times(1)).deleteById(idToDelete);
    }

    @Test
    void addHighScore_whenOnlyTwoHighScoreAreInRepo(){
        // Given
        HighScoreModel highScore3 = new HighScoreModel(
                "3",
                "Player3",
                "github3",
                1,
                10,
                9.5,
                LocalDateTime.of(2025, 3, 5, 12, 2, 0)
        );
        when(idService.generateRandomId()).thenReturn("3");
        when(highScoreRepository.findTop10ByNumberOfCardsOrderByScoreTimeAsc(10)).thenReturn(highScores);
        when(highScoreRepository.save(any(HighScoreModel.class))).thenReturn(highScore3);

        // When
        HighScoreModel expected = highScoreService.addHighScore(highScore3);

        // Then
        assertEquals(expected, highScore3);
    }

    @Test
    void addHighScore_shouldReturnNull_whenNewHighScoreIsNotBetterThanWorstHighScore() {
        // Given
        LocalDateTime fixedDate = LocalDateTime.of(2025, 3, 5, 12, 0, 0);

        List<HighScoreModel> existingScores = List.of(
                new HighScoreModel("1", "player1", "john_doe_123", 5, 32, 5.6, fixedDate),
                new HighScoreModel("2", "player2", "john_doe_123", 5, 32, 6.6, fixedDate),
                new HighScoreModel("3", "player3", "john_doe_123", 5, 32, 8.6, fixedDate),
                new HighScoreModel("4", "player4", "john_doe_123", 5, 32, 9.6, fixedDate),
                new HighScoreModel("5", "player5", "john_doe_123", 5, 32, 10.6, fixedDate),
                new HighScoreModel("6", "player6", "john_doe_123", 5, 32, 12.6, fixedDate),
                new HighScoreModel("7", "player7", "john_doe_123", 5, 32, 13.6, fixedDate),
                new HighScoreModel("8", "player8", "john_doe_123", 5, 32, 13.6, fixedDate),
                new HighScoreModel("9", "player9", "john_doe_123", 5, 32, 15.6, fixedDate),
                new HighScoreModel("10", "player10", "john_doe_123", 5, 32, 29.6, fixedDate)
        );

        when(highScoreRepository.findTop10ByNumberOfCardsOrderByScoreTimeAsc(5)).thenReturn(existingScores);

        HighScoreModel newHighScore = new HighScoreModel(
                null,
                "NEIN!",
                "john_doe_123",
                5,
                32,
                36.6,
                null
        );

        // When
        HighScoreModel expected = highScoreService.addHighScore(newHighScore);

        // Then
        assertNull(expected);

        // Verify that deleteById was never called
        verify(highScoreRepository, never()).deleteById(any());
    }


}
