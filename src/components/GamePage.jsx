import React, { useState, useEffect, useRef } from 'react';
import './GamePage.css';

const GamePage = ({ onBackClick }) => {
    const [score, setScore] = useState(0);
    const [currentWord, setCurrentWord] = useState('democrate');
    const [cannonPosition, setCannonPosition] = useState(2); // Start at middle ship (index 2)
    const [cannonballs, setCannonballs] = useState([]); // Track active cannonballs
    const [canShoot, setCanShoot] = useState(true); // Shooting cooldown
    const [gameTime, setGameTime] = useState(0); // Track game time in seconds
    const [shipsTop, setShipsTop] = useState(60); // Ships vertical position
    const cannonballRefs = useRef({}); // Track cannonball DOM elements for collision detection
    const [hitShipIndex, setHitShipIndex] = useState(null); // Track which ship was hit for visual feedback
    
    // Sample Dutch words for the ships
    const shipWords = ['hallo', 'slaap', 'democrate', 'goedenavond', 'dag'];

    // Collision detection function
    const checkCollisions = () => {
        cannonballs.forEach(ball => {
            const cannonballElement = cannonballRefs.current[ball.id];
            if (!cannonballElement) return;

            const ballRect = cannonballElement.getBoundingClientRect();
            
            // Check collision with each ship
            shipWords.forEach((word, shipIndex) => {
                // Calculate ship position
                const shipWidth = 250;
                const shipHeight = 150; // Approximate ship height
                const shipGap = 40;
                const totalShips = shipWords.length;
                
                // Calculate ship's horizontal position (same logic as in render)
                const centerOffset = (shipIndex - Math.floor(totalShips / 2)) * (shipWidth + shipGap);
                const shipLeft = window.innerWidth / 2 + centerOffset - shipWidth / 2;
                const shipRight = shipLeft + shipWidth;
                const shipTop = shipsTop;
                const shipBottom = shipsTop + shipHeight;
                
                // Check if cannonball intersects with ship
                const isColliding = (
                    ballRect.left < shipRight &&
                    ballRect.right > shipLeft &&
                    ballRect.top < shipBottom &&
                    ballRect.bottom > shipTop
                );
                
                if (isColliding) {
                    // Collision detected! Reset ships to starting position
                    setShipsTop(60);
                    
                    // Increase score on hit
                    setScore(prevScore => prevScore + 1);
                    
                    // Trigger hit feedback for specific ship
                    setHitShipIndex(shipIndex);
                    setTimeout(() => setHitShipIndex(null), 500); // Flash effect for 500ms
                    
                    // Remove the colliding cannonball and clean up ref
                    setCannonballs(prev => prev.filter(b => b.id !== ball.id));
                    delete cannonballRefs.current[ball.id];
                    
                    // Optional: Add some visual feedback
                    console.log(`Ship "${word}" hit! Ships reset to start. Score: ${score + 1}`);
                }
            });
        });
    };

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
            // Clean up ref
            delete cannonballRefs.current[newCannonball.id];
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

    // Game timer effect (keep timer logic for future use)
    useEffect(() => {
        const gameTimer = setInterval(() => {
            setGameTime(prevTime => prevTime + 0.1); // Increment by 0.1 seconds
        }, 100);

        return () => clearInterval(gameTimer);
    }, [gameTime]);

    // Ship movement effect - speed increases with score
    useEffect(() => {
        const moveShips = () => {
            setShipsTop(prevTop => {
                // Calculate speed based on score: starts at 0.5px/frame, increases by 0.2px every 5 points
                const baseSpeed = 0.5;
                const speedIncrease = Math.floor(score / 5) * 0.2;
                const maxSpeedIncrease = 2.0; // Cap the speed increase
                const currentSpeed = baseSpeed + Math.min(speedIncrease, maxSpeedIncrease);
                
                // Use a fixed boundary based on viewport height - teleport at 60% of screen
                // This accounts for the cannon area at the bottom
                const bottomBoundary = window.innerHeight * 0.45; // 60% of viewport height
                
                // Check if we're about to exceed the boundary before moving
                const newTop = prevTop + currentSpeed;
                
                // Teleport back to top when reaching the boundary
                if (newTop >= bottomBoundary) {
                    return 30; // Teleport back to starting position
                }
                
                return newTop;
            });
        };

        const movementInterval = setInterval(moveShips, 16); // ~60fps

        return () => clearInterval(movementInterval);
    }, [score]);

    // Collision detection effect
    useEffect(() => {
        if (cannonballs.length === 0) return;

        const collisionInterval = setInterval(() => {
            checkCollisions();
        }, 16); // Check at 60fps

        return () => clearInterval(collisionInterval);
    }, [cannonballs, shipsTop]); // Re-run when cannonballs or ship position changes

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
                <div className="ships-container" style={{ top: `${shipsTop}px` }}>
                    {shipWords.map((word, index) => (
                        <div key={index} className={`ship-card ${index === cannonPosition ? 'highlighted' : ''} ${hitShipIndex === index ? 'hit-flash' : ''}`}>
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
                        ref={el => cannonballRefs.current[ball.id] = el}
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
