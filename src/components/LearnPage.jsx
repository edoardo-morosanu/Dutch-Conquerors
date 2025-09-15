import React, { useState, useRef } from 'react';
import './LearnPage.css';

const LearnPage = ({ onBackClick }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState('');
  const cardRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);
  
  // Hardcoded words for now
  const frontWord = "slaap";
  const backWord = "sleep";

  const handleCardClick = () => {
    if (!isDragging.current) {
      setIsFlipped(!isFlipped);
    }
  };



  // Touch/Mouse events for swipe
  const handleStart = (e) => {
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    startX.current = clientX;
    startY.current = clientY;
    currentX.current = clientX;
    currentY.current = clientY;
    isDragging.current = false;
    
    if (cardRef.current) {
      // Store the current flip state and remove CSS transition during drag
      cardRef.current.style.transition = 'none';
    }
  };

  const handleMove = (e) => {
    if (startX.current === 0) return;
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    currentX.current = clientX;
    currentY.current = clientY;
    const diffX = currentX.current - startX.current;
    const diffY = currentY.current - startY.current;
    
    if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
      isDragging.current = true;
    }
    
    if (cardRef.current && isDragging.current) {
      // Simple physics-based movement
      const rotationX = diffY * 0.02; // Tilt based on vertical movement
      const rotationZ = diffX * 0.05; // Rotate based on horizontal movement
      const opacity = Math.max(0.5, 1 - Math.abs(diffX) / 400);
      
      // Clean, simple stretch based on movement distance
      const distance = Math.sqrt(diffX * diffX + diffY * diffY);
      const stretchFactor = 1 + (distance * 0.0003); // Very subtle stretch
      const maxStretch = 1.08; // Maximum 8% stretch
      const finalStretch = Math.min(stretchFactor, maxStretch);
      
      // Apply swipe transforms while preserving CSS flip
      cardRef.current.style.transform = `
        translateX(${diffX}px) 
        translateY(${diffY * 0.7}px) 
        rotateX(${rotationX}deg) 
        rotateZ(${rotationZ}deg)
        scale(${finalStretch})
      `;
      cardRef.current.style.opacity = opacity;
      
      // Visual feedback based on horizontal movement (main swipe direction)
      if (diffX > 30) {
        setSwipeDirection('right');
      } else if (diffX < -30) {
        setSwipeDirection('left');
      } else {
        setSwipeDirection('');
      }
    }
  };

  const handleEnd = () => {
    if (startX.current === 0) return;
    
    const diffX = currentX.current - startX.current;
    const diffY = currentY.current - startY.current;
    const horizontalVelocity = Math.abs(diffX);
    const totalDistance = Math.sqrt(diffX * diffX + diffY * diffY);
    
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      
      // Decision based on horizontal movement (main swipe direction) but allow vertical freedom
      if (Math.abs(diffX) > 60 || (horizontalVelocity > 50 && Math.abs(diffX) > 30)) {
        // Card should disappear - use natural trajectory
        const direction = diffX > 0 ? 'right' : 'left';
        const finalX = diffX > 0 ? '100vw' : '-100vw';
        const finalY = diffY * 2; // Continue the vertical trajectory
        const finalRotationZ = diffX > 0 ? '30deg' : '-30deg';
        const finalRotationX = diffY * 0.05;
        
        cardRef.current.style.transform = `
          translateX(${finalX}) 
          translateY(${finalY}px) 
          rotateX(${finalRotationX}deg) 
          rotateZ(${finalRotationZ})
        `;
        cardRef.current.style.opacity = '0';
        
        console.log(`Swiped ${direction} - ${direction === 'right' ? 'Added to' : 'Not added to'} wordlist`);
        
        // Reset after animation completes
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.style.transition = '';
            cardRef.current.style.transform = '';
            cardRef.current.style.opacity = '1';
            setSwipeDirection('');
            setIsFlipped(false); // Reset flip state for new card
          }
        }, 300);
      } else {
        // Snap back - clear inline styles to let CSS handle flip state
        cardRef.current.style.transform = '';
        cardRef.current.style.opacity = '1';
        cardRef.current.style.transition = '';
        setSwipeDirection('');
      }
    }
    
    startX.current = 0;
    startY.current = 0;
    currentX.current = 0;
    currentY.current = 0;
    setTimeout(() => {
      isDragging.current = false;
    }, 100);
  };

  return (
    <div className="learn-page">
      {/* Back arrow */}
      <div className="back-arrow" onClick={onBackClick}>
        <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
          <path d="M40 8 L20 20 L40 32" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Instructions */}
      <div className="instructions">
        <p className="instruction-line">Click on the card to turn it around and see the translation</p>
      </div>

      {/* Flashcard container */}
      <div className="flashcard-container">
        <div 
          ref={cardRef}
          className={`flashcard ${isFlipped ? 'flipped' : ''} ${swipeDirection ? `swipe-${swipeDirection}` : ''}`} 
          onClick={handleCardClick}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          {/* Card front */}
          <div className="card-face card-front">
            <img src="/assets/card.png" alt="Card" className="card-background" />
            <div className="card-content">
              <div className="word">{frontWord}</div>
            </div>
          </div>
          
          {/* Card back */}
          <div className="card-face card-back">
            <img src="/assets/card.png" alt="Card" className="card-background" />
            <div className="card-content">
              <div className="word">{backWord}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom instructions */}
      <div className="swipe-instructions">
        <p className="swipe-line">Swipe right to add to wordlist</p>
        <p className="swipe-line">Swipe left to not add to wordlist</p>
      </div>
    </div>
  );
};

export default LearnPage;
