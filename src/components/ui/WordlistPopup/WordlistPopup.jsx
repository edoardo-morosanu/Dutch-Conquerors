import React, { useState, useEffect } from "react";
import "./WordlistPopup.css";

// Helper functions for wordlist management
const getWordlistFromStorage = () => {
    try {
        const stored = localStorage.getItem("dutchWordlist");
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Error reading wordlist from localStorage:", error);
        return [];
    }
};

const saveWordlistToStorage = (wordlist) => {
    try {
        localStorage.setItem("dutchWordlist", JSON.stringify(wordlist));
        return true;
    } catch (error) {
        console.error("Error saving wordlist to localStorage:", error);
        return false;
    }
};

const clearWordlist = () => {
    try {
        localStorage.removeItem("dutchWordlist");
        return true;
    } catch (error) {
        console.error("Error clearing wordlist:", error);
        return false;
    }
};

const WordlistPopup = ({ isOpen, onClose }) => {
    const [wordlist, setWordlist] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("dateAdded"); // "dateAdded", "english", "dutch"
    const [sortOrder, setSortOrder] = useState("desc"); // "asc", "desc"
    const [showConfirmClear, setShowConfirmClear] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            loadWordlist();
        }
    }, [isOpen]);

    const loadWordlist = () => {
        const words = getWordlistFromStorage();
        setWordlist(words);
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
            setSearchTerm("");
            setShowConfirmClear(false);
        }, 300);
    };

    const handleRemoveWord = (index) => {
        const updatedWordlist = wordlist.filter((_, i) => i !== index);
        setWordlist(updatedWordlist);
        saveWordlistToStorage(updatedWordlist);
    };

    const handleClearAll = () => {
        if (clearWordlist()) {
            setWordlist([]);
            setShowConfirmClear(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return "Unknown date";
        }
    };

    const filteredAndSortedWords = () => {
        let filtered = wordlist.filter(word => 
            word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
            word.dutch.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case "english":
                    aValue = a.english.toLowerCase();
                    bValue = b.english.toLowerCase();
                    break;
                case "dutch":
                    aValue = a.dutch.toLowerCase();
                    bValue = b.dutch.toLowerCase();
                    break;
                case "dateAdded":
                default:
                    aValue = new Date(a.dateAdded || 0);
                    bValue = new Date(b.dateAdded || 0);
                    break;
            }

            if (sortOrder === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    };

    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(newSortBy);
            setSortOrder("asc");
        }
    };

    if (!isOpen || !isVisible) return null;

    const displayWords = filteredAndSortedWords();

    return (
        <div className="wordlist-popup-overlay" onClick={handleClose}>
            <div className="wordlist-popup-content" onClick={(e) => e.stopPropagation()}>
                <div className="wordlist-popup-header">
                    <h2 className="wordlist-popup-title">
                        <span className="wordlist-icon">📚</span>
                        Your Wordlist
                    </h2>
                    <button 
                        className="wordlist-close-btn"
                        onClick={handleClose}
                        title="Close wordlist"
                    >
                        ×
                    </button>
                </div>

                <div className="wordlist-stats">
                    <span className="word-count">
                        {wordlist.length} {wordlist.length === 1 ? 'word' : 'words'} saved
                    </span>
                    {displayWords.length !== wordlist.length && (
                        <span className="filtered-count">
                            ({displayWords.length} shown)
                        </span>
                    )}
                </div>

                <div className="wordlist-controls">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search words..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="wordlist-search"
                        />
                        <span className="search-icon">🔍</span>
                    </div>

                    <div className="sort-controls">
                        <span className="sort-label">Sort by:</span>
                        <button 
                            className={`sort-btn ${sortBy === 'dateAdded' ? 'active' : ''}`}
                            onClick={() => handleSortChange('dateAdded')}
                        >
                            Date {sortBy === 'dateAdded' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                        <button 
                            className={`sort-btn ${sortBy === 'english' ? 'active' : ''}`}
                            onClick={() => handleSortChange('english')}
                        >
                            English {sortBy === 'english' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                        <button 
                            className={`sort-btn ${sortBy === 'dutch' ? 'active' : ''}`}
                            onClick={() => handleSortChange('dutch')}
                        >
                            Dutch {sortBy === 'dutch' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                    </div>
                </div>

                <div className="wordlist-body">
                    {wordlist.length === 0 ? (
                        <div className="empty-wordlist">
                            <div className="empty-icon">📝</div>
                            <h3>No words saved yet</h3>
                            <p>Start learning with flashcards to build your vocabulary!</p>
                            <p className="empty-hint">Swipe right on flashcards to save words here</p>
                        </div>
                    ) : displayWords.length === 0 ? (
                        <div className="empty-wordlist">
                            <div className="empty-icon">🔍</div>
                            <h3>No words found</h3>
                            <p>Try adjusting your search terms</p>
                        </div>
                    ) : (
                        <div className="wordlist-container">
                            {displayWords.map((word, index) => {
                                const originalIndex = wordlist.findIndex(w => 
                                    w.english === word.english && 
                                    w.dutch === word.dutch && 
                                    w.dateAdded === word.dateAdded
                                );
                                return (
                                    <div key={`${word.english}-${word.dutch}-${index}`} className="word-item">
                                        <div className="word-content">
                                            <div className="word-pair">
                                                <span className="english-word">{word.english}</span>
                                                <span className="word-separator">→</span>
                                                <span className="dutch-word">{word.dutch}</span>
                                            </div>
                                            <div className="word-meta">
                                                <span className="date-added">
                                                    Added {formatDate(word.dateAdded)}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            className="remove-word-btn"
                                            onClick={() => handleRemoveWord(originalIndex)}
                                            title="Remove word from wordlist"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {wordlist.length > 0 && (
                    <div className="wordlist-actions">
                        {!showConfirmClear ? (
                            <button 
                                className="clear-all-btn"
                                onClick={() => setShowConfirmClear(true)}
                            >
                                Clear All Words
                            </button>
                        ) : (
                            <div className="confirm-clear">
                                <span className="confirm-text">Delete all {wordlist.length} words?</span>
                                <button 
                                    className="confirm-yes-btn"
                                    onClick={handleClearAll}
                                >
                                    Yes, Delete All
                                </button>
                                <button 
                                    className="confirm-no-btn"
                                    onClick={() => setShowConfirmClear(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WordlistPopup;