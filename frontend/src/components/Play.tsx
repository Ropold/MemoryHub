import { useState, useEffect } from "react";
import { MemoryModel } from "./model/MemoryModel.ts";
import PlayMemoryCard from "./PlayMemoryCard.tsx";

type PlayProps = {
    activeMemories: MemoryModel[];
};

// Fisher-Yates-Shuffle-Funktion für wirklich zufälliges Mischen
const shuffleArray = <T,>(array: T[]): T[] => {
    let shuffled = [...array];
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


// Vorschau der Karten (neu laden, wenn MatchId oder Anzahl sich ändert)
    useEffect(() => {
        if (selectedMatchId !== null) {
            let filteredCards = props.activeMemories.filter(memory => memory.matchId === selectedMatchId);

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
    }, [selectedMatchId, cardCount, props.activeMemories]);



    // Win-Animation auslösen
    useEffect(() => {
        if (matchedCards.length === cards.length && hasStarted) {
            setShowAnimation(true);
            setTimeout(() => {
                setShowAnimation(false);
                setIsGameStarted(false);
            }, 2000);
        }
    }, [matchedCards, cards, hasStarted]);


    // Spielstart und Kartenmischen
    useEffect(() => {
        if (!isGameStarted || !selectedMatchId) return;

        setHasStarted(true);

        let filteredCards = props.activeMemories.filter(memory => memory.matchId === selectedMatchId);

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
    }, [selectedMatchId, cardCount, isGameStarted, props.activeMemories]);

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

    return (
        <div>
            <div className="space-between">
                <button
                    onClick={() => {
                        setIsGameStarted(true);
                        setShowControls(false);
                    }}
                    disabled={isGameStarted || selectedMatchId === null}
                    id={selectedMatchId ? "play-button-enabled" : "play-button-disabled"}
                >
                    Start Game
                </button>
                <button
                    onClick={() => setShowControls(prev => !prev)}
                    id={showControls ? "button-options-active" : undefined} // Setzt die ID basierend auf `showControls`
                    className={`button-group-button ${showControls ? "" : "some-other-class"}`} // Kombiniert beide Klassen
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

            {/* Vorschau nur anzeigen, wenn das Spiel nicht gestartet oder beendet ist */}
            <div className="preview-board">
                {selectedMatchId !== null && !isGameStarted && !hasGameEnded && previewCards.map(({ card, uniqueId }) => (
                    <PlayMemoryCard
                        key={uniqueId}
                        memory={card}
                        isFlipped={true}
                        isMatched={false}
                        onClick={() => {}}
                    />
                ))}
            </div>

            {/* Spielfeld bleibt am Ende stehen */}
            <div className="game-board">
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


            {showAnimation && (
                <div className="win-animation">
                    <h2>You Win!</h2>
                </div>
            )}
        </div>
    );
}
