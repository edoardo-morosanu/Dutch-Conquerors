import React, { useState, useEffect } from 'react';
import './GamePage.css';

const GamePage = ({ onBackClick }) => {
    const [score, setScore] = useState(0);
    const [currentWord, setCurrentWord] = useState('democrate');
    const [cannonPosition, setCannonPosition] = useState(2); // Start at middle ship (index 2)
    const [cannonballs, setCannonballs] = useState([]); // Track active cannonballs
    const [canShoot, setCanShoot] = useState(true); // Shooting cooldown
    
    // Sample Dutch words for the ships
    const shipWords = ['hallo', 'slaap', 'democrate', 'goedenavond', 'dag'];

    // Handle cannon movement
    const moveCannon = (direction) => {
        setCannonPosition(prevPosition => {
            if (direction === 'left' && prevPosition > 0) {
                return prevPosition - 1;
            } else if (direction === 'right' && prevPosition < shipWords.length - 1) {
                return prevPosition + 1;
            }
            return prevPosition;
        });
    };

    // Handle cannonball shooting
    const shootCannonball = () => {
        if (!canShoot) return; // Prevent shooting during cooldown
        
        const newCannonball = {
            id: Date.now(),
            cannonPos: cannonPosition, // Store cannon position for this ball
            currentY: 120, // Starting from above cannon position
            targetShip: cannonPosition
        };
        
        setCannonballs(prev => [...prev, newCannonball]);
        
        // Set cooldown
        setCanShoot(false);
        setTimeout(() => {
            setCanShoot(true);
        }, 300); // 300ms cooldown
        
        // Remove cannonball after animation completes (1.5 seconds)
        setTimeout(() => {
            setCannonballs(prev => prev.filter(ball => ball.id !== newCannonball.id));
        }, 1500);
    };

    // Keyboard event handler
    useEffect(() => {
        const handleKeyPress = (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    event.preventDefault();
                    moveCannon('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    event.preventDefault();
                    moveCannon('right');
                    break;
                case ' ': // Space key
                    event.preventDefault(); // Prevent page scroll
                    shootCannonball();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        
        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [canShoot, cannonPosition]); // Add dependencies

    // Calculate cannon position based on ship index
    const calculateCannonLeft = () => {
        // Ship container is centered, each ship is 250px wide with 40px gap
        const shipWidth = 250;
        const shipGap = 40;
        const totalShips = shipWords.length;
        
        // Calculate total width of ships container
        const totalWidth = (shipWidth * totalShips) + (shipGap * (totalShips - 1));
        
        // Calculate offset from center for current ship
        const centerOffset = (cannonPosition - Math.floor(totalShips / 2)) * (shipWidth + shipGap);
        
        // Return percentage from center
        return `calc(50% + ${centerOffset}px)`;
    };

    // Calculate position for any cannon index (for cannonballs)
    const calculatePositionForIndex = (index) => {
        const shipWidth = 250;
        const shipGap = 40;
        const totalShips = shipWords.length;
        const centerOffset = (index - Math.floor(totalShips / 2)) * (shipWidth + shipGap);
        return `calc(50% + ${centerOffset}px)`;
    };

    return (
        <div className="game-page">
            {/* Game Background */}
            <div className="game-background">
                {/* Score Display */}
                <div className="score-display">
                    <span className="score-label">Score:</span>
                    <span className="score-value">{score}</span>
                </div>

                {/* Ships Container */}
                <div className="ships-container">
                    {shipWords.map((word, index) => (
                        <div key={index} className={`ship-card ${index === cannonPosition ? 'highlighted' : ''}`}>
                            <img src="/assets/ship.png" alt="Ship" className="ship-image" />
                            <div className="word-label">
                                {word}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Current Word Display */}
                <div className="current-word-display">
                    {currentWord}
                </div>

                {/* Cannon */}
                <div className="cannon-container" style={{ left: calculateCannonLeft() }}>
                    <img src="/assets/cannon.png" alt="Cannon" className="cannon" />
                </div>

                {/* Cannonballs */}
                {cannonballs.map(ball => (
                    <div 
                        key={ball.id} 
                        className="cannonball" 
                        style={{ left: calculatePositionForIndex(ball.cannonPos) }}
                    >
                        <img src="/assets/cannonball.png" alt="Cannonball" />
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
