import React from 'react';

const NeuralText = ({ children, className = "" }) => {
    // SVG pattern for neural network / connections
    // Using a darker, more vibrant stroke for visibility against light backgrounds if needed, 
    // but since we want "motion inside", we'll overlay this on the gradient.
    // We use a data URI. 
    const neuralPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10 L30 30 M30 30 L50 10 M30 30 L30 50' stroke='rgba(255, 255, 255, 0.4)' stroke-width='2' fill='none'/%3E%3Ccircle cx='10' cy='10' r='2' fill='rgba(255, 255, 255, 0.6)'/%3E%3Ccircle cx='30' cy='30' r='2' fill='rgba(255, 255, 255, 0.8)'/%3E%3Ccircle cx='50' cy='10' r='2' fill='rgba(255, 255, 255, 0.6)'/%3E%3Ccircle cx='30' cy='50' r='2' fill='rgba(255, 255, 255, 0.6)'/%3E%3C/svg%3E")`;

    return (
        <span
            className={`relative inline-block ${className}`}
            style={{
                // We act as a mask if we want just the pattern, OR we validly layer them.
                // To have "motion inside", the text itself needs the gradient, and we overlay the moving pattern?
                // Actually, easiest valid way for "motion inside text" is background-clip: text on a container with BOTH images.
                backgroundImage: `${neuralPattern}, linear-gradient(to right, #2563eb, #9333ea, #db2777)`, // Blue to Purple to Pink matches original
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '30px 30px, 100% 100%', // Pattern size, Gradient size
                animation: 'neural-flow 3s linear infinite',
            }}
        >
            {children}
            <style>{`
        @keyframes neural-flow {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 30px 30px, 0 0; }
        }
      `}</style>
        </span>
    );
};

export default NeuralText;
