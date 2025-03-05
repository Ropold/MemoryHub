package ropold.backend.controller;


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
public class HighScoreControllerIntegrationTest {

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


}
