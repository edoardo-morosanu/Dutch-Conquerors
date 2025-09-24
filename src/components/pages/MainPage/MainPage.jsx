import React, { useState } from "react";
import "./MainPage.css";

const MainPage = ({
    onPlayClick,
    onLearnClick,
    onWordlistClick,
    isMuted,
    musicReady,
    toggleMute,
    onReplayTutorial,
}) => {
    const handleRulesClick = () => {
        if (onReplayTutorial) {
            onReplayTutorial();
        }
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
                        className="main-menu-button play-button"
                        onClick={onPlayClick}
                    >
                        <span className="button-text">Play</span>
                    </button>

                    <button
                        className="main-menu-button learn-button"
                        onClick={onLearnClick}
                    >
                        <span className="button-text">Learn</span>
                    </button>
                </div>

                <div className="bottom-buttons">
                    <button
                        className="nautical-icon-button mute-button"
                        onClick={toggleMute}
                        title={isMuted ? "Unmute Music" : "Mute Music"}
                    >
                        <div className="button-anchor">
                            <div className="button-content">
                                {isMuted ? (
                                    <svg
                                        className="nautical-icon"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M16.5 12A4.5 4.5 0 0 0 14.64 8.77l1.42-1.42A6.5 6.5 0 0 1 18.5 12a6.5 6.5 0 0 1-2.44 5.65l-1.42-1.42A4.5 4.5 0 0 0 16.5 12ZM12 4L9.91 6.09 12 8.18V4ZM4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.25A6.5 6.5 0 0 1 14.82 19l1.42 1.42A8.5 8.5 0 0 0 18.77 17L21 19.73 22.27 18.46 4.27 3ZM12 4v.27l-1.42 1.42L12 7.11V4Z" />
                                    </svg>
                                ) : musicReady ? (
                                    <svg
                                        className="nautical-icon"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14.64 8.77l1.42-1.42A6.5 6.5 0 0 1 18.5 12a6.5 6.5 0 0 1-2.44 5.65l-1.42-1.42A4.5 4.5 0 0 0 16.5 12Zm-2-8.5v17l-1.42-1.42A8.5 8.5 0 0 1 5.5 12a8.5 8.5 0 0 1 6.08-8.08L14.5 3.5Z" />
                                    </svg>
                                ) : (
                                    <svg
                                        className="nautical-icon spinning"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z" />
                                    </svg>
                                )}
                                <div className="rope-decoration left"></div>
                                <div className="rope-decoration right"></div>
                            </div>
                        </div>
                    </button>
                    <button
                        className="nautical-icon-button rules-button"
                        onClick={handleRulesClick}
                        title="Replay Tutorial"
                    >
                        <div className="button-anchor">
                            <div className="button-content">
                                <svg
                                    width="35px"
                                    height="35px"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    stroke="#f5b327"
                                >
                                    <g
                                        id="SVGRepo_bgCarrier"
                                        strokeWidth="0"
                                    ></g>
                                    <g
                                        id="SVGRepo_tracerCarrier"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    ></g>
                                    <g id="SVGRepo_iconCarrier">
                                        {" "}
                                        <path
                                            d="M19.8978 16H7.89778C6.96781 16 6.50282 16 6.12132 16.1022C5.08604 16.3796 4.2774 17.1883 4 18.2235"
                                            stroke="#ffffff"
                                            strokeWidth="1.5"
                                        ></path>{" "}
                                        <path
                                            d="M8 7H16"
                                            stroke="#ffffff"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        ></path>{" "}
                                        <path
                                            d="M8 10.5H13"
                                            stroke="#ffffff"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        ></path>{" "}
                                        <path
                                            d="M13 16V19.5309C13 19.8065 13 19.9443 12.9051 20C12.8103 20.0557 12.6806 19.9941 12.4211 19.8708L11.1789 19.2808C11.0911 19.2391 11.0472 19.2182 11 19.2182C10.9528 19.2182 10.9089 19.2391 10.8211 19.2808L9.57889 19.8708C9.31943 19.9941 9.18971 20.0557 9.09485 20C9 19.9443 9 19.8065 9 19.5309V16.45"
                                            stroke="#ffffff"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        ></path>{" "}
                                        <path
                                            d="M10 22C7.17157 22 5.75736 22 4.87868 21.1213C4 20.2426 4 18.8284 4 16V8C4 5.17157 4 3.75736 4.87868 2.87868C5.75736 2 7.17157 2 10 2H14C16.8284 2 18.2426 2 19.1213 2.87868C20 3.75736 20 5.17157 20 8M14 22C16.8284 22 18.2426 22 19.1213 21.1213C20 20.2426 20 18.8284 20 16V12"
                                            stroke="#ffffff"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        ></path>{" "}
                                    </g>
                                </svg>
                                <div className="compass-ring"></div>
                                <div className="rope-decoration left"></div>
                                <div className="rope-decoration right"></div>
                            </div>
                        </div>
                    </button>
                    <button
                        className="nautical-icon-button wordlist-button"
                        onClick={onWordlistClick}
                        title="View Your Wordlist"
                    >
                        <div className="button-anchor">
                            <div className="button-content">
                                <svg
                                    width="35px"
                                    height="35px"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g strokeWidth="0"></g>
                                    <g
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    ></g>
                                    <g>
                                        <path
                                            d="M8 6L21 6.00078M8 12L21 12.0008M8 18L21 18.0007M3 6.5H4V5.5H3V6.5ZM3 12.5H4V11.5H3V12.5ZM3 18.5H4V17.5H3V18.5Z"
                                            stroke="#ffffff"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </g>
                                </svg>
                                <div className="compass-ring"></div>
                                <div className="rope-decoration left"></div>
                                <div className="rope-decoration right"></div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
