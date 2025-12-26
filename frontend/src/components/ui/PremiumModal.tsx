import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import './PremiumModal.css'

interface PremiumModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    subtitle?: string
    children: React.ReactNode
    footer?: React.ReactNode
    width?: string
}

export default function PremiumModal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    width
}: PremiumModalProps) {

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="premium-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
            <div
                className="premium-modal-card"
                onClick={(e) => e.stopPropagation()}
                style={width ? { width, maxWidth: width } : undefined}
            >
                <header className="premium-modal-header">
                    <div>
                        <h3 className="premium-modal-title">{title}</h3>
                        {subtitle && <p className="premium-modal-subtitle">{subtitle}</p>}
                    </div>
                    <button
                        type="button"
                        className="premium-modal-close"
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        <X size={20} />
                    </button>
                </header>

                <div className="premium-modal-content">
                    {children}
                </div>

                {footer && (
                    <footer className="premium-modal-footer">
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    )
}
