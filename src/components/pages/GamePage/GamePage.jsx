import React, { useState, useEffect, useRef } from "react";
import "./GamePage.css";
import wordsData from "../../../data/words.json";
import translationService from "../../../services/translationService.js";

// Helper function to get wordlist from localStorage
const getWordlistFromStorage = () => {
    try {
        const stored = localStorage.getItem("dutchWordlist");
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Error reading wordlist from localStorage:", error);
        return [];
    }
};

const GamePage = ({ onBackClick, onReplayTutorial, isGameTutorialOpen }) => {
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [level, setLevel] = useState(1);
    const [showLevelUp, setShowLevelUp] = useState(false);

    const [currentDutchWord, setCurrentDutchWord] = useState("");
    const [currentEnglishWord, setCurrentEnglishWord] = useState("");
    const [shipWords, setShipWords] = useState([]);
    const [correctShipIndex, setCorrectShipIndex] = useState(0);
    const [destroyedShips, setDestroyedShips] = useState([]);
    const [redBullShips, setRedBullShips] = useState([]);
    const [cannonPosition, setCannonPosition] = useState(2);
    const [cannonballs, setCannonballs] = useState([]);
    const [canShoot, setCanShoot] = useState(true);
    const [correctHitInProgress, setCorrectHitInProgress] = useState(false);
    const [gameTime, setGameTime] = useState(0);
    const [shipsTop, setShipsTop] = useState(60);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [nextWordQueue, setNextWordQueue] = useState([]);
    const [gameMode, setGameMode] = useState("random"); // "random" or "wordlist"
    const gameModeRef = useRef("random"); // Keep a ref for reliable mode checking
    const [wordlistQueue, setWordlistQueue] = useState([]);
    const cannonballRefs = useRef({});
    const [hitShipIndex, setHitShipIndex] = useState(null);
    const [lastHitCorrect, setLastHitCorrect] = useState(null);
    const [lastHitWasRedBull, setLastHitWasRedBull] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [gameOverReason, setGameOverReason] = useState("");
    const [lifeLost, setLifeLost] = useState(false);
    const [showTutorialButton, setShowTutorialButton] = useState(true);
    const [tutorialButtonFading, setTutorialButtonFading] = useState(false);
    const [sinkingShips, setSinkingShips] = useState([]);
    const correctHitInProgressRef = useRef(false);
    const scoreRef = useRef(0);

    // Calculate current level based on score (every 5 points = 1 level)
    const calculateLevel = (currentScore) => {
        return Math.floor(currentScore / 5) + 1;
    };

    // Get ship image based on level
    const getShipImage = (currentLevel) => {
        if (currentLevel <= 6) {
            return `/assets/images/level${currentLevel}_ship.png`;
        }
        return `/assets/images/level6_ship.png`; // Max level ship for levels above 6
    };

    // Show level up notification
    const showLevelUpNotification = () => {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 2000); // Show for 2 seconds
    };

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

    // Function to load words into the queue (only for random mode)
    const loadWordsIntoQueue = async () => {
        // Skip API calls if in wordlist mode
        if (gameModeRef.current === "wordlist") {
            return;
        }

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
        scoreRef.current = 0;
        setLevel(1);
        setShowLevelUp(false);
        setLives(3);
        setGameTime(0);
        setDestroyedShips([]);
        setRedBullShips([]);
        setSinkingShips([]);
        setShipsTop(60);
        setCannonballs([]);
        setHitShipIndex(null);
        setLastHitCorrect(null);
        setLastHitWasRedBull(false);
        setLifeLost(false);
        setCorrectHitInProgress(false);
        correctHitInProgressRef.current = false;
        setCanShoot(true);
        setGameTime(0);

        // Maintain current game mode for restart
        if (gameModeRef.current === "wordlist") {
            // Reload wordlist queue for wordlist mode
            const wordlist = getWordlistFromStorage();
            if (wordlist.length > 0) {
                const shuffled = [...wordlist].sort(() => Math.random() - 0.5);
                setWordlistQueue(shuffled);
            }
        }

        setupNewWordChallenge(gameModeRef.current);
    };

    // Function to get next word pair based on game mode
    const getNextWordPair = async (forcedMode = null) => {
        const currentMode = forcedMode || gameModeRef.current;
        if (currentMode === "wordlist") {
            // Refresh wordlist queue if it's empty by reshuffling the original wordlist
            if (wordlistQueue.length === 0) {
                const wordlist = getWordlistFromStorage();
                if (wordlist.length === 0) {
                    // NEVER fallback to random mode - use fallback word instead
                    return { english: "sleep", dutch: "slaap" };
                }
                // Reshuffle and reload the wordlist instead of falling back
                const shuffled = [...wordlist].sort(() => Math.random() - 0.5);
                setWordlistQueue(shuffled);
                return shuffled[0];
            }

            const nextWord = wordlistQueue[0];
            setWordlistQueue((prev) => prev.slice(1));

            return nextWord;
        } else {
            return await getRandomWordPair();
        }
    };

    // Function to get random word pair (original logic)
    const getRandomWordPair = async () => {
        // Early return if in wordlist mode - should not be called
        if (gameModeRef.current === "wordlist") {
            return { english: "sleep", dutch: "slaap" };
        }

        // Only make API calls and load random words in random mode
        if (gameModeRef.current === "random" || !gameModeRef.current) {
            // If queue is running low, load more words
            if (nextWordQueue.length <= 2) {
                await loadWordsIntoQueue();
            }

            if (nextWordQueue.length > 0) {
                const wordPair = nextWordQueue[0];
                setNextWordQueue((prev) => prev.slice(1));
                return wordPair;
            } else {
                // Fallback - try harder to find valid words
                let attempts = 0;
                let foundWord = false;

                while (!foundWord && attempts < 3) {
                    const randomWords = getRandomWords(10);
                    const wordsWithTranslations =
                        await findWordsWithDutchTranslations(randomWords);
                    if (wordsWithTranslations.length > 0) {
                        return wordsWithTranslations[0];
                    }
                    attempts++;
                }

                // Final fallback
                return { english: "sleep", dutch: "slaap" };
            }
        } else {
            // In wordlist mode, this shouldn't be called, but provide fallback
            return { english: "sleep", dutch: "slaap" };
        }
    };

    // Function to setup a new word challenge
    const setupNewWordChallenge = async (forcedMode = null) => {
        setIsLoading(true);
        setError("");

        try {
            // Get word pair based on current game mode or forced mode
            const correctWordPair = await getNextWordPair(forcedMode);

            // Set the target Dutch word and correct English word
            setCurrentDutchWord(correctWordPair.dutch);
            setCurrentEnglishWord(correctWordPair.english);

            // Get random incorrect English words for other ships
            // Always use random words from JSON data for incorrect options (adds complexity)
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

            // Log Red Bull ships for testing
            if (newRedBullShips.length > 0) {
                console.log(
                    `Red Bull cars spawned at positions: ${newRedBullShips.join(", ")} (5x score bonus!)`,
                );
            }

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
        let correctHitOccurred = false;

        cannonballs.forEach((ball) => {
            if (correctHitOccurred) return; // Skip if correct hit already occurred

            const cannonballElement = cannonballRefs.current[ball.id];
            if (!cannonballElement) return;

            const ballRect = cannonballElement.getBoundingClientRect();

            // Check collision with each ship (only non-destroyed ones)
            for (let shipIndex = 0; shipIndex < shipWords.length; shipIndex++) {
                if (destroyedShips.includes(shipIndex)) continue; // Skip destroyed ships

                const word = shipWords[shipIndex];
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
                        // Check if this is a Red Bull ship for bonus scoring
                        const isRedBullShip = redBullShips.includes(shipIndex);
                        const scoreToAdd = isRedBullShip ? 5 : 1;

                        setScore((prevScore) => {
                            const newScore = prevScore + scoreToAdd;
                            const oldLevel = calculateLevel(prevScore);
                            const newLevel = calculateLevel(newScore);

                            // Check for level up
                            if (newLevel > oldLevel) {
                                setLevel(newLevel);
                                showLevelUpNotification();
                            }

                            // Also update the ref to keep it in sync
                            scoreRef.current = newScore;

                            return newScore;
                        });
                        setLastHitCorrect(true);
                        setLastHitWasRedBull(isRedBullShip);
                        console.log(
                            `Correct hit! "${word}" is the translation of "${currentDutchWord}"${isRedBullShip ? " (Red Bull car - 5 points!)" : ""}`,
                        );

                        // Clear ALL cannonballs immediately to prevent multiple hits
                        setCannonballs([]);
                        // Clear all cannonball refs
                        Object.keys(cannonballRefs.current).forEach((id) => {
                            delete cannonballRefs.current[id];
                        });

                        // Prevent shooting immediately and set flag
                        setCanShoot(false);
                        setCorrectHitInProgress(true);
                        correctHitInProgressRef.current = true;
                        console.log("correctHitInProgress set to TRUE");

                        // Trigger hit feedback and start sinking
                        setHitShipIndex(shipIndex);
                        setSinkingShips((prev) => [...prev, shipIndex]);

                        // Load new word challenge after brief pause
                        setTimeout(async () => {
                            if (!gameOver) {
                                setHitShipIndex(null);

                                // Force immediate ship reset BEFORE setupNewWordChallenge
                                setShipsTop(60);

                                await setupNewWordChallenge(
                                    gameModeRef.current,
                                );
                                setLastHitCorrect(null);
                                setLastHitWasRedBull(false);
                                setSinkingShips([]); // Clear sinking ships
                                setCanShoot(true); // Re-enable shooting when new challenge loads

                                // Wait for React to process the ship position update
                                setTimeout(() => {
                                    if (!gameOver) {
                                        // Double-check that ships are at safe position before disabling protection
                                        setShipsTop(60); // Force position again just to be sure

                                        // Wait one more frame for the position to be applied
                                        setTimeout(() => {
                                            if (!gameOver) {
                                                setCorrectHitInProgress(false);
                                                correctHitInProgressRef.current = false;
                                                console.log(
                                                    "correctHitInProgress set to FALSE after ships confirmed at safe position",
                                                );
                                            }
                                        }, 50);
                                    }
                                }, 50);
                            }
                        }, 1200);

                        correctHitOccurred = true;
                        return; // Exit collision checking immediately
                    } else {
                        setLastHitCorrect(false);
                        setLastHitWasRedBull(false);
                        console.log(
                            `Wrong hit! "${word}" is not the translation of "${currentDutchWord}"`,
                        );

                        // Destroy the wrong ship
                        setDestroyedShips((prev) => [...prev, shipIndex]);

                        // Lose a life for wrong hit
                        setLifeLost(true);
                        setTimeout(() => {
                            if (!gameOver) setLifeLost(false);
                        }, 1000);

                        setLives((prevLives) => {
                            const newLives = prevLives - 1;
                            if (newLives <= 0) {
                                // Game over - show game over screen
                                setGameOver(true);
                                setGameOverReason("No lives remaining!");
                                // Clear all cannonballs immediately
                                setCannonballs([]);
                                Object.keys(cannonballRefs.current).forEach(
                                    (id) => {
                                        delete cannonballRefs.current[id];
                                    },
                                );
                            }
                            return newLives;
                        });

                        setTimeout(() => {
                            if (!gameOver) {
                                setLastHitCorrect(null);
                                setLastHitWasRedBull(false);
                            }
                        }, 1000);

                        // Trigger hit feedback
                        setHitShipIndex(shipIndex);
                        setTimeout(() => {
                            if (!gameOver) setHitShipIndex(null);
                        }, 500);

                        // Remove the colliding cannonball
                        setCannonballs((prev) =>
                            prev.filter((b) => b.id !== ball.id),
                        );
                        delete cannonballRefs.current[ball.id];
                    }

                    break; // Exit ship checking loop for this cannonball
                }
            }
        });
    };

    // Handle cannon movement - only move to non-destroyed ships
    const moveCannon = (direction) => {
        if (correctHitInProgress || isLoading || gameOver) return;

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
        if (!canShoot || isLoading || correctHitInProgress || gameOver) return;

        const newCannonball = {
            id: Date.now(),
            cannonPos: cannonPosition,
            currentY: 120,
            targetShip: cannonPosition,
        };

        setCannonballs((prev) => [...prev, newCannonball]);

        setCanShoot(false);
        setTimeout(() => {
            if (!gameOver) setCanShoot(true);
        }, 300);

        setTimeout(() => {
            if (!gameOver) {
                setCannonballs((prev) =>
                    prev.filter((ball) => ball.id !== newCannonball.id),
                );
                delete cannonballRefs.current[newCannonball.id];
            }
        }, 1500);
    };

    // Keyboard event handler
    useEffect(() => {
        if (gameOver) return; // Don't handle keyboard events when game is over

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
    }, [
        canShoot,
        cannonPosition,
        isLoading,
        destroyedShips,
        correctHitInProgress,
        gameOver,
    ]);

    // Game timer effect
    useEffect(() => {
        if (gameOver || isGameTutorialOpen) return; // Don't run timer when game is over or tutorial is open

        const gameTimer = setInterval(() => {
            setGameTime((prevTime) => prevTime + 0.1);
        }, 100);

        return () => clearInterval(gameTimer);
    }, [gameOver, isGameTutorialOpen]);

    // Ship movement effect
    useEffect(() => {
        if (isLoading || gameOver || isGameTutorialOpen) return;

        const moveShips = () => {
            setShipsTop((prevTop) => {
                const baseSpeed = 0.5;
                // Moderate speed increase: every level increases speed by 0.3
                const currentLevel = calculateLevel(scoreRef.current);
                const speedIncrease = (currentLevel - 1) * 0.3;
                const currentSpeed = baseSpeed + speedIncrease;

                const bottomBoundary = window.innerHeight * 0.45;
                const newTop = prevTop + currentSpeed;

                if (newTop >= bottomBoundary) {
                    // Ships reached bottom - check if protection is active
                    console.log(
                        "Ships reached bottom. correctHitInProgress:",
                        correctHitInProgressRef.current,
                    );

                    if (!correctHitInProgressRef.current) {
                        setGameOver(true);
                        setGameOverReason("Ships reached the harbor!");
                        // Clear all cannonballs immediately
                        setCannonballs([]);
                        Object.keys(cannonballRefs.current).forEach((id) => {
                            delete cannonballRefs.current[id];
                        });
                    }
                    // Always return boundary position to prevent ships from going further
                    return bottomBoundary - 1;
                }

                return newTop;
            });
        };

        const movementInterval = setInterval(moveShips, 16);
        return () => clearInterval(movementInterval);
    }, [isLoading, gameOver, isGameTutorialOpen]);

    // Collision detection effect
    useEffect(() => {
        if (cannonballs.length === 0 || gameOver || isGameTutorialOpen) return;

        const collisionInterval = setInterval(() => {
            checkCollisions();
        }, 16);

        return () => clearInterval(collisionInterval);
    }, [
        cannonballs,
        shipWords,
        correctShipIndex,
        destroyedShips,
        gameOver,
        hitShipIndex,
        correctHitInProgress,
    ]);

    // Tutorial button timer effect - fade out after 3 seconds
    useEffect(() => {
        const fadeTimer = setTimeout(() => {
            setTutorialButtonFading(true);
        }, 3000);

        const hideTimer = setTimeout(() => {
            setShowTutorialButton(false);
        }, 4000);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    // Initialize game mode and setup
    useEffect(() => {
        const initializeGameMode = async () => {
            // Check for selected game mode
            const selectedMode = localStorage.getItem("selectedGameMode");

            // Only initialize if a mode was actually selected
            if (selectedMode) {
                // Clear the mode from storage first
                localStorage.removeItem("selectedGameMode");

                if (selectedMode === "wordlist") {
                    const wordlist = getWordlistFromStorage();
                    if (wordlist.length > 0) {
                        setGameMode("wordlist");
                        gameModeRef.current = "wordlist";
                        const shuffled = [...wordlist].sort(
                            () => Math.random() - 0.5,
                        );
                        setWordlistQueue(shuffled);
                        setIsLoading(false);
                        return;
                    }
                }

                // For random mode or fallback
                setGameMode("random");
                gameModeRef.current = "random";
                await loadWordsIntoQueue();
                setIsLoading(false);
            }
            // No mode selected yet - keep loading state true until mode is selected
        };

        initializeGameMode();
    }, []);

    // Setup initial word challenge after mode is set
    useEffect(() => {
        if (!isLoading && gameModeRef.current) {
            setupNewWordChallenge(gameModeRef.current);
        }
    }, [isLoading, gameMode]);

    // Handle game over cleanup
    useEffect(() => {
        if (gameOver) {
            // Clear all cannonballs immediately when game ends
            setCannonballs([]);
            Object.keys(cannonballRefs.current).forEach((id) => {
                delete cannonballRefs.current[id];
            });
            // Stop any ongoing actions
            setCanShoot(false);
            setCorrectHitInProgress(false);
            correctHitInProgressRef.current = false;
            setLastHitCorrect(null);
            setLastHitWasRedBull(false);
            setHitShipIndex(null);
            setLifeLost(false);
        }
    }, [gameOver]);

    // Auto-adjust cannon position when ships are destroyed
    useEffect(() => {
        if (gameOver) return; // Don't adjust cannon when game is over

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
    }, [destroyedShips, cannonPosition, shipWords, gameOver]);

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

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="game-page">
            <div className="game-background">
                {/* Replay tutorial button - only show for first few seconds */}
                {onReplayTutorial && showTutorialButton && (
                    <button
                        className={`replay-tutorial-button ${tutorialButtonFading ? "fade-out" : ""}`}
                        onClick={onReplayTutorial}
                        title="Replay Tutorial"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
                                fill="currentColor"
                            />
                        </svg>
                        Tutorial
                    </button>
                )}

                {/* Score and Lives Display */}
                <div className="game-ui">
                    <div className="score-display">
                        <span className="score-label">Score: </span>
                        <span className="score-value">{score}</span>
                        <span className="level-label"> | Level: </span>
                        <span className="level-value">{level}</span>
                        <span className="lives-label"> | Lives: </span>
                        <span
                            className={`lives-value ${lifeLost ? "life-lost-flash" : ""}`}
                        >
                            {"❤️".repeat(lives)}
                            {"🖤".repeat(Math.max(0, 3 - lives))}
                        </span>
                    </div>
                </div>

                {/* Pause indicator when tutorial is open */}
                {isGameTutorialOpen && (
                    <div className="pause-overlay">
                        <div className="pause-indicator">
                            <h2>Game Paused</h2>
                            <p>Tutorial in progress...</p>
                        </div>
                    </div>
                )}

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
                                <p>
                                    Time:{" "}
                                    <span className="final-time">
                                        {formatTime(gameTime)}
                                    </span>
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
                        className={`hit-feedback ${lastHitCorrect ? "correct" : "wrong"} ${lastHitWasRedBull ? "red-bull-bonus" : ""}`}
                    >
                        {lastHitCorrect
                            ? lastHitWasRedBull
                                ? "🏎️ Red Bull Bonus! +5 Points!"
                                : "✓ Correct!"
                            : "✗ Wrong!"}
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
                            onClick={() =>
                                setupNewWordChallenge(gameModeRef.current)
                            }
                            className="retry-button"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div
                        className="ships-container"
                        data-level={level}
                        style={{ top: `${shipsTop}px` }}
                    >
                        {shipWords.map((word, index) => (
                            <div
                                key={index}
                                className={`ship-card ${index === cannonPosition ? "highlighted" : ""} ${hitShipIndex === index ? "hit-flash" : ""} ${sinkingShips.includes(index) ? "sinking" : ""} ${destroyedShips.includes(index) ? "destroyed" : ""}`}
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
                                            : getShipImage(level)
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

                {/* Level Up Notification */}
                {showLevelUp && (
                    <div className="level-up-notification">
                        <div className="level-up-content">
                            <h2>Level {level}</h2>
                            <p>Ships move faster!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamePage;
