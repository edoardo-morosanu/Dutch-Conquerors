import React, { useState, useEffect } from "react";
import "./FirstPopup.css";

const FirstPopup = ({ isOpen, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    const steps = [
        {
            id: "music",
            title: "Background Music",
            description:
                "Background music is now playing to enhance your experience.",
            buttonText: "You can mute it anytime using this button",
            highlightSelector: ".mute-button",
            position: "center",
        },
        {
            id: "rules",
            title: "Game Rules",
            description: "New to Dutch Conquerors?",
            buttonText: "Check out the rules here to learn how to play",
            highlightSelector: ".rules-button",
            position: "center",
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

    return (
        <div className="first-popup-overlay">
            {/* Single overlay with cutout for highlighted button */}
            <div
                className="first-popup-backdrop"
                style={
                    highlightPos
                        ? {
                              clipPath: `polygon(0% 0%, 0% 100%, ${highlightPos.left}px 100%, ${highlightPos.left}px ${highlightPos.top}px, ${highlightPos.left + highlightPos.width}px ${highlightPos.top}px, ${highlightPos.left + highlightPos.width}px ${highlightPos.top + highlightPos.height}px, ${highlightPos.left}px ${highlightPos.top + highlightPos.height}px, ${highlightPos.left}px 100%, 100% 100%, 100% 0%)`,
                          }
                        : {}
                }
            />

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
                            // If user clicks rules button in step 2, complete tutorial
                            if (
                                currentStep === 1 &&
                                steps[currentStep].id === "rules"
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

                    {currentStepData.buttonText && (
                        <p className="first-popup-button-text">
                            {currentStepData.buttonText}
                        </p>
                    )}
                </div>

                <div className="first-popup-actions">
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
                        {isLastStep ? "Got it!" : "Next"}
                    </button>
                </div>

                {/* Step indicators */}
                <div className="first-popup-indicators">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`indicator ${index === currentStep ? "active" : ""} ${index < currentStep ? "completed" : ""}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FirstPopup;
