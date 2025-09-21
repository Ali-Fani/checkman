import React from 'react';
import { motion } from 'motion/react';

function Skeleton({ className = '', width = '100%', height = '20px', borderRadius = '4px', ...props }) {
    return (
        <motion.div
            className={`skeleton ${className}`}
            style={{
                width,
                height,
                borderRadius
            }}
            animate={{
                backgroundColor: [
                    'var(--border-light)',
                    'var(--background-light)',
                    'var(--border-light)'
                ]
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
            }}
            {...props}
        />
    );
}

function SkeletonText({ lines = 1, className = '' }) {
    if (lines === 1) {
        return <Skeleton className={`skeleton-text ${className}`} height="16px" />;
    }

    return (
        <div className={`skeleton-text-lines ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    className="skeleton-text-line"
                    height="16px"
                    width={index === lines - 1 ? '60%' : '100%'}
                    style={{ marginBottom: index < lines - 1 ? '8px' : '0' }}
                />
            ))}
        </div>
    );
}

function SkeletonCard({ className = '' }) {
    return (
        <div className={`skeleton-card ${className}`}>
            <div className="skeleton-card-header">
                <Skeleton width="60%" height="24px" />
                <Skeleton width="40%" height="18px" />
            </div>
            <div className="skeleton-card-content">
                <SkeletonText lines={2} />
                <Skeleton width="80%" height="16px" />
            </div>
        </div>
    );
}

function SkeletonTable({ rows = 5, columns = 8 }) {
    return (
        <div className="skeleton-table">
            {/* Header skeleton */}
            <div className="skeleton-table-header">
                {Array.from({ length: columns }).map((_, index) => (
                    <Skeleton key={`header-${index}`} height="20px" width="100%" />
                ))}
            </div>
            {/* Body skeleton */}
            <div className="skeleton-table-body">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="skeleton-table-row">
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <Skeleton
                                key={`cell-${rowIndex}-${colIndex}`}
                                height="16px"
                                width={colIndex === columns - 1 ? '80px' : '100%'}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable };
export default Skeleton;