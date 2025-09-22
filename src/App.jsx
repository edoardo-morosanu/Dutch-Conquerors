import { useState, useEffect, useRef } from "react";

import MainPage from "./components/pages/MainPage/MainPage";
import LearnPage from "./components/pages/LearnPage/LearnPage";
import GamePage from "./components/pages/GamePage/GamePage";
import FirstPopup from "./components/ui/FirstPopup/FirstPopup";

function App() {
    // Page state management
    const [currentPage, setCurrentPage] = useState("main"); // 'main', 'learn', 'game'

    // Music state management
    const [isMuted, setIsMuted] = useState(() => {
        const saved = localStorage.getItem("musicMuted");
        return saved ? JSON.parse(saved) : false;
    });
    const [musicReady, setMusicReady] = useState(false);
    const [showFirstVisit, setShowFirstVisit] = useState(() => {
        const hasVisited = localStorage.getItem("hasVisitedBefore");
        return !hasVisited;
    });
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
        localStorage.setItem("hasVisitedBefore", "true");
    };

    // Volume control function
    const adjustVolume = (newVolume) => {
        setVolume(Math.max(0, Math.min(1, newVolume)));
    };

    // Page navigation handlers
    const handlePlayClick = () => {
        setCurrentPage("game");
    };

    const handleLearnClick = () => {
        setCurrentPage("learn");
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
                    {...musicProps}
                />
                <FirstPopup
                    isOpen={showFirstVisit}
                    onComplete={handleFirstVisitComplete}
                />
            </>
        );
    }

    if (currentPage === "learn") {
        return (
            <>
                <LearnPage onBackClick={handleBackToMain} />
            </>
        );
    }

    if (currentPage === "game") {
        return (
            <>
                <GamePage onBackClick={handleBackToMain} />
            </>
        );
    }

    // Default fallback
    return (
        <>
            <MainPage
                onPlayClick={handlePlayClick}
                onLearnClick={handleLearnClick}
                {...musicProps}
            />
            <FirstPopup
                isOpen={showFirstVisit}
                onComplete={handleFirstVisitComplete}
            />
        </>
    );
}

export default App;
