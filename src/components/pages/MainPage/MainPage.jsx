import React, { useState } from "react";
import "./MainPage.css";
import RulesPopup from "../../ui/RulesPopup/RulesPopup";

const MainPage = ({ onPlayClick, onLearnClick }) => {
    const [showRules, setShowRules] = useState(false);

    const handleLearnClick = () => {
        setShowRules(true);
    };

    const handleCloseRules = () => {
        setShowRules(false);
    };

    return (
        <div className="main-page">
            <div className="background-container">
                <div className="ship-silhouette"></div>
                <div className="lightning-effect"></div>
            </div>

            <div className="content-container">
                <div className="logo-container">
                    <img
                        src="/assets/images/logo.png"
                        alt="Dutch Conquerors"
                        className="game-logo"
                    />
                    <h1 className="game-title">Dutch Conquerors</h1>
                </div>

                <div className="menu-buttons">
                    <button
                        className="menu-button play-button"
                        onClick={onPlayClick}
                    >
                        <span className="button-text">Play</span>
                    </button>

                    <button
                        className="menu-button learn-button"
                        onClick={onLearnClick}
                    >
                        <span className="button-text">Learn</span>
                    </button>
                </div>

                <div className="bottom-buttons">
                    <button className="icon-button mute-button">
                        <span className="icon">🔇</span>
                    </button>
                    <button
                        className="icon-button rules-button"
                        onClick={handleLearnClick}
                    >
                        <span className="icon">📖</span>
                    </button>
                </div>
            </div>

            <RulesPopup isOpen={showRules} onClose={handleCloseRules} />
        </div>
    );
};

export default MainPage;
