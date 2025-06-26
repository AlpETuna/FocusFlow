import React from 'react';

function TreeVisualization({ level = 1, animated = true }) {
  const getTreeSize = () => {
    const baseSize = 120;
    const growth = Math.min(level * 15, 100);
    return baseSize + growth;
  };

  const getTreeElements = () => {
    const elements = [];
    const size = getTreeSize();
    const centerX = size / 2;
    
    // Trunk
    const trunkWidth = Math.max(8, level * 2);
    const trunkHeight = Math.max(20, level * 4);
    
    elements.push(
      <rect
        key="trunk"
        x={centerX - trunkWidth / 2}
        y={size - trunkHeight}
        width={trunkWidth}
        height={trunkHeight}
        fill="#8b4513"
        rx={trunkWidth / 4}
        className={animated ? "animate-grow-trunk" : ""}
      />
    );

    // Roots (appear at level 3+)
    if (level >= 3) {
      const rootPaths = [
        `M${centerX - trunkWidth / 2} ${size - 5} Q${centerX - 20} ${size + 5} ${centerX - 30} ${size}`,
        `M${centerX + trunkWidth / 2} ${size - 5} Q${centerX + 20} ${size + 5} ${centerX + 30} ${size}`,
      ];
      
      rootPaths.forEach((path, index) => {
        elements.push(
          <path
            key={`root-${index}`}
            d={path}
            stroke="#654321"
            strokeWidth="3"
            fill="none"
            className={animated ? "animate-grow-roots" : ""}
          />
        );
      });
    }

    // Leaves/Canopy - multiple layers based on level
    const canopyLayers = Math.min(level, 5);
    const leafColors = ['#4a7c59', '#7fb069', '#9caf88', '#8fbc8f', '#2d5016'];
    
    for (let i = 0; i < canopyLayers; i++) {
      const layerSize = Math.max(25, (level + i) * 8);
      const yOffset = size - trunkHeight - 10 - (i * 8);
      const xOffset = (i % 2 === 0) ? 0 : (i * 3);
      
      elements.push(
        <circle
          key={`canopy-${i}`}
          cx={centerX + xOffset}
          cy={yOffset}
          r={layerSize}
          fill={leafColors[i % leafColors.length]}
          opacity={0.8 + (i * 0.05)}
          className={animated ? `animate-grow-leaves delay-${i * 200}` : ""}
        />
      );
    }

    // Flowers (appear at level 5+)
    if (level >= 5) {
      const flowerPositions = [
        { x: centerX - 15, y: size - trunkHeight - 25 },
        { x: centerX + 10, y: size - trunkHeight - 30 },
        { x: centerX - 5, y: size - trunkHeight - 35 },
      ];
      
      flowerPositions.forEach((pos, index) => {
        elements.push(
          <circle
            key={`flower-${index}`}
            cx={pos.x}
            cy={pos.y}
            r="3"
            fill="#ff69b4"
            className={animated ? "animate-bloom" : ""}
          />
        );
      });
    }

    // Birds (appear at level 7+)
    if (level >= 7) {
      elements.push(
        <g key="bird" className={animated ? "animate-fly" : ""}>
          <path
            d={`M${centerX + 40} ${size - trunkHeight - 50} Q${centerX + 45} ${size - trunkHeight - 55} ${centerX + 50} ${size - trunkHeight - 50}`}
            stroke="#333"
            strokeWidth="2"
            fill="none"
          />
          <path
            d={`M${centerX + 35} ${size - trunkHeight - 48} Q${centerX + 40} ${size - trunkHeight - 53} ${centerX + 45} ${size - trunkHeight - 48}`}
            stroke="#333"
            strokeWidth="2"
            fill="none"
          />
        </g>
      );
    }

    return elements;
  };

  const getGrassElements = () => {
    const elements = [];
    const size = getTreeSize();
    const grassBlades = Math.max(10, level * 2);
    
    for (let i = 0; i < grassBlades; i++) {
      const x = (i / grassBlades) * size;
      const height = Math.random() * 8 + 5;
      const sway = Math.sin(i) * 2;
      
      elements.push(
        <path
          key={`grass-${i}`}
          d={`M${x} ${size} Q${x + sway} ${size - height / 2} ${x + sway * 2} ${size - height}`}
          stroke="#8fbc8f"
          strokeWidth="2"
          fill="none"
          className={animated ? "animate-sway" : ""}
          style={{ animationDelay: `${i * 100}ms` }}
        />
      );
    }
    
    return elements;
  };

  const size = getTreeSize();

  return (
    <div className="tree-container relative">
      <svg
        width={size}
        height={size + 20}
        viewBox={`0 0 ${size} ${size + 20}`}
        className="tree-svg"
      >
        {/* Sky gradient */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87ceeb" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8fbc8f" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        <rect width={size} height={size + 20} fill="url(#skyGradient)" />
        
        {/* Grass */}
        {getGrassElements()}
        
        {/* Tree */}
        {getTreeElements()}
        
        {/* Level indicator */}
        <text
          x={size / 2}
          y={20}
          textAnchor="middle"
          className="text-sm font-bold fill-forest-green"
        >
          Level {level}
        </text>
      </svg>
      
      {/* Growth animation styles */}
      <style jsx>{`
        .animate-grow-trunk {
          animation: growTrunk 2s ease-out;
        }
        
        .animate-grow-leaves {
          animation: growLeaves 1.5s ease-out;
        }
        
        .animate-grow-roots {
          animation: growRoots 2.5s ease-out;
        }
        
        .animate-bloom {
          animation: bloom 3s ease-in-out infinite;
        }
        
        .animate-fly {
          animation: fly 4s ease-in-out infinite;
        }
        
        .animate-sway {
          animation: sway 3s ease-in-out infinite;
        }
        
        @keyframes growTrunk {
          from { height: 0; }
          to { height: ${Math.max(20, level * 4)}px; }
        }
        
        @keyframes growLeaves {
          from { r: 0; opacity: 0; }
          to { r: ${Math.max(25, level * 8)}px; opacity: 0.8; }
        }
        
        @keyframes growRoots {
          from { stroke-dasharray: 0 100; }
          to { stroke-dasharray: 100 0; }
        }
        
        @keyframes bloom {
          0%, 100% { r: 3; opacity: 0.8; }
          50% { r: 5; opacity: 1; }
        }
        
        @keyframes fly {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          25% { transform: translateX(10px) translateY(-5px); }
          75% { transform: translateX(-5px) translateY(5px); }
        }
        
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }
        
        .delay-200 { animation-delay: 200ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-600 { animation-delay: 600ms; }
        .delay-800 { animation-delay: 800ms; }
      `}</style>
    </div>
  );
}

export default TreeVisualization;