import { useState } from 'react';

import MainPage from './components/MainPage';
import LearnPage from './components/LearnPage';
import GamePage from './components/GamePage';

function App ()
{
    // Page state management
    const [currentPage, setCurrentPage] = useState('main'); // 'main', 'learn', 'game'

    // Page navigation handlers
    const handlePlayClick = () => {
        setCurrentPage('game');
    };

    const handleLearnClick = () => {
        setCurrentPage('learn');
    };

    const handleBackToMain = () => {
        setCurrentPage('main');
    };

    // Render based on current page
    if (currentPage === 'main') {
        return <MainPage onPlayClick={handlePlayClick} onLearnClick={handleLearnClick} />;
    }

    if (currentPage === 'learn') {
        return <LearnPage onBackClick={handleBackToMain} />;
    }

    if (currentPage === 'game') {
        return <GamePage onBackClick={handleBackToMain} />;
    }

    // Default fallback
    return <MainPage onPlayClick={handlePlayClick} onLearnClick={handleLearnClick} />;
}

export default App
