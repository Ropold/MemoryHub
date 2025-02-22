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
    const [cardCount, setCardCount] = useState<number>(10); // Standard: 10 Karten
    const [isGameOver, setIsGameOver] = useState(false);

    // Deck vorbereiten (mit Duplikaten)
    useEffect(() => {
        if (!selectedMatchId) return;

        // Karten nach matchId filtern
        let filteredCards = props.activeMemories.filter(memory => memory.matchId === selectedMatchId);

        // Begrenzung auf die ausgewählte Kartenanzahl
        filteredCards = filteredCards.slice(0, cardCount / 2); // Weil jede Karte doppelt vorkommt

        // Duplikate erstellen mit **eindeutiger ID**
        let allCards = filteredCards.flatMap(memory => [
            { card: memory, uniqueId: memory.id + "-A" },
            { card: memory, uniqueId: memory.id + "-B" }
        ]);

        // Karten mischen
        allCards = allCards.sort(() => Math.random() - 0.5);

        setCards(allCards);
        setFlippedCards([]);
        setMatchedCards([]);
        setIsGameOver(false);
    }, [selectedMatchId, cardCount, props.activeMemories]);

    // Karte umdrehen
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

    // Spiel gewonnen?
    useEffect(() => {
        if (matchedCards.length === cards.length) {
            setIsGameOver(true);
        }
    }, [matchedCards, cards]);

    return (
        <div>
            <h2>Memory Game</h2>
            <div className="game-controls">
            {/* Auswahl für Match-ID */}
            <label htmlFor="matchIdFilter">Match-ID wählen:</label>
            <select id="matchIdFilter" value={selectedMatchId ?? ""} onChange={(e) => setSelectedMatchId(Number(e.target.value))}>
                <option value="">Bitte wählen</option>
                {[...new Set(props.activeMemories.map(m => m.matchId))].map(matchId => (
                    <option key={matchId} value={matchId}>{matchId}</option>
                ))}
            </select>

            {/* Auswahl für Kartenanzahl */}
            <label htmlFor="cardCount">Anzahl der Karten:</label>
            <select id="cardCount" value={cardCount} onChange={(e) => setCardCount(Number(e.target.value))}>
                <option value={10}>10 Karten</option>
                <option value={20}>20 Karten</option>
                <option value={30}>30 Karten</option>
            </select>
            </div>

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
        </div>
    );
}