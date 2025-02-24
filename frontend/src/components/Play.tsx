import { useState, useEffect } from "react";
import { MemoryModel } from "./model/MemoryModel.ts";
import PlayMemoryCard from "./PlayMemoryCard.tsx";

type PlayProps = {
    activeMemories: MemoryModel[];
};

export default function Play(props: Readonly<PlayProps>) {
    const [cards, setCards] = useState<{ card: MemoryModel; uniqueId: string }[]>([]);
    const [flippedCards, setFlippedCards] = useState<string[]>([]);
    const [matchedCards, setMatchedCards] = useState<string[]>([]);
    const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
    const [cardCount, setCardCount] = useState<number>(10);
    const [isGameOver, setIsGameOver] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [hasStarted, setHasStarted] = useState(false); // Zustand für Spielstart

    useEffect(() => {
        if (matchedCards.length === cards.length && hasStarted) {
            setIsGameOver(true);
            setShowPopup(true); // Zeigt das Popup nur wenn das Spiel gestartet wurde
        }
    }, [matchedCards, cards, hasStarted]);

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    useEffect(() => {
        if (!isGameStarted || !selectedMatchId) return;

        setHasStarted(true); // Spiel wurde gestartet

        let filteredCards = props.activeMemories.filter(memory => memory.matchId === selectedMatchId);
        filteredCards = filteredCards.slice(0, cardCount / 2);

        let allCards = filteredCards.flatMap(memory => [
            { card: memory, uniqueId: memory.id + "-A" },
            { card: memory, uniqueId: memory.id + "-B" }
        ]);

        allCards = allCards.sort(() => Math.random() - 0.5);

        setCards(allCards);
        setFlippedCards([]);
        setMatchedCards([]);
        setIsGameOver(false);
    }, [selectedMatchId, cardCount, isGameStarted, props.activeMemories]);

    const flipCard = (uniqueId: string) => {
        if (flippedCards.length === 2 || flippedCards.includes(uniqueId)) {
            return;
        }

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

    return (
        <div>
            <div className="button-group">
                <button
                    onClick={() => {
                        setIsGameStarted(true);
                        setShowControls(false);
                    }}
                    disabled={isGameStarted || selectedMatchId === null}
                    id={selectedMatchId ? "play-button-enabled" : "play-button-disabled"}
                >
                    Play
                </button>
                <button onClick={() => setShowControls(prev => !prev)} id={showControls ? "button-options-active" : "button-options"}>
                    {showControls ? "Hide Options" : "Options"}
                </button>
                <button
                    onClick={() => {
                        setIsGameStarted(false);
                        setShowControls(true);
                        setSelectedMatchId(null);
                        setCardCount(10);
                        setCards([]);
                        setFlippedCards([]);
                        setMatchedCards([]);
                        setIsGameOver(false);
                        setHasStarted(false); // Spiel zurücksetzen
                    }}
                >
                    Reset
                </button>
            </div>

            {showControls && (
                <div className="game-controls">
                    <label htmlFor="matchIdFilter">Match-ID wählen:</label>
                    <select id="matchIdFilter" value={selectedMatchId ?? ""} onChange={(e) => setSelectedMatchId(Number(e.target.value))}>
                        <option value="">Bitte wählen</option>
                        {[...new Set(props.activeMemories.map(m => m.matchId))].map(matchId => (
                            <option key={matchId} value={matchId}>{matchId}</option>
                        ))}
                    </select>

                    <label htmlFor="cardCount">Anzahl der Karten:</label>
                    <select id="cardCount" value={cardCount} onChange={(e) => setCardCount(Number(e.target.value))}>
                        <option value={10}>10 Karten</option>
                        <option value={20}>20 Karten</option>
                        <option value={30}>30 Karten</option>
                    </select>
                </div>
            )}

            <div className="game-board">
                {cards.map(({ card, uniqueId }) => (
                    <PlayMemoryCard
                        key={uniqueId}
                        memory={card}
                        onClick={() => flipCard(uniqueId)}
                        isFlipped={flippedCards.includes(uniqueId)}
                        isMatched={matchedCards.includes(uniqueId)}
                    />
                ))}
            </div>

            {isGameOver && <h3>Game Over! You Win!</h3>}

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Congratulations!</h3>
                        <p>You have won the game!</p>
                        <div className="popup-actions">
                            <button className="popup-cancel" onClick={handleClosePopup}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
