import React, { useState, useEffect } from "react";
import "./GameModePopup.css";

const GameModePopup = ({ isOpen, onModeSelect, onClose, wordlistCount = 0 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        }
    }, [isOpen]);

    const handleModeSelect = (mode) => {
        setIsVisible(false);
        setTimeout(() => {
            onModeSelect(mode);
        }, 300);
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!isOpen || !isVisible) return null;

    return (
        <div className="game-mode-popup-overlay">
            <div className="game-mode-popup-backdrop" />

            <div className="game-mode-popup-content">
                <div className="game-mode-popup-header">
                    <h2 className="game-mode-popup-title">Choose Game Mode</h2>
                    <button 
                        className="game-mode-close-btn"
                        onClick={handleClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="game-mode-popup-body">
                    <p className="game-mode-description">
                        Select how you want to practice your Dutch vocabulary:
                    </p>

                    <div className="game-mode-options">
                        {/* Random Words Option */}
                        <div 
                            className="game-mode-option"
                            onClick={() => handleModeSelect("random")}
                        >
                            <div className="game-mode-icon">🎲</div>
                            <div className="game-mode-info">
                                <h3 className="game-mode-option-title">Random Words</h3>
                                <p className="game-mode-option-description">
                                    Practice with randomly selected Dutch vocabulary words
                                </p>
                                <div className="game-mode-option-meta">
                                    All available words
                                </div>
                            </div>
                            <div className="game-mode-arrow">→</div>
                        </div>

                        {/* Wordlist Option */}
                        <div 
                            className="game-mode-option"
                            onClick={() => handleModeSelect("wordlist")}
                        >
                            <div className="game-mode-icon">📚</div>
                            <div className="game-mode-info">
                                <h3 className="game-mode-option-title">Your Wordlist</h3>
                                <p className="game-mode-option-description">
                                    Practice with words you've saved from flashcards
                                </p>
                                <div className="game-mode-option-meta">
                                    {wordlistCount} {wordlistCount === 1 ? 'word' : 'words'} saved
                                </div>
                            </div>
                            <div className="game-mode-arrow">→</div>
                        </div>
                    </div>

                    <div className="game-mode-tip">
                        <span className="tip-icon">💡</span>
                        <span className="tip-text">
                            Add more words to your list by swiping right in the Learn section!
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameModePopup;