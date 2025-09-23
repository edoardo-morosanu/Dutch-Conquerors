import React, { useState, useEffect } from "react";
import "./FirstPopup.css";

const FirstPopup = ({ isOpen, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    const steps = [
        {
            id: "game-rules",
            title: "Game Rules",
            description: "Learn the basics of Dutch Conquerors naval combat!",
            buttonText: null,
            highlightSelector: null,
            position: "center",
            content: (
                <div className="tutorial-rules-content">
                    <div className="maritime-section">
                        <div className="section-anchor">⚓</div>
                        <h4 className="section-title">Mission Objectives</h4>
                        <ul className="maritime-list">
                            <li>
                                Target the ship with the correct English
                                translation of the Dutch word displayed
                            </li>
                            <li>
                                Achieve high scores by conquering enemy fleets
                            </li>
                            <li>
                                Monitor your ship's health - three strikes and
                                you're out!
                            </li>
                        </ul>
                    </div>
                </div>
            ),
        },
        {
            id: "game-controls",
            title: "Ship Controls",
            description:
                "Master these controls to command your vessel effectively.",
            buttonText: null,
            highlightSelector: null,
            position: "center",
            content: (
                <div className="tutorial-controls-content">
                    <div className="controls-map">
                        <div className="control-entry">
                            <div className="nautical-key">A D / ← →</div>
                            <div className="control-description">
                                <span className="control-name">
                                    Cannon Positioning
                                </span>
                                <span className="control-detail">
                                    Navigate your cannon left and right
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
                                    Launch cannonball at target vessel
                                </span>
                            </div>
                        </div>
                        <div className="control-entry">
                            <div className="nautical-key">ESC</div>
                            <div className="control-description">
                                <span className="control-name">
                                    Pause Orders
                                </span>
                                <span className="control-detail">
                                    Halt battle and access menu
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: "replay-info",
            title: "Tutorial Replay",
            description: "You can replay this tutorial anytime!",
            buttonText:
                "Click the rules button located in the main menu to replay this tutorial",
            highlightSelector: ".rules-button",
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
            className="first-popup-overlay"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Single overlay with cutout for highlighted button */}
            <div
                className="first-popup-backdrop"
                onClick={(e) => e.stopPropagation()}
                style={
                    highlightPos
                        ? {
                              clipPath: `polygon(0% 0%, 0% 100%, ${highlightPos.left}px 100%, ${highlightPos.left}px ${highlightPos.top}px, ${highlightPos.left + highlightPos.width}px ${highlightPos.top}px, ${highlightPos.left + highlightPos.width}px ${highlightPos.top + highlightPos.height}px, ${highlightPos.left}px ${highlightPos.top + highlightPos.height}px, ${highlightPos.left}px 100%, 100% 100%, 100% 0%)`,
                          }
                        : {}
                }
            />

            {/* Arrow pointing to highlighted element */}
            {highlightPos && currentStepData.showArrow && (
                <div
                    className="tutorial-arrow"
                    style={{
                        position: "absolute",
                        top: highlightPos.top - 80,
                        left: highlightPos.left + highlightPos.width / 2 - 36,
                        zIndex: 10004,
                    }}
                >
                    ↓
                </div>
            )}
            {/* Make highlighted element clickable */}
            {highlightPos && (
                <div
                    className="first-popup-clickable-area"
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
                            // If user clicks rules button in final step, complete tutorial
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
            <div className="first-popup-content">
                <div className="first-popup-header">
                    <h2 className="first-popup-title">
                        {currentStepData.title}
                    </h2>
                    <div className="first-popup-progress">
                        <span>
                            {currentStep + 1} of {steps.length}
                        </span>
                    </div>
                </div>

                <div className="first-popup-body">
                    <p className="first-popup-description">
                        {currentStepData.description}
                    </p>

                    {currentStepData.content && (
                        <div className="tutorial-step-content">
                            {currentStepData.content}
                        </div>
                    )}

                    {currentStepData.buttonText && (
                        <p className="first-popup-button-text">
                            {currentStepData.buttonText}
                        </p>
                    )}
                </div>

                <div className="first-popup-actions">
                    <div className="navigation-buttons">
                        <button
                            className={`first-popup-btn back-btn ${isFirstStep ? "disabled" : ""}`}
                            onClick={handlePrevious}
                            disabled={isFirstStep}
                        >
                            ← Back
                        </button>

                        <button
                            className="first-popup-btn skip-btn"
                            onClick={handleSkip}
                        >
                            Skip Tutorial
                        </button>

                        <button
                            className="first-popup-btn next-btn"
                            onClick={handleNext}
                        >
                            {isLastStep ? "Got it!" : "Next →"}
                        </button>
                    </div>
                </div>

                {/* Step indicators */}
                <div className="first-popup-indicators">
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

export default FirstPopup;
