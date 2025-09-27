'use client'
import { useState, useEffect } from 'react'
import ProductCard from './components/ProductCard'
import SearchFilter from './components/SearchFilter'
import Cart from './components/Cart'
import CustomerModal from './components/CustomerModal'
import FullscreenModal from './components/FullscreenModal'
import InstallBanner from './components/InstallBanner'
import CartButton from './components/CartButton'
import { useCart } from './hooks/useCart'
import { useProducts } from './hooks/useProducts'
import { usePWA } from './hooks/usePWA'

export default function Home() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
    const [fullscreenModal, setFullscreenModal] = useState({
        isOpen: false,
        mediaType: '',
        mediaSrc: '',
        description: ''
    })

    const { cart, addToCart, updateQuantity, removeItem, clearCart, getTotalItems, getSubtotal } = useCart()
    const { products, categories, exchangeRate, shippingCost, whatsappNumber, loading, error, filterProducts } = useProducts()
    const { showInstallBanner, installApp, dismissInstall } = usePWA()

    const [filteredProducts, setFilteredProducts] = useState([])

    useEffect(() => {
        setFilteredProducts(filterProducts(searchTerm, selectedCategory))
    }, [products, searchTerm, selectedCategory, filterProducts])

    const handleSearch = (term) => {
        setSearchTerm(term)
    }

    const handleCategoryChange = (category) => {
        setSelectedCategory(category)
    }

    const handleAddToCart = (product, size, color) => {
        addToCart(product, size, color)
    }

    const handleOpenFullscreen = (mediaType, mediaSrc, description) => {
        setFullscreenModal({
            isOpen: true,
            mediaType,
            mediaSrc,
            description
        })
        document.body.classList.add('modal-open')
    }

    const handleCloseFullscreen = () => {
        setFullscreenModal({
            isOpen: false,
            mediaType: '',
            mediaSrc: '',
            description: ''
        })
        document.body.classList.remove('modal-open')
    }

    const handleSendWhatsApp = (customerData) => {
        const totalItems = getTotalItems()
        if (totalItems < 8) {
            alert(`Se requieren al menos 8 productos para realizar el envío. Actualmente tiene ${totalItems} productos.`)
            return
        }

        const subtotal = getSubtotal(exchangeRate)
        const total = totalItems >= 8 ? subtotal + shippingCost : subtotal

        let message = `¡Hola! Me gustaría hacer un pedido:\n\n`
        message += `*Datos del cliente:*\n`
        message += `- Nombre completo: ${customerData.name} ${customerData.lastName}\n`
        message += `- Cédula: ${customerData.id}\n\n`
        message += `*Detalles del pedido:*\n\n`

        cart.forEach(item => {
            message += `- ${item.name}`
            const variants = []
            if (item.size) variants.push(`Talla: ${item.size}`)
            if (item.color) variants.push(`Color: ${item.color}`)
            if (variants.length > 0) message += ` (${variants.join(', ')})`
            message += ` x ${item.quantity} = Bs ${(item.priceValue * item.quantity * exchangeRate).toFixed(2)}\n`
        })

        message += `\n*Subtotal:* Bs ${subtotal.toFixed(2)}`
        if (totalItems >= 8) {
            message += `\n*Envío:* Bs ${shippingCost.toFixed(2)}`
        }
        message += `\n*Total:* Bs ${total.toFixed(2)}\n\n`
        message += 'Por favor confirme disponibilidad y tiempo de entrega. ¡Gracias!'

        const encodedMessage = encodeURIComponent(message)
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

        setIsCustomerModalOpen(false)
        setIsCartOpen(false)
        window.open(whatsappUrl, '_blank')
    }

    const handleCartAction = () => {
        const totalItems = getTotalItems()
        if (totalItems === 0) {
            alert('Tu carrito está vacío')
            return
        }

        if (totalItems < 8) {
            alert(`Se requieren al menos 8 productos para realizar el envío. Actualmente tiene ${totalItems} productos.`)
            return
        }

        setIsCustomerModalOpen(true)
    }

    // Efecto para manejar el escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (fullscreenModal.isOpen) {
                    handleCloseFullscreen()
                }
                if (isCartOpen) {
                    setIsCartOpen(false)
                    document.body.classList.remove('modal-open')
                }
                if (isCustomerModalOpen) {
                    setIsCustomerModalOpen(false)
                    document.body.classList.remove('modal-open')
                }
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [fullscreenModal.isOpen, isCartOpen, isCustomerModalOpen])

    if (loading) {
        return (
            <div className="catalog">
                <div className="loading-message">Cargando productos...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="catalog">
                <div className="error-message">
                    <i className="fas fa-exclamation-triangle"></i> {error}
                </div>
            </div>
        )
    }

    return (
        <>
            <h1>Digital Catalog Pro</h1>
            
            <SearchFilter 
                categories={categories}
                onSearch={handleSearch}
                onCategoryChange={handleCategoryChange}
            />
            
            <div className="catalog">
                {filteredProducts.length === 0 ? (
                    <div className="no-results">
                        No se encontraron productos que coincidan con tu búsqueda
                    </div>
                ) : (
                    filteredProducts.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            onAddToCart={handleAddToCart}
                            onOpenFullscreen={handleOpenFullscreen}
                        />
                    ))
                )}
            </div>

            <CartButton 
                itemCount={getTotalItems()} 
                onClick={() => {
                    setIsCartOpen(true)
                    document.body.classList.add('modal-open')
                }} 
            />

            <Cart
                isOpen={isCartOpen}
                onClose={() => {
                    setIsCartOpen(false)
                    document.body.classList.remove('modal-open')
                }}
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onClearCart={clearCart}
                onSendWhatsApp={handleCartAction}
                exchangeRate={exchangeRate}
                shippingCost={shippingCost}
            />

            <CustomerModal
                isOpen={isCustomerModalOpen}
                onClose={() => {
                    setIsCustomerModalOpen(false)
                    document.body.classList.remove('modal-open')
                }}
                onSubmit={handleSendWhatsApp}
                cart={cart}
                exchangeRate={exchangeRate}
                shippingCost={shippingCost}
                whatsappNumber={whatsappNumber}
            />

            <FullscreenModal
                isOpen={fullscreenModal.isOpen}
                mediaType={fullscreenModal.mediaType}
                mediaSrc={fullscreenModal.mediaSrc}
                description={fullscreenModal.description}
                onClose={handleCloseFullscreen}
            />

            <InstallBanner
                isOpen={showInstallBanner}
                onInstall={installApp}
                onDismiss={dismissInstall}
            />

            {/* Segundo banner de instalación (como en el original) */}
            <div id="installBanner" style={{ display: 'none' }}>
                <div className="install-content">
                    <h3>¿Quieres agregar esta tienda a tu pantalla principal?</h3>
                    <p>Presiona el ícono de compartir <span style={{ fontSize: '20px' }}>🔗</span> y selecciona "Agregar a pantalla de inicio".</p>
                    <button onClick={() => document.getElementById('installBanner').style.display = 'none'}>
                        Cerrar
                    </button>
                </div>
            </div>
        </>
    )
}
