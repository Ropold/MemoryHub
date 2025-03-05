package ropold.backend.controller;


import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import ropold.backend.model.HighScoreModel;
import ropold.backend.repository.HighScoreRepository;

import java.time.LocalDateTime;
import java.util.List;

@SpringBootTest
@AutoConfigureMockMvc
public class HighScoreControllerIntegrationTest {

    @Autowired
    private HighScoreRepository highScoreRepository;

    @BeforeEach
    void setUp() {
        highScoreRepository.deleteAll();

        LocalDateTime now = LocalDateTime.now();

        HighScoreModel highScoreModel1 = new HighScoreModel(
                "1", "player1", "123456", 1, 4, 10.2, now);

        HighScoreModel highScoreModel2 = new HighScoreModel(
                "2", "player1", "123456", 2, 4, 14.5, now.minusMinutes(5));

        highScoreRepository.saveAll(List.of(highScoreModel1, highScoreModel2));
    }




}
