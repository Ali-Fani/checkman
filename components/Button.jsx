import React, { useState } from 'react';
import { motion } from 'motion/react';

function Button({
    children,
    onClick,
    variant = 'primary',
    size = 'normal',
    disabled = false,
    loading = false,
    className = '',
    ...props
}) {
    const [ripples, setRipples] = useState([]);

    const handleClick = (event) => {
        if (disabled) return;

        // Create ripple effect
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const newRipple = {
            id: Date.now(),
            x,
            y,
            size
        };

        setRipples(prev => [...prev, newRipple]);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
        }, 600);

        // Call original onClick
        if (onClick) {
            onClick(event);
        }
    };

    const getVariantClasses = () => {
        const variants = {
            primary: 'btn-primary',
            secondary: 'btn-secondary',
            danger: 'btn-danger',
            success: 'btn-success'
        };
        return variants[variant] || variants.primary;
    };

    const getSizeClasses = () => {
        const sizes = {
            small: 'btn-small',
            normal: '',
            large: 'btn-large'
        };
        return sizes[size] || sizes.normal;
    };

    const isDisabled = disabled || loading;

    return (
        <motion.button
            className={`btn ${getVariantClasses()} ${getSizeClasses()} ${className} ${isDisabled ? 'btn-disabled' : ''}`}
            onClick={handleClick}
            disabled={isDisabled}
            whileHover={!isDisabled ? { scale: 1.02 } : {}}
            whileTap={!isDisabled ? { scale: 0.98 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            {...props}
        >
            {loading && (
                <motion.span
                    className="btn-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    ⟳
                </motion.span>
            )}
            {!loading && children}
            {!loading && ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className="ripple-effect"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: ripple.size,
                        height: ripple.size
                    }}
                />
            ))}
        </motion.button>
    );
}

export default Button;