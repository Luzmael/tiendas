'use client'
import { getYouTubeEmbedUrl } from '../utils/helpers'

export default function FullscreenModal({ isOpen, mediaType, mediaSrc, description, onClose }) {
    if (!isOpen) return null

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div className={`fullscreen-modal ${isOpen ? 'active' : ''}`} onClick={handleBackdropClick}>
            <span className="close-fullscreen" onClick={onClose}>&times;</span>
            <div className="fullscreen-content">
                {mediaType === 'video' ? (
                    <iframe 
                        src={getYouTubeEmbedUrl(mediaSrc)} 
                        className="gallery-media"
                        allowFullScreen
                    />
                ) : (
                    <img src={mediaSrc} className="gallery-media" alt="Fullscreen" />
                )}
                {description && (
                    <div className="product-description" style={{ color: 'white', marginTop: '15px', maxWidth: '800px', padding: '0 20px' }}>
                        {description}
                    </div>
                )}
            </div>
        </div>
    )
}
