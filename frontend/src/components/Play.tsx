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
    const [showControls, setShowControls] = useState(true);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false); // Zustand für die Animation
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (matchedCards.length === cards.length && hasStarted) {
            setShowAnimation(true); // Animation starten, wenn das Spiel vorbei ist

            setTimeout(() => {
                setShowAnimation(false); // Animation nach 2 Sekunden ausblenden
            }, 2000);
        }
    }, [matchedCards, cards, hasStarted]);

    useEffect(() => {
        if (!isGameStarted || !selectedMatchId) return;

        setHasStarted(true);

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

            {showAnimation && (
                <div className="win-animation">
                    <h2>You Win!</h2>
                </div>
            )}
        </div>
    );
}
