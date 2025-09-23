import { useState, useEffect, useRef } from "react";

import MainPage from "./components/pages/MainPage/MainPage";
import LearnPage from "./components/pages/LearnPage/LearnPage";
import GamePage from "./components/pages/GamePage/GamePage";
import FirstPopup from "./components/ui/FirstPopup/FirstPopup";
import LearnTutorial from "./components/ui/LearnTutorial/LearnTutorial";
import GameTutorial from "./components/ui/GameTutorial/GameTutorial";
import GameModePopup from "./components/ui/GameModePopup/GameModePopup";

function App() {
    // Page state management
    const [currentPage, setCurrentPage] = useState("main"); // 'main', 'learn', 'game'

    // Music state management
    const [isMuted, setIsMuted] = useState(() => {
        const saved = localStorage.getItem("musicMuted");
        return saved ? JSON.parse(saved) : true;
    });
    const [musicReady, setMusicReady] = useState(false);
    const [showFirstVisit, setShowFirstVisit] = useState(() => {
        const hasVisited = localStorage.getItem("hasVisitedApp");
        return !hasVisited;
    });
    const [showLearnTutorial, setShowLearnTutorial] = useState(false);
    const [showGameTutorial, setShowGameTutorial] = useState(false);
    const [showGameModePopup, setShowGameModePopup] = useState(false);
    const [showMainTutorial, setShowMainTutorial] = useState(false);
    const [volume, setVolume] = useState(() => {
        const saved = localStorage.getItem("musicVolume");
        return saved ? parseFloat(saved) : 0.3;
    });

    const audioRef = useRef(null);

    // Initialize audio and handle mute state
    useEffect(() => {
        // Create audio element
        audioRef.current = new Audio("/assets/music/background_music.mp3");
        audioRef.current.loop = true;
        audioRef.current.volume = volume;

        // Apply initial mute state and start playing
        audioRef.current.muted = isMuted;

        // Start playing music immediately
        const playMusic = async () => {
            try {
                if (!isMuted) {
                    await audioRef.current.play();
                }
                setMusicReady(true);
            } catch (error) {
                console.log("Music play failed:", error);
                setMusicReady(true);
            }
        };

        playMusic();

        // Cleanup
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Handle mute toggle
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted;

            // If unmuting and music isn't playing, try to start it (only if user has interacted)
            if (!isMuted && audioRef.current.paused && musicReady) {
                audioRef.current.play().catch(console.log);
            }
        }

        // Save mute state to localStorage
        localStorage.setItem("musicMuted", JSON.stringify(isMuted));
    }, [isMuted, musicReady]);

    // Handle volume changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
        // Save volume to localStorage
        localStorage.setItem("musicVolume", volume.toString());
    }, [volume]);

    // Toggle mute function
    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    // Handle first visit completion
    const handleFirstVisitComplete = () => {
        setShowFirstVisit(false);
        localStorage.setItem("hasVisitedApp", "true");
    };

    // Handle learn tutorial completion
    const handleLearnTutorialComplete = () => {
        setShowLearnTutorial(false);
        localStorage.setItem("hasVisitedLearnPage", "true");
    };

    // Handle learn tutorial replay
    const handleReplayLearnTutorial = () => {
        setShowLearnTutorial(true);
    };

    // Handle game tutorial replay
    const handleReplayGameTutorial = () => {
        setShowGameTutorial(true);
    };

    const handleGameTutorialComplete = () => {
        setShowGameTutorial(false);
        localStorage.setItem("hasVisitedGamePage", "true");
    };

    // Handle main tutorial replay
    const handleReplayMainTutorial = () => {
        setShowMainTutorial(true);
    };

    const handleMainTutorialComplete = () => {
        setShowMainTutorial(false);
    };

    // Volume control function
    const adjustVolume = (newVolume) => {
        setVolume(Math.max(0, Math.min(1, newVolume)));
    };

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

    // Page navigation handlers
    const handlePlayClick = () => {
        const wordlist = getWordlistFromStorage();
        if (wordlist.length > 0) {
            setShowGameModePopup(true);
        } else {
            setCurrentPage("game");
        }
    };

    const handleGameModeSelect = (mode) => {
        setShowGameModePopup(false);
        // Store the selected mode for the game to use
        localStorage.setItem("selectedGameMode", mode);
        setCurrentPage("game");

        // Check if user should see the game tutorial when they visit game page
        const hasVisitedGame = localStorage.getItem("hasVisitedGamePage");
        if (!hasVisitedGame) {
            // Delay tutorial to ensure game content is loaded
            setTimeout(() => {
                setShowGameTutorial(true);
            }, 1000);
        }
    };

    const handleGameModeClose = () => {
        setShowGameModePopup(false);
    };

    const handleLearnClick = () => {
        setCurrentPage("learn");
        // Check if user should see the tutorial when they visit learn page
        const hasVisitedLearn = localStorage.getItem("hasVisitedLearnPage");
        if (!hasVisitedLearn) {
            // Delay tutorial to ensure flashcard content is loaded
            setTimeout(() => {
                setShowLearnTutorial(true);
            }, 1000);
        }
    };

    const handleBackToMain = () => {
        setCurrentPage("main");
    };

    // Pass music props to pages
    const musicProps = {
        isMuted,
        musicReady,
        toggleMute,
    };

    // Render based on current page
    if (currentPage === "main") {
        return (
            <>
                <MainPage
                    onPlayClick={handlePlayClick}
                    onLearnClick={handleLearnClick}
                    onReplayTutorial={handleReplayMainTutorial}
                    {...musicProps}
                />
                <FirstPopup
                    isOpen={showFirstVisit}
                    onComplete={handleFirstVisitComplete}
                />
                <FirstPopup
                    isOpen={showMainTutorial}
                    onComplete={handleMainTutorialComplete}
                />
                <GameModePopup
                    isOpen={showGameModePopup}
                    onModeSelect={handleGameModeSelect}
                    onClose={handleGameModeClose}
                    wordlistCount={getWordlistFromStorage().length}
                />
            </>
        );
    }

    if (currentPage === "learn") {
        return (
            <>
                <LearnPage
                    onBackClick={handleBackToMain}
                    onReplayTutorial={handleReplayLearnTutorial}
                    isTutorialOpen={showLearnTutorial}
                />
                <LearnTutorial
                    isOpen={showLearnTutorial}
                    onComplete={handleLearnTutorialComplete}
                />
            </>
        );
    }

    if (currentPage === "game") {
        return (
            <>
                <GamePage
                    onBackClick={handleBackToMain}
                    onReplayTutorial={handleReplayGameTutorial}
                    isGameTutorialOpen={showGameTutorial}
                />
                <GameTutorial
                    isOpen={showGameTutorial}
                    onComplete={handleGameTutorialComplete}
                />
                <GameModePopup
                    isOpen={showGameModePopup}
                    onModeSelect={handleGameModeSelect}
                    onClose={handleGameModeClose}
                    wordlistCount={getWordlistFromStorage().length}
                />
            </>
        );
    }

    // Default fallback
    return (
        <>
            <MainPage
                onPlayClick={handlePlayClick}
                onLearnClick={handleLearnClick}
                onReplayTutorial={handleReplayMainTutorial}
                {...musicProps}
            />
            <FirstPopup
                isOpen={showFirstVisit}
                onComplete={handleFirstVisitComplete}
            />
            <FirstPopup
                isOpen={showMainTutorial}
                onComplete={handleMainTutorialComplete}
            />
        </>
    );
}

export default App;
