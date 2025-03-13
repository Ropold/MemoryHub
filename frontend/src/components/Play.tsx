import { useState, useEffect } from "react";
import { MemoryModel } from "./model/MemoryModel.ts";
import PlayMemoryCard from "./PlayMemoryCard.tsx";
import { HighScoreModel } from "./model/HighScoreModel.ts";
import axios from "axios";


type PlayProps = {
    highScores10: HighScoreModel[];
    highScores20: HighScoreModel[];
    highScores32: HighScoreModel[];
    user: string;
};

// Fisher-Yates-Shuffle-Funktion für wirklich zufälliges Mischen
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export default function Play(props: Readonly<PlayProps>) {
    const [cards, setCards] = useState<{ card: MemoryModel; uniqueId: string }[]>([]);
    const [previewCards, setPreviewCards] = useState<{ card: MemoryModel; uniqueId: string }[]>([]);
    const [flippedCards, setFlippedCards] = useState<string[]>([]);
    const [matchedCards, setMatchedCards] = useState<string[]>([]);
    const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
    const [cardCount, setCardCount] = useState<number>(10);
    const [showControls, setShowControls] = useState(true);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [time, setTime] = useState<number>(0);
    const [intervalId, setIntervalId] = useState<number | null>(null);
    const [playerName, setPlayerName] = useState<string>("");
    const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
    const [showNameInput, setShowNameInput] = useState<boolean>(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [activeMatchIds, setActiveMatchIds] = useState<number[]>([]);
    const [activeMemories, setActiveMemories] = useState<MemoryModel[]>([]);
    const [isLoadingMemories, setIsLoadingMemories] = useState(false);
    const [delayedMessage, setDelayedMessage] = useState<string | null>(null);


    const getMissingCardsMessage = (): string | null => {
        // Überprüfen, ob genügend Karten vorhanden sind
        if (activeMemories.length < cardCount) {
            const missingCards = cardCount - activeMemories.length;
            return `There must be added ${missingCards} more Memory-Card${missingCards > 1 ? 's' : ''} to play with ${cardCount} cards in this game-deck.`;
        }
        return null; // Wenn genügend Karten vorhanden sind
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDelayedMessage(getMissingCardsMessage());
        }, 2000);

        return () => clearTimeout(timeoutId); // Cleanup, falls sich cardCount oder activeMemories ändert
    }, [cardCount, activeMemories]);

    const handleSaveHighScore = () => {
        if (playerName.trim().length < 3) {
            setPopupMessage("Your name must be at least 3 characters long!");
            setShowPopup(true);
            return;
        }
        setShowNameInput(false);
        postHighScore();
    };

    const getActiveMemoriesMatchIds = () => {
        axios
            .get("api/memory-hub/active/match-ids")
            .then((response) => {
                const matchIds = response.data;
                setActiveMatchIds(matchIds);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    useEffect(() => {
        getActiveMemoriesMatchIds();
    }, []);

    const getActiveMemoriesByMatchId = (matchId: number) => {
        setIsLoadingMemories(true);
        axios
            .get(`api/memory-hub/active/match-id/${matchId}`)
            .then((response) => {
                setActiveMemories(response.data); // Speichert die abgerufenen Erinnerungen
            })
            .catch((error) => {
                console.error("Error retrieving memories:", error);
            })
            .finally(() => {
                setIsLoadingMemories(false); // Ladezustand deaktivieren, wenn Request abgeschlossen ist
            });
    };

// useEffect, um die Erinnerungen zu laden, wenn die `selectedMatchId` geändert wird
    useEffect(() => {
        if (selectedMatchId !== null) {
            getActiveMemoriesByMatchId(selectedMatchId);
        }
    }, [selectedMatchId]);


    // Timer starten, wenn das Spiel beginnt
    useEffect(() => {
        if (isGameStarted) {
            setTime(0); // Timer zurücksetzen
            const id = window.setInterval(() => {
                setTime(prev => prev + 0.1); // Timer um 0.1 Sekunden erhöhen
            }, 100);
            setIntervalId(id);
        } else if (!isGameStarted && intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    }, [isGameStarted]);

    // Timer stoppen, wenn das Spiel gewonnen ist
    useEffect(() => {
        if (matchedCards.length === cards.length && cards.length > 0 && intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    }, [matchedCards, cards]);

    // Vorschau der Karten (neu laden, wenn MatchId oder Anzahl sich ändert)
    useEffect(() => {
        if (selectedMatchId !== null) {
            let filteredCards = activeMemories.filter(memory => memory.matchId === selectedMatchId);

            // Zufällig mischen, bevor die Vorschau angezeigt wird
            filteredCards = shuffleArray(filteredCards);

            const previewCards = filteredCards.slice(0, cardCount).map(memory => ({
                card: memory,
                uniqueId: memory.id + "-A"
            }));

            setPreviewCards(previewCards);

            // Spielfeld resetten, damit nur die Vorschau sichtbar ist
            setCards([]);
            setIsGameStarted(false);
            setMatchedCards([]);
            setFlippedCards([]);
            setShowAnimation(false); // Win-Animation zurücksetzen
            setHasStarted(false); // Spielstatus zurücksetzen
        }
    }, [selectedMatchId, cardCount, activeMemories]);

    // Win-Animation auslösen
    useEffect(() => {
        if (matchedCards.length === cards.length && hasStarted) {
            setShowAnimation(true);
            setTimeout(() => {
                setShowAnimation(false);
                setIsGameStarted(false);
            }, 3000);
        }
    }, [matchedCards, cards, hasStarted]);

    // Spielstart und Kartenmischen
    useEffect(() => {
        if (!isGameStarted || !selectedMatchId) return;

        setHasStarted(true);

        let filteredCards = activeMemories.filter(memory => memory.matchId === selectedMatchId);

        // Karten vorher mischen, damit nicht immer dieselben zuerst genommen werden
        filteredCards = shuffleArray(filteredCards);

        // Jetzt erst die gewünschte Anzahl nehmen
        filteredCards = filteredCards.slice(0, cardCount / 2);

        let allCards = filteredCards.flatMap(memory => [
            { card: memory, uniqueId: memory.id + "-A" },
            { card: memory, uniqueId: memory.id + "-B" }
        ]);

        // Endgültiges Deck mischen
        allCards = shuffleArray(allCards);

        setCards([...allCards]);
        setFlippedCards([]);
        setMatchedCards([]);
    }, [selectedMatchId, cardCount, isGameStarted, activeMemories]);

    // Karte umdrehen
    const flipCard = (uniqueId: string) => {
        if (flippedCards.length === 2 || flippedCards.includes(uniqueId)) return;

        const newFlippedCards = [...flippedCards, uniqueId];
        setFlippedCards(newFlippedCards);

        if (newFlippedCards.length === 2) {
            const [card1, card2] = newFlippedCards.map(id => cards.find(c => c.uniqueId === id));

            if (card1 && card2 && card1.card.id === card2.card.id) {
                setMatchedCards(prev => [...prev, card1.uniqueId, card2.uniqueId]);
                setFlippedCards([]);
            } else {
                setTimeout(() => setFlippedCards([]), 1000);
            }
        }
    };

    const hasGameEnded = matchedCards.length === cards.length && cards.length > 0;

    // Funktion zur Überprüfung des Highscores
    const checkForHighScore = () => {
        // Wählt das passende Highscore-Array je nach Kartenzahl
        const highScores = cardCount === 10 ? props.highScores10
            : cardCount === 20 ? props.highScores20
                : props.highScores32;

        // Wenn weniger als 10 Einträge existieren, immer aufnehmen
        if (highScores.length < 10) {
            setIsNewHighScore(true);
            setShowNameInput(true);
            return;
        }

        // Bestimmt die schlechteste Zeit in den Top 10
        const highestScoreTime = Math.max(...highScores.map((score) => score.scoreTime));

        // Wenn die aktuelle Zeit besser als die schlechteste Zeit ist, dann aufnehmen
        if (time < highestScoreTime) {
            setIsNewHighScore(true);
            setShowNameInput(true);
        }
    };


    // Posten des Highscores
    const postHighScore = () => {
        const highScoreData = {
            playerName,
            appUserGithubId: props.user,
            matchId: selectedMatchId,
            numberOfCards: cardCount,
            scoreTime: parseFloat(time.toFixed(1)),
        };

        // POST-Anfrage zum Speichern des Highscores
        axios
            .post("/api/high-score", highScoreData)
            .then(() => {
                setShowNameInput(false); // Eingabefeld nach dem Speichern ausblenden
            })
            .catch((error) => {
                console.error("Error saving the high score:", error);
            });
    };

    // Überprüfung auf Highscore nach Spielende
    useEffect(() => {
        if (matchedCards.length === cards.length && cards.length > 0) {
            checkForHighScore();
        }
    }, [matchedCards, cards]);



    return (
        <div>
            <div className="space-between">
                {/* Start Game, Options und Reset Buttons */}
                <button
                    onClick={() => {
                        setIsGameStarted(true);
                        setShowControls(false);
                        setIsNewHighScore(false);
                        setShowNameInput(false);
                    }}
                    disabled={isGameStarted || selectedMatchId === null || activeMemories.length < cardCount}
                    id={selectedMatchId && activeMemories.length >= cardCount ? "play-button-enabled" : "play-button-disabled"}
                >
                    Start Game
                </button>
                <button
                    onClick={() => setShowControls(prev => !prev)}
                    id={showControls ? "button-options-active" : undefined}
                    className={`button-group-button ${showControls ? "" : "some-other-class"}`}
                >
                    {showControls ? "Hide Options" : "Options"}
                </button>

                <button
                    className="button-group-button"
                    onClick={() => {
                        setIsGameStarted(false);
                        setShowControls(true);
                        setSelectedMatchId(null);
                        setCardCount(10);
                        setCards([]);
                        setPreviewCards([]);
                        setFlippedCards([]);
                        setMatchedCards([]);
                        setShowAnimation(false);
                        setHasStarted(false);
                        setTime(0);
                        setShowNameInput(false);
                    }}
                >
                    Reset
                </button>

                <div className="timer">⏱️ Time: {time.toFixed(1)} sec</div>
            </div>



            {showControls && (
                <div className="game-controls">
                    <label htmlFor="matchIdFilter">Select Game-Deck:</label>
                    <select
                        id="matchIdFilter"
                        value={selectedMatchId ?? ""}
                        onChange={(e) => setSelectedMatchId(Number(e.target.value))}
                    >
                        <option value="">Please choose a deck</option>
                        {activeMatchIds.sort((a, b) => a - b).map(matchId => (
                            <option key={matchId} value={matchId}>
                                {matchId}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="cardCount">Select Number of cards:</label>
                    <select
                        id="cardCount"
                        value={cardCount}
                        onChange={(e) => setCardCount(Number(e.target.value))}
                    >
                        <option value={10}>10 Cards</option>
                        <option value={20}>20 Cards</option>
                        <option value={32}>32 Cards</option>
                    </select>
                </div>
            )}

            {/* Anzeige der fehlenden Karten */}
            {selectedMatchId !== null && !isLoadingMemories && delayedMessage && (
                <div className="missing-cards-message">
                    {delayedMessage}
                </div>
            )}


            {/* Spielername Eingabefeld, wenn ein neuer Highscore erreicht wurde */}
            {isNewHighScore && showNameInput && (
                <div className="high-score-input">
                    <label htmlFor="playerName">Congratulations! You secured a spot on the high score list. Enter your name:</label>
                    <input
                        className="playerName"
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your name"
                    />
                    <button className="button-group-button" onClick={handleSaveHighScore}>
                        Save Highscore
                    </button>
                </div>
            )}


            {/* Vorschau der Karten, wenn das Spiel nicht gestartet oder beendet ist */}
            {selectedMatchId !== null && !isGameStarted && !hasGameEnded && (
                <div className="preview-board">
                    {previewCards.map(({ card, uniqueId }) => (
                        <PlayMemoryCard
                            key={uniqueId}
                            memory={card}
                            isFlipped={true}
                            isMatched={false}
                            onClick={() => {}}
                        />
                    ))}
                </div>
            )}

            {/* Spielfeld */}
            <div className="game-board" data-cards={cardCount}>
                {(isGameStarted || hasGameEnded) && cards.map(({ card, uniqueId }) => (
                    <PlayMemoryCard
                        key={uniqueId}
                        memory={card}
                        onClick={() => flipCard(uniqueId)}
                        isFlipped={flippedCards.includes(uniqueId)}
                        isMatched={matchedCards.includes(uniqueId)}
                    />
                ))}
            </div>

            {/* Win-Animation */}
            {showAnimation && (
                <div className="win-animation">
                    <p>You completed the memory game in {time.toFixed(1)} seconds!</p>
                </div>
            )}

            {/* Popup */}
            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Hinweis</h3>
                        <p>{popupMessage}</p>
                        <div className="popup-actions">
                            <button onClick={() => setShowPopup(false)} className="popup-confirm">
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>

    );

}
