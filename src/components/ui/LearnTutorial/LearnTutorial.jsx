import React, { useState, useEffect } from "react";
import "./LearnTutorial.css";

const LearnTutorial = ({ isOpen, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    const steps = [
        {
            id: "flashcard",
            title: "Flashcard Learning",
            description:
                "Welcome to the flashcard learning mode! Here you can practice Dutch vocabulary.",
            buttonText: "Click on any card to see the translation",
            highlightSelector: ".flashcard",
            position: "center",
        },
        {
            id: "swipe-right",
            title: "Building Your Wordlist",
            description:
                "Swipe cards to the right to add words to your personal wordlist.",
            buttonText: "These words will be saved for later use",
            highlightSelector: null,
            position: "center",
        },
        {
            id: "game-mode",
            title: "Game Mode Selection",
            description:
                "In the game, you'll be able to choose between playing with all words or only your wordlist!",
            buttonText: "This lets you focus on words you want to practice",
            highlightSelector: null,
            position: "center",
        },
        {
            id: "swipe-left",
            title: "Skipping Words",
            description:
                "Swipe cards to the left if you don't want to add them to your wordlist.",
            buttonText: "You can always encounter these words again later",
            highlightSelector: null,
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
            className="learn-tutorial-overlay"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Single overlay with cutout for highlighted element */}
            <div
                className="learn-tutorial-backdrop"
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
                    className="learn-tutorial-clickable-area"
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
            <div className="learn-tutorial-content">
                <div className="learn-tutorial-header">
                    <h2 className="learn-tutorial-title">
                        {currentStepData.title}
                    </h2>
                    <div className="learn-tutorial-progress">
                        <span>
                            {currentStep + 1} of {steps.length}
                        </span>
                    </div>
                </div>

                <div className="learn-tutorial-body">
                    <p className="learn-tutorial-description">
                        {currentStepData.description}
                    </p>

                    {currentStepData.buttonText && (
                        <p className="learn-tutorial-button-text">
                            {currentStepData.buttonText}
                        </p>
                    )}
                </div>

                <div className="learn-tutorial-actions">
                    <div className="navigation-buttons">
                        <button
                            className={`learn-tutorial-btn back-btn ${isFirstStep ? "disabled" : ""}`}
                            onClick={handlePrevious}
                            disabled={isFirstStep}
                        >
                            ← Back
                        </button>

                        <button
                            className="learn-tutorial-btn skip-btn"
                            onClick={handleSkip}
                        >
                            Skip Tutorial
                        </button>

                        <button
                            className="learn-tutorial-btn next-btn"
                            onClick={handleNext}
                        >
                            {isLastStep ? "Got it!" : "Next →"}
                        </button>
                    </div>
                </div>

                {/* Step indicators */}
                <div className="learn-tutorial-indicators">
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

export default LearnTutorial;
