'use client';

import React, { useState, useEffect, useRef } from 'react';
import './PenguinMascot.css';

interface PenguinMascotProps {
  className?: string;
}

const PenguinMascot: React.FC<PenguinMascotProps> = ({ className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const penguinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHovered) {
      const timer = setTimeout(() => setShowBubble(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowBubble(false);
    }
  }, [isHovered]);

  return (
    <div className={`penguin-mascot ${className}`}>
      {/* Speech Bubble */}
      <div className={`speech-bubble ${showBubble ? 'show' : ''}`}>
        <div className="bubble-content">Welcome to Alkhair Lingo Lab!</div>
        <div className="bubble-tail"></div>
      </div>

      {/* Penguin Container */}
      <div 
        className={`penguin-container ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        ref={penguinRef}
      >
        {/* Penguin Body */}
        <div className="penguin-body">
          {/* Head */}
          <div className="penguin-head">
            {/* Eyes */}
            <div className="penguin-eyes">
              <div className="eye left-eye"></div>
              <div className="eye right-eye"></div>
            </div>
            
            {/* Beak */}
            <div className="penguin-beak"></div>
          </div>

          {/* Belly */}
          <div className="penguin-belly"></div>

          {/* Flippers */}
          <div className="penguin-flippers">
            <div className="flipper left-flipper"></div>
            <div className="flipper right-flipper"></div>
          </div>

          {/* Feet */}
          <div className="penguin-feet">
            <div className="foot left-foot"></div>
            <div className="foot right-foot"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenguinMascot;




