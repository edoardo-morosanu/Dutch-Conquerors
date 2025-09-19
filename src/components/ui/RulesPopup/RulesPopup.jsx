import React from "react";
import "./RulesPopup.css";

const RulesPopup = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="rules-overlay" onClick={onClose}>
            <div className="rules-popup" onClick={(e) => e.stopPropagation()}>
                <div className="rules-header">
                    <h2 className="rules-title">Game Rules</h2>
                    <button className="close-button" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="rules-content">
                    <div className="rules-section">
                        <h3>🚢 Navigation</h3>
                        <ul>
                            <li>Use A and D to move the cannon</li>
                            <li>Use space to fire the cannon</li>
                            <li>
                                Make sure you destroy the right enemy ship
                                containing the right translation to the word
                                provided
                            </li>
                            <li>Be cautious of your health</li>
                        </ul>
                    </div>

                    <div className="rules-section">
                        <h3>🎯 Objectives</h3>
                        <ul>
                            <li>Get the highest score possible</li>
                            <li>Learn Dutch as much as you can</li>
                            <li>Have fun!</li>
                        </ul>
                    </div>

                    <div className="controls-section">
                        <h3>🎮 Controls</h3>
                        <div className="controls-grid">
                            <div className="control-item">
                                <span className="key">A D / ← →</span>
                                <span>Move Cannon</span>
                            </div>
                            <div className="control-item">
                                <span className="key">SPACE</span>
                                <span>Fire Cannon</span>
                            </div>
                            <div className="control-item">
                                <span className="key">ESC</span>
                                <span>Pause Menu</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rules-footer">
                    <button
                        className="start-adventure-button"
                        onClick={onClose}
                    >
                        Ready to Sail!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RulesPopup;
