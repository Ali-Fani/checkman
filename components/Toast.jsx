import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

function Toast({ message, type = 'info', duration = 3000, onClose }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for exit animation
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getToastStyles = () => {
        const baseStyles = {
            background: 'var(--background-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px var(--shadow-medium)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '400px',
            wordWrap: 'break-word',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        };

        const typeStyles = {
            success: {
                borderColor: 'var(--accent-green)',
                background: 'rgba(5, 150, 105, 0.05)'
            },
            error: {
                borderColor: 'var(--accent-orange)',
                background: 'rgba(234, 88, 12, 0.05)'
            },
            warning: {
                borderColor: 'var(--accent-orange)',
                background: 'rgba(234, 88, 12, 0.05)'
            },
            info: {
                borderColor: 'var(--primary-blue)',
                background: 'rgba(37, 99, 235, 0.05)'
            }
        };

        return { ...baseStyles, ...typeStyles[type] };
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
            default:
                return 'ℹ';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 300, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    style={getToastStyles()}
                >
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>
                        {getIcon()}
                    </span>
                    <span style={{ flex: 1 }}>
                        {message}
                    </span>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '18px',
                            padding: '0',
                            marginLeft: '8px',
                            flexShrink: 0
                        }}
                    >
                        ×
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default Toast;