'use client'
import { useState } from 'react'

export default function ProductCard({ product, onAddToCart, onOpenFullscreen }) {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
    const [isExpanded, setIsExpanded] = useState(false)
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '')
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '')

    const mediaItems = []
    if (product.image) mediaItems.push({ type: 'image', src: product.image })
    if (product.images?.length > 0) {
        product.images.forEach(img => {
            if (img.trim()) mediaItems.push({ type: 'image', src: img.trim() })
        })
    }
    if (product.video?.trim()) {
        mediaItems.push({ type: 'video', src: product.video.trim() })
    }

    const currentMedia = mediaItems[currentMediaIndex] || { type: 'image', src: product.image }

    const navigateMedia = (direction) => {
        if (mediaItems.length <= 1) return
        let newIndex = currentMediaIndex + direction
        if (newIndex < 0) newIndex = mediaItems.length - 1
        if (newIndex >= mediaItems.length) newIndex = 0
        setCurrentMediaIndex(newIndex)
    }

    const changeMedia = (index) => {
        setCurrentMediaIndex(index)
    }

    const toggleDetails = () => {
        setIsExpanded(!isExpanded)
    }

    const handleAddToCart = () => {
        onAddToCart(product, selectedSize, selectedColor)
        
        // Feedback animation
        const button = document.querySelector(`[data-product-id="${product.id}"] .add-to-cart`)
        if (button) {
            button.innerHTML = '<i class="fas fa-check"></i> ¡Agregado!'
            button.style.backgroundColor = '#2e7d32'
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-cart-plus"></i> Agregar al carrito'
                button.style.backgroundColor = ''
            }, 1000)
        }
    }

    const openFullscreen = () => {
        onOpenFullscreen(currentMedia.type, currentMedia.src, product.description)
    }

    return (
        <div className="product-card" data-product-id={product.id}>
            {product.badge && (
                <div className="product-badge">{product.badge}</div>
            )}
            
            <div className="product-gallery">
                <div className="gallery-container">
                    {currentMedia.type === 'video' ? (
                        <iframe
                            src={currentMedia.src}
                            className="gallery-media"
                            allowFullScreen
                        />
                    ) : (
                        <img
                            src={currentMedia.src}
                            alt={product.name}
                            className="gallery-media"
                            onClick={openFullscreen}
                        />
                    )}
                    
                    <button 
                        className="fullscreen-btn"
                        onClick={openFullscreen}
                    >
                        <i className="fas fa-expand"></i>
                    </button>

                    {mediaItems.length > 1 && (
                        <>
                            <button 
                                className="nav-btn prev-btn"
                                onClick={() => navigateMedia(-1)}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <button 
                                className="nav-btn next-btn"
                                onClick={() => navigateMedia(1)}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </>
                    )}
                </div>

                {mediaItems.length > 1 && (
                    <div className="gallery-controls">
                        {mediaItems.map((media, index) => (
                            <img
                                key={index}
                                src={media.type === 'video' ? (product.image || media.src) : media.src}
                                className={`gallery-thumbnail ${index === currentMediaIndex ? 'active' : ''} ${media.type === 'video' ? 'video-thumb' : ''}`}
                                onClick={() => changeMedia(index)}
                                alt={`Thumbnail ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <span className="product-category">{product.category}</span>
                <div className="product-price">{product.price}</div>
                
                <div 
                    className="product-description" 
                    style={{ display: isExpanded ? 'block' : 'none' }}
                >
                    {product.description}
                </div>

                {(product.sizes?.length > 0 || product.colors?.length > 0) && (
                    <div className="variants" style={{ display: isExpanded ? 'block' : 'none' }}>
                        {product.sizes?.length > 0 && (
                            <>
                                <div className="variant-title">Talla:</div>
                                <div className="variant-options size-options">
                                    {product.sizes.map((size, index) => (
                                        <div
                                            key={index}
                                            className={`size-option ${size === selectedSize ? 'selected' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size.trim()}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {product.colors?.length > 0 && (
                            <>
                                <div className="variant-title">Color:</div>
                                <div className="variant-options color-options">
                                    {product.colors.map((color, index) => (
                                        <div
                                            key={index}
                                            className={`color-option ${color === selectedColor ? 'selected' : ''}`}
                                            style={{ backgroundColor: color.trim() }}
                                            onClick={() => setSelectedColor(color)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                <button 
                    className="add-to-cart"
                    style={{ display: isExpanded ? 'flex' : 'none' }}
                    onClick={handleAddToCart}
                >
                    <i className="fas fa-cart-plus"></i> Agregar al carrito
                </button>

                <button 
                    className={`view-more-btn ${isExpanded ? 'expanded' : ''}`}
                    onClick={toggleDetails}
                >
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                    {isExpanded ? 'Ver menos' : 'Ver más'}
                </button>
            </div>
        </div>
    )
}
