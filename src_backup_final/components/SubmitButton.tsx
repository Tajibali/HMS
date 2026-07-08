'use client';

import { useEffect, useState } from 'react';

interface SubmitButtonProps {
    isLoading?: boolean;
    isSuccess?: boolean;
    isError?: boolean;
    text?: string;
    loadingText?: string;
    successText?: string;
    errorText?: string;
    disabled?: boolean;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function SubmitButton({
    isLoading = false,
    isSuccess = false,
    isError = false,
    text = 'Submit',
    loadingText = 'Processing...',
    successText = 'Success!',
    errorText = 'Error',
    disabled = false,
    onClick,
    variant = 'primary',
    size = 'md',
    className = '',
}: SubmitButtonProps) {
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (isSuccess) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const variantClasses = {
        primary: 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white',
        secondary: 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white',
        danger: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white',
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={onClick}
                disabled={disabled || isLoading || showSuccess}
                className={`
          relative overflow-hidden
          font-semibold rounded-lg transition-all duration-300
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${isLoading || showSuccess || disabled ? 'opacity-90' : ''}
          ${isError ? 'ring-2 ring-red-400' : ''}
          shadow-lg hover:shadow-xl
          disabled:cursor-not-allowed
          ${className}
        `}
            >
                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{loadingText}</span>
                    </div>
                )}

                {/* Success State */}
                {!isLoading && showSuccess && (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">✅</span>
                        <span>{successText}</span>
                    </div>
                )}

                {/* Error State */}
                {!isLoading && isError && !showSuccess && (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">❌</span>
                        <span>{errorText}</span>
                    </div>
                )}

                {/* Normal State */}
                {!isLoading && !showSuccess && !isError && <span>{text}</span>}

                {/* Background Shimmer Effect */}
                {isLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                )}

                {/* Success Pulse */}
                {showSuccess && (
                    <div className="absolute inset-0 bg-emerald-400/20 animate-pulse" />
                )}
            </button>

            {/* Floating Success Animation */}
            {showSuccess && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-float"
                            style={{
                                left: `${20 + i * 30}%`,
                                top: '50%',
                                animationDelay: `${i * 100}ms`,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
