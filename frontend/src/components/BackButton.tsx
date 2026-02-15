import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  className = '', 
  onClick,
  ariaLabel = 'กลับ' 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed top-32 left-32 z-50 bg-[#F5F5DC] text-[#256D45] font-bold text-2xl px-32 py-16 rounded-lg shadow-md hover:bg-[#E8E8D0] transition-colors ${className}`}
      aria-label={ariaLabel}
    >
      กลับ
    </button>
  );
};

export default BackButton;
