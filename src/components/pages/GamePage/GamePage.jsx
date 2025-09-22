import React, { useState, useEffect, useRef } from "react";
import "./GamePage.css";
import wordsData from "../../../data/words.json";
import translationService from "../../../services/translationService.js";

const GamePage = ({ onBackClick }) => {
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);

    const [currentDutchWord, setCurrentDutchWord] = useState("");
    const [currentEnglishWord, setCurrentEnglishWord] = useState("");
    const [shipWords, setShipWords] = useState([]);
    const [correctShipIndex, setCorrectShipIndex] = useState(0);
    const [destroyedShips, setDestroyedShips] = useState([]);
    const [redBullShips, setRedBullShips] = useState([]);
    const [cannonPosition, setCannonPosition] = useState(2);
    const [cannonballs, setCannonballs] = useState([]);
    const [canShoot, setCanShoot] = useState(true);
    const [gameTime, setGameTime] = useState(0);
    const [shipsTop, setShipsTop] = useState(60);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [nextWordQueue, setNextWordQueue] = useState([]);
    const cannonballRefs = useRef({});
    const [hitShipIndex, setHitShipIndex] = useState(null);
    const [lastHitCorrect, setLastHitCorrect] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [gameOverReason, setGameOverReason] = useState("");
    const [lifeLost, setLifeLost] = useState(false);

    // Function to get multiple random English words from local JSON data
    const getRandomWords = (count = 10) => {
        const wordsCopy = [...wordsData];

        // Fisher-Yates shuffle
        for (let i = wordsCopy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [wordsCopy[i], wordsCopy[j]] = [wordsCopy[j], wordsCopy[i]];
        }

        return wordsCopy.slice(0, count);
    };

    // Function to fetch Dutch translation using translation service with fallback
    const fetchDutchTranslation = async (word) => {
        return await translationService.translate(word, "EN", "NL");
    };

    // Function to process words and find ones with Dutch translations
    const findWordsWithDutchTranslations = async (words) => {
        const promises = words.map(async (word) => {
            const dutchTranslation = await fetchDutchTranslation(word);
            // Filter out words that don't translate or are the same in both languages
            if (
                !dutchTranslation ||
                dutchTranslation.toLowerCase().trim() ===
                    word.toLowerCase().trim()
            ) {
                return null;
            }
            return { english: word, dutch: dutchTranslation };
        });

        const results = await Promise.all(promises);
        return results.filter((result) => result !== null);
    };

    // Function to load words into the queue
    const loadWordsIntoQueue = async () => {
        try {
            let attempts = 0;
            let totalValidWords = 0;

            // Keep trying until we get at least 5 valid words or max 3 attempts
            while (totalValidWords < 5 && attempts < 3) {
                const randomWords = getRandomWords(20); // Increased to account for filtering
                const wordsWithTranslations =
                    await findWordsWithDutchTranslations(randomWords);

                if (wordsWithTranslations.length > 0) {
                    setNextWordQueue((prev) => [
                        ...prev,
                        ...wordsWithTranslations,
                    ]);
                    totalValidWords += wordsWithTranslations.length;
                }
                attempts++;
            }
        } catch (error) {
            console.error("Error loading words into queue:", error);
        }
    };

    // Function to restart the game completely
    const restartGame = () => {
        setGameOver(false);
        setGameOverReason("");
        setScore(0);
        setLives(3);
        setDestroyedShips([]);
        setRedBullShips([]);
        setShipsTop(60);
        setCannonballs([]);
        setHitShipIndex(null);
        setLastHitCorrect(null);
        setLifeLost(false);
        setupNewWordChallenge();
    };

    // Function to setup a new word challenge
    const setupNewWordChallenge = async () => {
        setIsLoading(true);
        setError("");

        try {
            // If queue is running low, load more words
            if (nextWordQueue.length <= 2) {
                await loadWordsIntoQueue();
            }

            let correctWordPair;
            if (nextWordQueue.length > 0) {
                correctWordPair = nextWordQueue[0];
                setNextWordQueue((prev) => prev.slice(1));
            } else {
                // Fallback - try harder to find valid words
                let attempts = 0;
                let foundWord = false;

                while (!foundWord && attempts < 3) {
                    const randomWords = getRandomWords(10);
                    const wordsWithTranslations =
                        await findWordsWithDutchTranslations(randomWords);
                    if (wordsWithTranslations.length > 0) {
                        correctWordPair = wordsWithTranslations[0];
                        foundWord = true;
                    }
                    attempts++;
                }

                if (!foundWord) {
                    correctWordPair = { english: "sleep", dutch: "slaap" };
                }
            }

            // Set the target Dutch word and correct English word
            setCurrentDutchWord(correctWordPair.dutch);
            setCurrentEnglishWord(correctWordPair.english);

            // Get random incorrect English words for other ships
            const incorrectWords = getRandomWords(20)
                .filter(
                    (word) =>
                        word.toLowerCase() !==
                        correctWordPair.english.toLowerCase(),
                )
                .slice(0, 4);

            // Create ship words array with one correct and 4 incorrect
            const newShipWords = [...incorrectWords];
            const randomCorrectIndex = Math.floor(Math.random() * 5);
            newShipWords.splice(randomCorrectIndex, 0, correctWordPair.english);

            setShipWords(newShipWords.slice(0, 5));
            setCorrectShipIndex(randomCorrectIndex);
            setDestroyedShips([]);

            // Determine which ships should be Red Bull cars (3.3% chance each, ~15% per round)
            const newRedBullShips = [];
            for (let i = 0; i < 5; i++) {
                if (Math.random() < 0.033) {
                    // 3.3% chance per ship = ~15% chance per round
                    newRedBullShips.push(i);
                }
            }
            setRedBullShips(newRedBullShips);

            // Reset ships position
            setShipsTop(60);
        } catch (error) {
            console.error("Error setting up word challenge:", error);
            setError("Failed to load words. Please try again.");
            // Fallback
            setCurrentDutchWord("slaap");
            setCurrentEnglishWord("sleep");
            setShipWords(["sleep", "house", "water", "fire", "tree"]);
            setCorrectShipIndex(0);
            setDestroyedShips([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Collision detection function
    const checkCollisions = () => {
        cannonballs.forEach((ball) => {
            const cannonballElement = cannonballRefs.current[ball.id];
            if (!cannonballElement) return;

            const ballRect = cannonballElement.getBoundingClientRect();

            // Check collision with each ship (only non-destroyed ones)
            shipWords.forEach((word, shipIndex) => {
                if (destroyedShips.includes(shipIndex)) return; // Skip destroyed ships

                const shipWidth = 250;
                const shipHeight = 150;
                const shipGap = 40;
                const totalShips = shipWords.length;

                // Calculate ship position based on original index (maintains spacing)
                const centerOffset =
                    (shipIndex - Math.floor(totalShips / 2)) *
                    (shipWidth + shipGap);
                const shipLeft =
                    window.innerWidth / 2 + centerOffset - shipWidth / 2;
                const shipRight = shipLeft + shipWidth;
                const shipTop = shipsTop;
                const shipBottom = shipsTop + shipHeight;

                const isColliding =
                    ballRect.left < shipRight &&
                    ballRect.right > shipLeft &&
                    ballRect.top < shipBottom &&
                    ballRect.bottom > shipTop;

                if (isColliding) {
                    // Check if it's the correct ship
                    const isCorrectHit = shipIndex === correctShipIndex;

                    if (isCorrectHit) {
                        setScore((prevScore) => prevScore + 1);
                        setLastHitCorrect(true);
                        console.log(
                            `Correct hit! "${word}" is the translation of "${currentDutchWord}"`,
                        );

                        // Load new word challenge after correct hit
                        setTimeout(() => {
                            setupNewWordChallenge();
                            setLastHitCorrect(null);
                        }, 1000);
                    } else {
                        setLastHitCorrect(false);
                        console.log(
                            `Wrong hit! "${word}" is not the translation of "${currentDutchWord}"`,
                        );

                        // Destroy the wrong ship
                        setDestroyedShips((prev) => [...prev, shipIndex]);

                        // Lose a life for wrong hit
                        setLifeLost(true);
                        setTimeout(() => setLifeLost(false), 1000);

                        setLives((prevLives) => {
                            const newLives = prevLives - 1;
                            if (newLives <= 0) {
                                // Game over - show game over screen
                                setGameOver(true);
                                setGameOverReason("No lives remaining!");
                            }
                            return newLives;
                        });

                        setTimeout(() => {
                            setLastHitCorrect(null);
                        }, 1000);
                    }

                    // Trigger hit feedback
                    setHitShipIndex(shipIndex);
                    setTimeout(() => setHitShipIndex(null), 500);

                    // Remove the colliding cannonball
                    setCannonballs((prev) =>
                        prev.filter((b) => b.id !== ball.id),
                    );
                    delete cannonballRefs.current[ball.id];
                }
            });
        });
    };

    // Handle cannon movement - only move to non-destroyed ships
    const moveCannon = (direction) => {
        setCannonPosition((prevPosition) => {
            let newPosition = prevPosition;

            if (direction === "left") {
                // Move left to the next non-destroyed ship
                for (let i = prevPosition - 1; i >= 0; i--) {
                    if (!destroyedShips.includes(i)) {
                        newPosition = i;
                        break;
                    }
                }
            } else if (direction === "right") {
                // Move right to the next non-destroyed ship
                for (let i = prevPosition + 1; i < shipWords.length; i++) {
                    if (!destroyedShips.includes(i)) {
                        newPosition = i;
                        break;
                    }
                }
            }

            return newPosition;
        });
    };

    // Handle cannonball shooting
    const shootCannonball = () => {
        if (!canShoot || isLoading) return;

        const newCannonball = {
            id: Date.now(),
            cannonPos: cannonPosition,
            currentY: 120,
            targetShip: cannonPosition,
        };

        setCannonballs((prev) => [...prev, newCannonball]);

        setCanShoot(false);
        setTimeout(() => {
            setCanShoot(true);
        }, 300);

        setTimeout(() => {
            setCannonballs((prev) =>
                prev.filter((ball) => ball.id !== newCannonball.id),
            );
            delete cannonballRefs.current[newCannonball.id];
        }, 1500);
    };

    // Keyboard event handler
    useEffect(() => {
        const handleKeyPress = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                case "a":
                case "A":
                    event.preventDefault();
                    moveCannon("left");
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    event.preventDefault();
                    moveCannon("right");
                    break;
                case " ":
                    event.preventDefault();
                    shootCannonball();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [canShoot, cannonPosition, isLoading, destroyedShips]);

    // Game timer effect
    useEffect(() => {
        const gameTimer = setInterval(() => {
            setGameTime((prevTime) => prevTime + 0.1);
        }, 100);

        return () => clearInterval(gameTimer);
    }, [gameTime]);

    // Ship movement effect
    useEffect(() => {
        if (isLoading) return;

        const moveShips = () => {
            setShipsTop((prevTop) => {
                const baseSpeed = 0.5;
                const speedIncrease = Math.floor(score / 50) * 0.2;
                const maxSpeedIncrease = 2.0;
                const currentSpeed =
                    baseSpeed + Math.min(speedIncrease, maxSpeedIncrease);

                const bottomBoundary = window.innerHeight * 0.45;
                const newTop = prevTop + currentSpeed;

                if (newTop >= bottomBoundary) {
                    // Ships reached bottom - instant game over regardless of lives
                    setGameOver(true);
                    setGameOverReason("Ships reached the harbor!");
                    return newTop; // Keep ships at bottom position
                }

                return newTop;
            });
        };

        const movementInterval = setInterval(moveShips, 16);
        return () => clearInterval(movementInterval);
    }, [score, isLoading]);

    // Collision detection effect
    useEffect(() => {
        if (cannonballs.length === 0) return;

        const collisionInterval = setInterval(() => {
            checkCollisions();
        }, 16);

        return () => clearInterval(collisionInterval);
    }, [
        cannonballs,
        shipsTop,
        correctShipIndex,
        currentDutchWord,
        shipWords,
        destroyedShips,
    ]);

    // Initialize game
    useEffect(() => {
        const initializeGame = async () => {
            await loadWordsIntoQueue();
            await setupNewWordChallenge();
        };

        initializeGame();
    }, []);

    // Auto-adjust cannon position when ships are destroyed
    useEffect(() => {
        if (destroyedShips.includes(cannonPosition)) {
            // Current position ship is destroyed, find nearest non-destroyed ship
            let nearestIndex = -1;
            let minDistance = Infinity;

            shipWords.forEach((_, index) => {
                if (!destroyedShips.includes(index)) {
                    const distance = Math.abs(index - cannonPosition);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestIndex = index;
                    }
                }
            });

            if (nearestIndex !== -1) {
                setCannonPosition(nearestIndex);
            }
        }
    }, [destroyedShips, cannonPosition, shipWords]);

    // Calculate cannon position
    const calculateCannonLeft = () => {
        const shipWidth = 250;
        const shipGap = 40;
        const totalShips = shipWords.length;

        // Calculate position based on original ship index
        const centerOffset =
            (cannonPosition - Math.floor(totalShips / 2)) *
            (shipWidth + shipGap);
        return `calc(50% + ${centerOffset}px)`;
    };

    const calculatePositionForIndex = (index) => {
        const shipWidth = 250;
        const shipGap = 40;
        const totalShips = shipWords.length;
        const centerOffset =
            (index - Math.floor(totalShips / 2)) * (shipWidth + shipGap);
        return `calc(50% + ${centerOffset}px)`;
    };

    return (
        <div className="game-page">
            <div className="game-background">
                {/* Score and Lives Display */}
                <div className="score-display">
                    <div>
                        <span className="score-label">Score:</span>{" "}
                        <span className="score-value">{score}</span>
                    </div>
                    <div style={{ marginLeft: "20px" }}>
                        <span className="score-label">Lives:</span>{" "}
                        <span
                            className={`score-value ${lifeLost ? "life-lost-flash" : ""}`}
                        >
                            {"❤️".repeat(lives)}
                            {"🖤".repeat(Math.max(0, 3 - lives))}
                        </span>
                    </div>
                </div>

                {/* Game Over Screen */}
                {gameOver && (
                    <div className="game-over-overlay">
                        <div className="game-over-message">
                            <h1>Game Over!</h1>
                            <p className="game-over-reason">{gameOverReason}</p>
                            <div className="game-over-stats">
                                <p>
                                    Final Score:{" "}
                                    <span className="final-score">{score}</span>
                                </p>
                            </div>
                            <div className="game-over-buttons">
                                <button
                                    className="restart-button"
                                    onClick={restartGame}
                                >
                                    Play Again
                                </button>
                                <button
                                    className="menu-button"
                                    onClick={onBackClick}
                                >
                                    Back to Menu
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hit Feedback */}
                {lastHitCorrect !== null && (
                    <div
                        className={`hit-feedback ${lastHitCorrect ? "correct" : "wrong"}`}
                    >
                        {lastHitCorrect ? "✓ Correct!" : "✗ Wrong!"}
                    </div>
                )}

                {/* Ships Container */}
                {isLoading ? (
                    <div className="loading-display">
                        <div className="loading-text">Loading new words...</div>
                    </div>
                ) : error ? (
                    <div className="error-display">
                        <div className="error-text">{error}</div>
                        <button
                            onClick={setupNewWordChallenge}
                            className="retry-button"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div
                        className="ships-container"
                        style={{ top: `${shipsTop}px` }}
                    >
                        {shipWords.map((word, index) => (
                            <div
                                key={index}
                                className={`ship-card ${index === cannonPosition ? "highlighted" : ""} ${hitShipIndex === index ? "hit-flash" : ""} ${destroyedShips.includes(index) ? "destroyed" : ""}`}
                                style={{
                                    visibility: destroyedShips.includes(index)
                                        ? "hidden"
                                        : "visible",
                                }}
                            >
                                <img
                                    src={
                                        redBullShips.includes(index)
                                            ? "/assets/images/red_bull_car.png"
                                            : "/assets/images/ship.png"
                                    }
                                    alt={
                                        redBullShips.includes(index)
                                            ? "Red Bull Racing Car"
                                            : "Ship"
                                    }
                                    className="ship-image"
                                />
                                <div className="word-label">{word}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Current Dutch Word Display */}
                <div className="current-word-display">
                    <div className="word-language">🇳🇱 Dutch</div>
                    <div className="word-text">{currentDutchWord}</div>
                    <div className="word-instruction">
                        Find the English translation!
                    </div>
                </div>

                {/* Cannon */}
                <div
                    className="cannon-container"
                    style={{ left: calculateCannonLeft() }}
                >
                    <img
                        src="/assets/images/cannon.png"
                        alt="Cannon"
                        className="cannon"
                    />
                </div>

                {/* Cannonballs */}
                {cannonballs.map((ball) => (
                    <div
                        key={ball.id}
                        ref={(el) => (cannonballRefs.current[ball.id] = el)}
                        className="cannonball"
                        style={{
                            left: calculatePositionForIndex(ball.cannonPos),
                        }}
                    >
                        <img
                            src="/assets/images/cannonball.png"
                            alt="Cannonball"
                        />
                    </div>
                ))}

                {/* Back Button */}
                <button className="back-button" onClick={onBackClick}>
                    ← Back to Menu
                </button>
            </div>
        </div>
    );
};

export default GamePage;
