package ropold.backend.controller;


import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import ropold.backend.model.HighScoreModel;
import ropold.backend.repository.HighScoreRepository;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class HighScoreControllerIntegrationTest {

    @Autowired
    private HighScoreRepository highScoreRepository;
    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        highScoreRepository.deleteAll();

        // Fester Zeitstempel für Teststabilität
        LocalDateTime fixedDate = LocalDateTime.of(2025, 3, 5, 12, 0, 0);

        HighScoreModel highScoreModel1 = new HighScoreModel(
                "1", "player1", "123456", 1, 10, 10.2, fixedDate);

        HighScoreModel highScoreModel2 = new HighScoreModel(
                "2", "player1", "123456", 1, 10, 14.5, fixedDate.minusMinutes(5));

        highScoreRepository.saveAll(List.of(highScoreModel1, highScoreModel2));
    }

    @Test
    void getBestHighScoresForCards10() throws Exception {
        // when & then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/high-score/10"))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().json("""
                [
                    {
                        "id": "1",
                        "playerName": "player1",
                        "appUserGithubId": "123456",
                        "matchId": 1,
                        "numberOfCards": 10,
                        "scoreTime": 10.2,
                        "date": "2025-03-05T12:00:00"
                    },
                    {
                        "id": "2",
                        "playerName": "player1",
                        "appUserGithubId": "123456",
                        "matchId": 1,
                        "numberOfCards": 10,
                        "scoreTime": 14.5,
                        "date": "2025-03-05T11:55:00"
                    }
                ]
                """));
    }

    @Test
    void postHighScore_shouldReturnSavedHighScore() throws Exception {
        // GIVEN
        highScoreRepository.deleteAll();

        String highScoreJson = """
            {
                "playerName": "player1",
                "appUserGithubId": "123456",
                "matchId": 1,
                "numberOfCards": 10,
                "scoreTime": 9.5
            }
            """;

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.post("/api/high-score")
                        .contentType("application/json")
                        .content(highScoreJson))
                .andExpect(status().isCreated());

        // THEN
        List<HighScoreModel> allHighScores = highScoreRepository.findAll();
        Assertions.assertEquals(1, allHighScores.size());

        HighScoreModel savedHighScore = allHighScores.getFirst();
        org.assertj.core.api.Assertions.assertThat(savedHighScore)
                .usingRecursiveComparison()
                .ignoringFields("id", "date")
                .isEqualTo(new HighScoreModel(
                        null,
                        "player1",
                        "123456",
                        1,
                        10,
                        9.5,
                        null
                ));
    }

    @Test
    void postHighScore_withHighTime_shouldNotSave() throws Exception {
        // GIVEN: Bestehende Highscores vorbereiten
        highScoreRepository.deleteAll();

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

        highScoreRepository.saveAll(existingScores);
        Assertions.assertEquals(10, highScoreRepository.count()); // Sicherstellen, dass 10 Einträge existieren

        // WHEN: Ein neuer, schlechterer Highscore wird gepostet
        String newHighScoreJson = """
            {
                "playerName": "NEIN!",
                "appUserGithubId": "john_doe_123",
                "matchId": 5,
                "numberOfCards": 32,
                "scoreTime": 36.6
            }
            """;

        mockMvc.perform(MockMvcRequestBuilders.post("/api/high-score")
                        .contentType("application/json")
                        .content(newHighScoreJson))
                .andExpect(status().isCreated()) // API gibt immer 201 zurück
                .andExpect(MockMvcResultMatchers.content().string("")); // Aber Body ist null

        // THEN: Sicherstellen, dass kein zusätzlicher Eintrag gespeichert wurde
        List<HighScoreModel> allHighScores = highScoreRepository.findAll();
        Assertions.assertEquals(10, allHighScores.size()); // Anzahl der Highscores bleibt gleich
    }

    @Test
    void deleteHighScore() throws Exception {
        // WHEN: Eintrag mit ID "1" wird gelöscht
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/high-score/1"))
                .andExpect(status().isNoContent()); // Erwartung auf 204 No Content setzen

        // THEN: Prüfen, dass nur noch ein Eintrag existiert und ID "2" übrig bleibt
        Assertions.assertEquals(1, highScoreRepository.count());
        Assertions.assertTrue(highScoreRepository.existsById("2"));
    }



}
