
import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
    const sizeClass = size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : styles.md;
    return (
        <div className={`${styles.spinner} ${sizeClass} ${className}`} role="status" aria-label="loading" />
    );
};

export default LoadingSpinner;
