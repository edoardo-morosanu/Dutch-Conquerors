import { useState } from 'react';

import MainPage from './components/MainPage';
import LearnPage from './components/LearnPage';

function App ()
{
    // Page state management
    const [currentPage, setCurrentPage] = useState('main'); // 'main', 'learn'

    // Page navigation handlers
    const handlePlayClick = () => {
        // For now, just show an alert that the game is coming soon
        alert('Game functionality is being rebuilt without Phaser!');
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

    // Default fallback
    return <MainPage onPlayClick={handlePlayClick} onLearnClick={handleLearnClick} />;
}

export default App
