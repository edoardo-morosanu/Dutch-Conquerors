import React, { useState, useEffect } from "react";
import "./GameTutorial.css";

const GameTutorial = ({ isOpen, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    const steps = [
        {
            id: "welcome",
            title: "Welcome to Dutch Conquerors!",
            description:
                "Get ready for naval combat while learning Dutch vocabulary!",
            buttonText:
                "Your mission: sink the ship with the correct English translation",
            highlightSelector: null,
            position: "center",
        },
        {
            id: "ships",
            title: "Enemy Fleet",
            description:
                "Each ship carries an English word. Find the one that matches the Dutch word shown below.",
            buttonText: "Look for ships on the horizon - they're your targets!",
            highlightSelector: ".ships-container",
            position: "center",
        },
        {
            id: "dutch-word",
            title: "Dutch Word Challenge",
            description: "The Dutch word appears at the bottom of your screen.",
            buttonText: "This is the word you need to translate to English",
            highlightSelector: ".current-word-display",
            position: "center",
        },
        {
            id: "cannon-aim",
            title: "Cannon Controls",
            description: "Use A/D keys or arrow keys to aim your cannon.",
            buttonText: "Position your cannon to target the correct ship",
            highlightSelector: null,
            position: "center",
            content: (
                <div className="tutorial-controls-content">
                    <div className="controls-map">
                        <div className="control-entry">
                            <div className="nautical-key">A D / ← →</div>
                            <div className="control-description">
                                <span className="control-name">Aim Cannon</span>
                                <span className="control-detail">
                                    Move cannon left and right
                                </span>
                            </div>
                        </div>
                        <div className="control-entry">
                            <div className="nautical-key">SPACE</div>
                            <div className="control-description">
                                <span className="control-name">
                                    Fire Cannon
                                </span>
                                <span className="control-detail">
                                    Launch cannonball at target
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: "health",
            title: "Ship Health",
            description: "Monitor your lives in the bottom left corner.",
            buttonText: "You have 3 lives - hitting wrong ships costs you one!",
            highlightSelector: ".score-display",
            position: "center",
        },
        {
            id: "scoring",
            title: "Scoring System",
            description:
                "Earn points by hitting the correct ships and avoid wrong targets!",
            buttonText: "The faster you are, the higher your score",
            highlightSelector: ".score-display",
            position: "center",
        },
        {
            id: "replay-info",
            title: "Tutorial Replay",
            description: "You can replay this tutorial anytime!",
            buttonText:
                "Click the tutorial button (highlighted with an arrow) in the top right to replay this tutorial",
            highlightSelector: ".replay-tutorial-button",
            position: "center",
            showArrow: true,
        },
    ];

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setCurrentStep(0);
        }
    }, [isOpen]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStepClick = (stepIndex) => {
        setCurrentStep(stepIndex);
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        setIsVisible(false);
        setTimeout(() => {
            onComplete();
        }, 300);
    };

    const getHighlightedElement = () => {
        const step = steps[currentStep];
        if (step?.highlightSelector) {
            return document.querySelector(step.highlightSelector);
        }
        return null;
    };

    const getHighlightPosition = () => {
        const element = getHighlightedElement();
        if (element) {
            const rect = element.getBoundingClientRect();
            return {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            };
        }
        return null;
    };

    if (!isOpen || !isVisible) return null;

    const currentStepData = steps[currentStep];
    const highlightPos = getHighlightPosition();
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    return (
        <div
            className="game-tutorial-overlay"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Single overlay with cutout for highlighted element */}
            <div
                className="game-tutorial-backdrop"
                onClick={(e) => e.stopPropagation()}
                style={
                    highlightPos
                        ? {
                              clipPath: `polygon(0% 0%, 0% 100%, ${highlightPos.left}px 100%, ${highlightPos.left}px ${highlightPos.top}px, ${highlightPos.left + highlightPos.width}px ${highlightPos.top}px, ${highlightPos.left + highlightPos.width}px ${highlightPos.top + highlightPos.height}px, ${highlightPos.left}px ${highlightPos.top + highlightPos.height}px, ${highlightPos.left}px 100%, 100% 100%, 100% 0%)`,
                          }
                        : {}
                }
            />

            {/* Arrow pointing from tutorial to highlighted element */}
            {highlightPos && currentStepData.showArrow && (
                <div
                    className="tutorial-arrow"
                    style={{
                        position: "absolute",
                        top: highlightPos.top + highlightPos.height + 30,
                        left: highlightPos.left + highlightPos.width / 2 - 36,
                        zIndex: 10004,
                    }}
                >
                    ↑
                </div>
            )}

            {/* Make highlighted element clickable */}
            {highlightPos && (
                <div
                    className="game-tutorial-clickable-area"
                    style={{
                        position: "absolute",
                        top: highlightPos.top,
                        left: highlightPos.left,
                        width: highlightPos.width,
                        height: highlightPos.height,
                        zIndex: 10003,
                        pointerEvents: "auto",
                        cursor: "pointer",
                        borderRadius: "12px",
                    }}
                    onClick={() => {
                        const element = getHighlightedElement();
                        if (element) {
                            element.click();
                            // If user clicks replay button in final step, complete tutorial
                            if (
                                currentStep === steps.length - 1 &&
                                steps[currentStep].id === "replay-info"
                            ) {
                                handleComplete();
                            }
                        }
                    }}
                />
            )}

            {/* Tutorial content */}
            <div className="game-tutorial-content">
                <div className="game-tutorial-header">
                    <h2 className="game-tutorial-title">
                        {currentStepData.title}
                    </h2>
                    <div className="game-tutorial-progress">
                        <span>
                            {currentStep + 1} of {steps.length}
                        </span>
                    </div>
                </div>

                <div className="game-tutorial-body">
                    <p className="game-tutorial-description">
                        {currentStepData.description}
                    </p>

                    {currentStepData.content && (
                        <div className="tutorial-step-content">
                            {currentStepData.content}
                        </div>
                    )}

                    {currentStepData.buttonText && (
                        <p className="game-tutorial-button-text">
                            {currentStepData.buttonText}
                        </p>
                    )}
                </div>

                <div className="game-tutorial-actions">
                    <div className="navigation-buttons">
                        <button
                            className={`game-tutorial-btn back-btn ${isFirstStep ? "disabled" : ""}`}
                            onClick={handlePrevious}
                            disabled={isFirstStep}
                        >
                            ← Back
                        </button>

                        <button
                            className="game-tutorial-btn skip-btn"
                            onClick={handleSkip}
                        >
                            Skip Tutorial
                        </button>

                        <button
                            className="game-tutorial-btn next-btn"
                            onClick={handleNext}
                        >
                            {isLastStep ? "Got it!" : "Next →"}
                        </button>
                    </div>
                </div>

                {/* Step indicators */}
                <div className="game-tutorial-indicators">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`indicator ${index === currentStep ? "active" : ""} ${index < currentStep ? "completed" : ""}`}
                            onClick={() => handleStepClick(index)}
                            style={{ cursor: "pointer" }}
                            title={`Go to step ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GameTutorial;
