import React from 'react';
import './WebGLBackground.css';

interface WebGLBackgroundProps {
  className?: string;
}

const WebGLBackground: React.FC<WebGLBackgroundProps> = ({ className = '' }) => {
  return (
    <div className={`css-background-container ${className}`}>
      {/* Animated particles using CSS */}
      <div className="particles-container">
        {Array.from({ length: 50 }, (_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              '--delay': `${Math.random() * 20}s`,
              '--duration': `${15 + Math.random() * 10}s`,
              '--x': `${Math.random() * 100}vw`,
              '--y': `${Math.random() * 100}vh`,
              '--size': `${2 + Math.random() * 4}px`
            } as React.CSSProperties}
          />
        ))}
      </div>
      
      {/* Floating geometric shapes */}
      <div className="shapes-container">
        {Array.from({ length: 8 }, (_, i) => (
          <div 
            key={i} 
            className={`floating-shape shape-${i % 3}`}
            style={{
              '--delay': `${i * 2}s`,
              '--x': `${20 + (i * 10) % 80}%`,
              '--y': `${20 + (i * 15) % 60}%`
            } as React.CSSProperties}
          />
        ))}
      </div>
      
      {/* Gradient overlay for better text readability */}
      <div className="gradient-overlay" />
    </div>
  );
};

export default WebGLBackground; 