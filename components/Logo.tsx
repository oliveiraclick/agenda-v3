
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 120 }) => {
  return (
    <img
      src="/logo.png"
      alt="Agende Mais"
      className={className}
      style={{ width: size, height: 'auto' }}
    />
  );
};

export default Logo;
