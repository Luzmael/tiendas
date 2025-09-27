// pages/tienda-la-paz.js
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Head from 'next/head'

// Configuración específica de esta tienda Amoo las tetas grandes
const STORE_CONFIG = {
  uuid: 'a327e09a-0f45-4327-abb6-13e0f1fab85d',
  name: 'Tienda la Paz',
  whatsappDefault: '584149834667'
}

const supabaseUrl = 'https://bekzfacymgaytpgfqrzg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJla3pmYWN5bWdheXRwZ2ZxcnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMjAzNjcsImV4cCI6MjA2OTY5NjM2N30.R1hbWLGSvp6LcqqsDd-ibTGMS_mrGNl0oP-Ah-0iSt8'
const supabaseClient = createClient(supabaseUrl, supabaseKey)

export default function TiendaLaPaz() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [fullscreenMedia, setFullscreenMedia] = useState(null)
  const [currentExchangeRate, setCurrentExchangeRate] = useState(115.33)
  const [shippingCost, setShippingCost] = useState(0)
  const [whatsappNumber, setWhatsappNumber] = useState(STORE_CONFIG.whatsappDefault)
  const [customerName, setCustomerName] = useState('')
  const [customerLastName, setCustomerLastName] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [nameError, setNameError] = useState(false)
  const [lastNameError, setLastNameError] = useState(false)
  const [idError, setIdError] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  // Efectos
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem(`cart_${STORE_CONFIG.uuid}`)) || []
    setCart(savedCart)
    loadAppSettings()
    loadProducts()
    loadWhatsAppNumber()

    // PWA Installation
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBanner(true)
    })
  }, [])

  useEffect(() => {
    localStorage.setItem(`cart_${STORE_CONFIG.uuid}`, JSON.stringify(cart))
  }, [cart])

  // Funciones de carga de datos
  const loadWhatsAppNumber = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('whatsapp_numbers')
        .select('phone_number, is_active')
        .eq('id', STORE_CONFIG.uuid)
        .eq('is_active', true)
        .single()

      if (error) throw error
      if (data?.phone_number) {
        setWhatsappNumber(data.phone_number)
      }
    } catch (error) {
      console.error("Error al cargar número:", error)
    }
  }

  const loadAppSettings = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('app_settings')
        .select('*')
        .limit(1)

      if (error) throw error
      if (data && data.length > 0) {
        setCurrentExchangeRate(parseFloat(data[0].rate) || 115.33)
        setShippingCost(parseFloat(data[0].shipping_cost) || 0)
      }
    } catch (error) {
      console.error("Error al cargar configuraciones:", error)
    }
  }

  const loadProducts = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('store_uuid', STORE_CONFIG.uuid)

      if (error) throw error
      
      if (data && data.length > 0) {
        const processedProducts = data.map(product => ({
          id: product.id,
          name: product.name || 'Producto sin nombre',
          description: product.description || '',
          price: `Bs ${(parseFloat(product.price?.replace(/[^0-9.]/g, '') || 0) * currentExchangeRate).toFixed(2)}`,
          originalPrice: product.price || '$0.00',
          priceValue: parseFloat(product.price?.replace(/[^0-9.]/g, '') || 0),
          image: product.image || 'https://via.placeholder.com/500',
          images: product.images || [],
          video: product.video || '',
          sizes: product.sizes || [],
          colors: product.colors || [],
          badge: product.badge || '',
          category: product.category || 'Sin categoría'
        }))

        setProducts(processedProducts)
        setCategories([...new Set(data.map(p => p.category))])
      }
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }

  // Funciones del carrito
  const addToCart = (productId, productName, price, image, selectedSize, selectedColor) => {
    const product = products.find(p => p.id === productId)
    if (!product) return
    
    const existingItemIndex = cart.findIndex(item => 
      item.id === productId && 
      item.size === selectedSize && 
      item.color === selectedColor
    )
    
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += 1
      setCart(updatedCart)
    } else {
      setCart([...cart, {
        id: productId,
        name: productName,
        price: price,
        image: image,
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
        priceValue: product.priceValue
      }])
    }
  }

  const updateQuantity = (index, newQuantity) => {
    const updatedCart = [...cart]
    updatedCart[index].quantity = parseInt(newQuantity) || 1
    setCart(updatedCart)
  }

  const increaseQuantity = (index) => {
    const updatedCart = [...cart]
    updatedCart[index].quantity += 1
    setCart(updatedCart)
  }

  const decreaseQuantity = (index) => {
    const updatedCart = [...cart]
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1
    } else {
      updatedCart.splice(index, 1)
    }
    setCart(updatedCart)
  }

  const removeItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index)
    setCart(updatedCart)
  }

  const clearCart = () => {
    if (cart.length === 0) return
    if (confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
      setCart([])
    }
  }

  // Funciones de búsqueda y filtrado
  const filterProducts = () => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === '' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }

  // Funciones de galería
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return ''
    if (url.includes('youtube.com/embed')) return url
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    
    return (match && match[2].length === 11) 
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0` 
      : url
  }

  const openFullscreen = (type, src, description = '') => {
    setFullscreenMedia({ type, src, description })
    document.body.classList.add('modal-open')
  }

  const closeFullscreen = () => {
    setFullscreenMedia(null)
    document.body.classList.remove('modal-open')
  }

  // Funciones de WhatsApp
  const validateCustomerInfo = () => {
    let isValid = true
    
    if (!customerName.trim()) {
      setNameError(true)
      isValid = false
    } else {
      setNameError(false)
    }
    
    if (!customerLastName.trim()) {
      setLastNameError(true)
      isValid = false
    } else {
      setLastNameError(false)
    }
    
    if (!customerId.trim() || !/^\d+$/.test(customerId)) {
      setIdError(true)
      isValid = false
    } else {
      setIdError(false)
    }
    
    return isValid
  }

  const sendWhatsAppWithCustomerInfo = () => {
    if (!validateCustomerInfo()) return

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
    if (totalItems < 8) {
      alert(`Se requieren al menos 8 productos para realizar el envío. Actualmente tiene ${totalItems} productos.`)
      return
    }

    let message = `¡Hola! Me gustaría hacer un pedido:\n\n`
    message += `*Datos del cliente:*\n`
    message += `- Nombre completo: ${customerName} ${customerLastName}\n`
    message += `- Cédula: ${customerId}\n\n`
    message += `*Detalles del pedido:*\n\n`
    
    cart.forEach(item => {
      message += `- ${item.name}`
      const variants = []
      if (item.size) variants.push(`Talla: ${item.size}`)
      if (item.color) variants.push(`Color: ${item.color}`)
      if (variants.length > 0) message += ` (${variants.join(', ')})`
      const itemTotal = (item.priceValue * item.quantity * currentExchangeRate)
      message += ` x ${item.quantity} = Bs ${itemTotal.toFixed(2)}\n`
    })

    const subtotal = cart.reduce((sum, item) => sum + (item.priceValue * item.quantity * currentExchangeRate), 0)
    message += `\n*Subtotal:* Bs ${subtotal.toFixed(2)}`

    if (totalItems >= 8) {
      message += `\n*Envío:* Bs ${shippingCost.toFixed(2)}`
      message += `\n*Total:* Bs ${(subtotal + shippingCost).toFixed(2)}\n\n`
    } else {
      message += `\n*Total:* Bs ${subtotal.toFixed(2)}\n\n`
    }

    message += 'Por favor confirme disponibilidad y tiempo de entrega. ¡Gracias!'

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

    setIsCustomerModalOpen(false)
    setIsCartOpen(false)
    setCustomerName('')
    setCustomerLastName('')
    setCustomerId('')
    
    window.open(whatsappUrl, '_blank')
  }

  const sendWhatsApp = () => {
    if (cart.length === 0) {
      alert('Tu carrito está vacío')
      return
    }

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
    if (totalItems < 8) {
      alert(`Se requieren al menos 8 productos para realizar el envío. Actualmente tiene ${totalItems} productos.`)
      return
    }

    setIsCustomerModalOpen(true)
  }

  // PWA Functions
  const installApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult) => {
        setDeferredPrompt(null)
        setShowInstallBanner(false)
      })
    }
  }

  const dismissInstall = () => {
    setShowInstallBanner(false)
  }

  // Componente ProductCard interno
  const ProductCard = ({ product }) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
    const [isExpanded, setIsExpanded] = useState(false)
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')

    const mediaItems = []
    if (product.image) mediaItems.push({ type: 'image', src: product.image })
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (img.trim()) mediaItems.push({ type: 'image', src: img.trim() })
      })
    }
    if (product.video && product.video.trim()) {
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

    const selectVariant = (value, type) => {
      if (type === 'size') {
        setSelectedSize(value)
      } else {
        setSelectedColor(value)
      }
    }

    const toggleProductDetails = () => {
      setIsExpanded(!isExpanded)
    }

    const handleAddToCart = () => {
      addToCart(product.id, product.name, product.price, product.image, selectedSize, selectedColor)
      
      // Feedback animation
      const button = document.querySelector(`[data-product-id="${product.id}"] .add-to-cart`)
      if (button) {
        button.innerHTML = '<i class="fas fa-check"></i> ¡Agregado!'
        button.style.background = '#2e7d32'
        setTimeout(() => {
          button.innerHTML = '<i class="fas fa-cart-plus"></i> Agregar al carrito'
          button.style.background = ''
        }, 1000)
      }
    }

    return (
      <div className="product-card" data-product-id={product.id}>
        {product.badge && <div className="product-badge">{product.badge}</div>}
        
        <div className="product-gallery">
          <div className="gallery-container">
            {currentMedia.type === 'video' ? (
              <iframe 
                src={getYouTubeEmbedUrl(currentMedia.src)}
                className="gallery-media"
                allowFullScreen
              />
            ) : (
              <img 
                src={currentMedia.src} 
                alt={product.name}
                className="gallery-media"
                onClick={() => openFullscreen('image', currentMedia.src, product.description)}
              />
            )}
            
            {mediaItems.length > 1 && (
              <>
                <button className="nav-btn prev-btn" onClick={() => navigateMedia(-1)}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button className="nav-btn next-btn" onClick={() => navigateMedia(1)}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </>
            )}
            
            <button 
              className="fullscreen-btn" 
              onClick={() => openFullscreen(currentMedia.type, currentMedia.src, product.description)}
            >
              <i className="fas fa-expand"></i>
            </button>
          </div>
          
          {mediaItems.length > 1 && (
            <div className="gallery-controls">
              {mediaItems.map((media, index) => (
                <img
                  key={index}
                  src={media.type === 'video' ? (product.image || media.src) : media.src}
                  className={`gallery-thumbnail ${index === currentMediaIndex ? 'active' : ''} ${media.type === 'video' ? 'video-thumb' : ''}`}
                  onClick={() => setCurrentMediaIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <span className="product-category">{product.category}</span>
          <div className="product-price">{product.price}</div>
          
          <div className="product-description" style={{ display: isExpanded ? 'block' : 'none' }}>
            {product.description}
          </div>
          
          {(product.sizes?.length > 0 || product.colors?.length > 0) && (
            <div className="variants" style={{ display: isExpanded ? 'block' : 'none' }}>
              {product.sizes?.length > 0 && (
                <>
                  <div className="variant-title">Talla:</div>
                  <div className="variant-options size-options">
                    {product.sizes.map((size, i) => (
                      <div 
                        key={i}
                        className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                        onClick={() => selectVariant(size, 'size')}
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
                    {product.colors.map((color, i) => (
                      <div 
                        key={i}
                        className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color.trim() }}
                        onClick={() => selectVariant(color, 'color')}
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
            onClick={toggleProductDetails}
          >
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i> 
            {isExpanded ? 'Ver menos' : 'Ver más'}
          </button>
        </div>
      </div>
    )
  }

  const filteredProducts = filterProducts()
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + (item.priceValue * item.quantity * currentExchangeRate), 0)
  const total = totalItems >= 8 ? subtotal + shippingCost : subtotal

  return (
    <>
      <Head>
        <title>Digital Catalog {STORE_CONFIG.name}</title>
        <meta name="description" content={`Catálogo digital de ${STORE_CONFIG.name}`} />
        <meta name="theme-color" content="#007bff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LaPaz" />
        <link rel="apple-touch-icon" href="/Copilot (1).png" />
      </Head>

      <div className="container">
        <h1>Digital Catalog Pro</h1>
        
        <div className="search-filter-container">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="category-filter">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="catalog">
          {filteredProducts.length === 0 ? (
            <div className="no-results">No se encontraron productos que coincidan con tu búsqueda</div>
          ) : (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

        {/* Modal Fullscreen */}
        {fullscreenMedia && (
          <div className="fullscreen-modal active">
            <span className="close-fullscreen" onClick={closeFullscreen}>&times;</span>
            <div className="fullscreen-content">
              {fullscreenMedia.type === 'video' ? (
                <iframe 
                  src={getYouTubeEmbedUrl(fullscreenMedia.src)}
                  className="gallery-media"
                  allowFullScreen
                />
              ) : (
                <img src={fullscreenMedia.src} className="gallery-media" />
              )}
              {fullscreenMedia.description && (
                <div className="product-description" style={{ color: 'white', marginTop: '15px', maxWidth: '800px', padding: '0 20px' }}>
                  {fullscreenMedia.description}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Banner de instalación PWA */}
        {showInstallBanner && (
          <div id="installBanner">
            <div className="install-content">
              <h3>¿Quieres agregar esta tienda a tu pantalla principal?</h3>
              <button id="btnInstall" onClick={installApp}>Agregar</button>
              <button id="btnDismiss" onClick={dismissInstall}>Ahora no</button>
            </div>
          </div>
        )}

        {/* Botón del carrito */}
        <div className="cart-button" onClick={() => setIsCartOpen(true)}>
          <i className="fas fa-shopping-cart"></i>
          <span className="cart-count">{totalItems}</span>
        </div>

        {/* Modal del Carrito */}
        {isCartOpen && (
          <div className="cart-overlay active" onClick={(e) => e.target === e.currentTarget && setIsCartOpen(false)}>
            <div className="cart-container">
              <div className="cart-header">
                <h2 className="cart-title">Tu carrito</h2>
                <button className="close-cart" onClick={() => setIsCartOpen(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="cart-items">
                {cart.length === 0 ? (
                  <p className="empty-cart-message">Tu carrito está vacío</p>
                ) : (
                  <>
                    {totalItems < 8 && (
                      <div className="min-order-message">
                        ⚠️ Mínimo de pedido: 8 productos (actual: {totalItems})
                      </div>
                    )}
                    {cart.map((item, index) => (
                      <div key={index} className="cart-item">
                        <img src={item.image} alt={item.name} className="cart-item-image" />
                        <div className="item-details">
                          <div className="item-name">{item.name}</div>
                          {(item.size || item.color) && (
                            <div className="item-variants">
                              {[item.size && `Talla: ${item.size}`, item.color && `Color: ${item.color}`]
                                .filter(Boolean).join(' • ')}
                            </div>
                          )}
                          <div className="item-price">{item.price}</div>
                          <div className="item-quantity">
                            <button className="quantity-btn minus" onClick={() => decreaseQuantity(index)}>-</button>
                            <input 
                              type="number" 
                              min="1" 
                              value={item.quantity} 
                              className="quantity-input"
                              onChange={(e) => updateQuantity(index, e.target.value)}
                            />
                            <button className="quantity-btn plus" onClick={() => increaseQuantity(index)}>+</button>
                            <button className="remove-item" onClick={() => removeItem(index)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div className="cart-total">
                Subtotal: <span id="cartSubtotal">Bs {subtotal.toFixed(2)}</span><br />
                {totalItems >= 8 && (
                  <div className="shipping-info visible">
                    Envío: <span id="cartShipping">Bs {shippingCost.toFixed(2)}</span><br />
                  </div>
                )}
                <strong>Total: <span id="cartTotal">Bs {total.toFixed(2)}</span></strong>
              </div>
              <div className="cart-actions">
                <button className="clear-cart" onClick={clearCart}>
                  <i className="fas fa-trash"></i> Vaciar carrito
                </button>
                <button 
                  className={`send-whatsapp ${totalItems < 8 ? 'disabled' : ''}`}
                  onClick={sendWhatsApp}
                  disabled={totalItems < 8}
                >
                  <i className="fab fa-whatsapp"></i> Enviar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal del Cliente */}
        {isCustomerModalOpen && (
          <div className="customer-modal active" onClick={(e) => e.target === e.currentTarget && setIsCustomerModalOpen(false)}>
            <div className="customer-container">
              <div className="customer-header">
                <h3 className="customer-title">Complete sus datos</h3>
                <p className="customer-instructions">Por favor ingrese su información personal para procesar el pedido</p>
              </div>
              
              <form className="customer-form" onSubmit={(e) => { e.preventDefault(); sendWhatsAppWithCustomerInfo() }}>
                <div className="form-group">
                  <label htmlFor="customerName">Nombre*</label>
                  <input 
                    type="text" 
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ingrese su nombre" 
                  />
                  {nameError && <div className="form-error" id="nameError">Por favor ingrese su nombre</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="customerLastName">Apellido*</label>
                  <input 
                    type="text" 
                    id="customerLastName"
                    value={customerLastName}
                    onChange={(e) => setCustomerLastName(e.target.value)}
                    placeholder="Ingrese su apellido" 
                  />
                  {lastNameError && <div className="form-error" id="lastNameError">Por favor ingrese su apellido</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="customerId">Número de Cédula*</label>
                  <input 
                    type="text" 
                    id="customerId"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ingrese su cédula" 
                  />
                  {idError && <div className="form-error" id="idError">Por favor ingrese un número de cédula válido</div>}
                </div>
                
                <div className="customer-actions">
                  <button 
                    type="button" 
                    className="customer-btn cancel" 
                    onClick={() => setIsCustomerModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="customer-btn submit">
                    Enviar Pedido
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Arial', sans-serif;
        }

        body {
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          padding: 20px;
          transition: all 0.3s;
          color: #f1f1f1;
        }

        body.modal-open {
          overflow: hidden;
        }

        h1 {
          text-align: center;
          margin-bottom: 30px;
          font-size: 2.8rem;
          background: linear-gradient(45deg, #00dbde, #fc00ff, #00dbde);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientText 3s linear infinite;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
        }

        .search-filter-container {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 25px;
          justify-content: center;
        }

        .search-box {
          flex: 1;
          min-width: 250px;
          max-width: 500px;
          position: relative;
        }

        .search-box input {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 30px;
          font-size: 16px;
          padding-left: 45px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          box-shadow: 0 0 15px rgba(0, 219, 222, 0.3);
          transition: all 0.3s;
        }

        .search-box input:focus {
          outline: none;
          border-color: #00dbde;
          box-shadow: 0 0 20px rgba(0, 219, 222, 0.6);
        }

        .search-box input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .search-box i {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.7);
        }

        .category-filter {
          flex: 1;
          min-width: 200px;
          max-width: 300px;
          position: relative;
        }

        .category-filter select {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 30px;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          box-shadow: 0 0 15px rgba(0, 219, 222, 0.3);
          cursor: pointer;
          transition: all 0.3s;
          appearance: none;
        }

        .category-filter::after {
          content: '▼';
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.7);
          pointer-events: none;
          font-size: 12px;
        }

        .category-filter select:focus {
          outline: none;
          border-color: #00dbde;
          box-shadow: 0 0 20px rgba(0, 219, 222, 0.6);
        }

        .catalog {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px;
          margin-bottom: 100px;
        }

        .product-card {
          background: rgba(15, 15, 35, 0.7);
          border-radius: 16px;
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          transition: transform 0.3s;
          position: relative;
        }

        .product-card::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          z-index: -1;
          background: linear-gradient(45deg, #00dbde, #fc00ff, #00dbde, #fc00ff);
          background-size: 400% 400%;
          border-radius: 18px;
          animation: borderAnimation 3s ease infinite;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
        }

        .product-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: linear-gradient(45deg, #ff6b6b, #ff0e0e);
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          z-index: 10;
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
        }

        .product-gallery {
          position: relative;
          width: 100%;
          height: 220px;
          background: rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .gallery-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .gallery-media {
          width: 100%;
          height: 100%;
          object-fit: contain;
          cursor: pointer;
          transition: opacity 0.3s;
        }

        iframe.gallery-media {
          border: none;
        }

        .gallery-controls {
          position: absolute;
          bottom: 5px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 5px;
          z-index: 5;
          padding: 3px;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(5px);
          border-radius: 15px;
          margin: 0 auto;
          width: fit-content;
          max-width: 90%;
          overflow-x: auto;
        }

        .gallery-thumbnail {
          width: 30px;
          height: 30px;
          border-radius: 3px;
          object-fit: cover;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.3);
          transition: all 0.2s;
          background: rgba(255, 255, 255, 0.2);
          opacity: 0.8;
        }

        .gallery-thumbnail:hover {
          opacity: 1;
          transform: scale(1.05);
          box-shadow: 0 0 8px rgba(0, 219, 222, 0.7);
        }

        .gallery-thumbnail.active {
          border-color: #00dbde;
          transform: scale(1.1);
          opacity: 1;
          box-shadow: 0 0 10px rgba(0, 219, 222, 0.9);
        }

        .gallery-thumbnail.video-thumb {
          position: relative;
        }

        .gallery-thumbnail.video-thumb::after {
          content: '▶';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          text-shadow: 0 0 3px rgba(0,0,0,0.5);
          font-size: 10px;
        }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.6);
          color: white;
          border: none;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          font-size: 16px;
          opacity: 0.8;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }

        .nav-btn:hover {
          background: rgba(0,0,0,0.8);
          transform: translateY(-50%) scale(1.1);
          opacity: 1;
          box-shadow: 0 0 15px rgba(0, 219, 222, 0.5);
        }

        .prev-btn {
          left: 10px;
        }

        .next-btn {
          right: 10px;
        }

        .fullscreen-btn {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(0,0,0,0.6);
          color: white;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          opacity: 0.8;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }

        .fullscreen-btn:hover {
          background: rgba(0,0,0,0.8);
          transform: scale(1.1);
          opacity: 1;
          box-shadow: 0 0 15px rgba(0, 219, 222, 0.5);
        }

        .fullscreen-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.95);
          z-index: 2000;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .fullscreen-modal.active {
          display: flex;
          opacity: 1;
        }

        .fullscreen-content {
          max-width: 90%;
          max-height: 90%;
          position: relative;
        }

        .fullscreen-content img, 
        .fullscreen-content iframe {
          max-width: 100%;
          max-height: 90vh;
          display: block;
          margin: 0 auto;
          border-radius: 8px;
          box-shadow: 0 5px 35px rgba(0, 219, 222, 0.4);
        }

        .close-fullscreen {
          position: absolute;
          top: 20px;
          right: 20px;
          color: white;
          font-size: 30px;
          cursor: pointer;
          background: rgba(0,0,0,0.6);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          z-index: 10;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
        }

        .close-fullscreen:hover {
          background: rgba(255,255,255,0.2);
          transform: rotate(90deg);
          box-shadow: 0 0 20px rgba(0, 219, 222, 0.5);
        }

        .product-info {
          padding: 18px;
        }

        .product-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #ffffff;
        }

        .product-category {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 5px;
          display: inline-block;
          background: rgba(255, 255, 255, 0.1);
          padding: 3px 8px;
          border-radius: 12px;
          backdrop-filter: blur(5px);
        }

        .product-price {
          color: #ff6b6b;
          font-weight: bold;
          font-size: 20px;
          margin-bottom: 15px;
          text-shadow: 0 0 8px rgba(255, 107, 107, 0.5);
        }

        .product-description {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 15px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          display: none;
        }

        .variants {
          margin-bottom: 15px;
          display: none;
        }

        .variant-title {
          font-size: 14px;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.9);
        }

        .variant-options {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }

        .size-option {
          padding: 6px 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .size-option:hover {
          border-color: #00dbde;
          box-shadow: 0 0 10px rgba(0, 219, 222, 0.5);
        }

        .size-option.selected {
          background: #00dbde;
          color: white;
          border-color: #00dbde;
          box-shadow: 0 0 15px rgba(0, 219, 222, 0.7);
        }

        .color-option {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s;
        }

        .color-option:hover {
          border-color: #00dbde;
          box-shadow: 0 0 10px rgba(0, 219, 222, 0.5);
          transform: scale(1.1);
        }

        .color-option.selected {
          border-color: #ffffff;
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(0, 219, 222, 0.7);
        }

        .add-to-cart {
          background: linear-gradient(45deg, #00dbde, #fc00ff);
          color: white;
          border: none;
          padding: 12px 15px;
          width: 100%;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          display: none;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 15px rgba(0, 219, 222, 0.5);
        }

        .add-to-cart::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: rotate(45deg);
          transition: all 0.5s ease;
        }

        .add-to-cart:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0, 219, 222, 0.7);
        }

        .add-to-cart:hover::before {
          left: 50%;
          top: 50%;
        }

        .add-to-cart:active {
          transform: scale(0.98);
        }

        .add-to-cart i {
          font-size: 14px;
        }

        .view-more-btn {
          background-color: rgba(0, 0, 0, 0.8);
          color: #ffffff;
          border: none;
          padding: 10px 15px;
          width: 100%;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 10px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }

        .view-more-btn::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: rotate(45deg);
          transition: all 0.5s ease;
        }

        .view-more-btn:hover {
          background-color: #000000;
          box-shadow: 0 0 15px rgba(0, 219, 222, 0.5);
        }

        .view-more-btn:hover::before {
          left: 50%;
          top: 50%;
        }

        .view-more-btn i {
          transition: transform 0.3s;
        }

        .view-more-btn.expanded i {
          transform: rotate(180deg);
        }

        .cart-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: linear-gradient(45deg, #00dbde, #fc00ff);
          color: white;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 5px 20px rgba(0, 219, 222, 0.5);
          z-index: 100;
          transition: all 0.3s;
          border: none;
        }

        .cart-button:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(0, 219, 222, 0.7);
        }

        .cart-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #ff6b6b;
          color: white;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 0 10px rgba(255, 107, 107, 0.7);
        }

        .cart-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: none;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.3s ease;
          backdrop-filter: blur(5px);
        }

        .cart-overlay.active {
          display: flex;
          opacity: 1;
        }

        .cart-container {
          background-color: rgba(15, 15, 35, 0.95);
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          transform: translateY(20px);
          transition: transform 0.3s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          overflow: hidden;
          position: relative;
        }

        .cart-container::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          z-index: -1;
          background: linear-gradient(45deg, #00dbde, #fc00ff, #00dbde, #fc00ff);
          background-size: 400% 400%;
          border-radius: 18px;
          animation: borderAnimation 3s ease infinite;
        }

        .cart-overlay.active .cart-container {
          transform: translateY(0);
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          position: sticky;
          top: 0;
          background: rgba(15, 15, 35, 0.95);
          z-index: 1;
          backdrop-filter: blur(10px);
        }

        .cart-title {
          font-size: 24px;
          font-weight: bold;
          color: #ffffff;
          margin: 0;
        }

        .close-cart {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.3s;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .close-cart:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
          transform: rotate(90deg);
        }

        .cart-items {
          overflow-y: auto;
          flex-grow: 1;
          padding: 0 20px;
        }

        .cart-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
        }

        .cart-item:last-child {
          border-bottom: none;
        }

        .cart-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .cart-item-image {
          width: 60px;
          height: 60px;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 5px;
          flex-shrink: 0;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        }

        .item-details {
          flex: 1;
          min-width: 0;
        }

        .item-name {
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-variants {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          margin: 3px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-price {
          color: #ff6b6b;
          font-size: 14px;
          font-weight: bold;
          text-shadow: 0 0 5px rgba(255, 107, 107, 0.5);
        }

        .item-quantity {
          display: flex;
          align-items: center;
          margin-top: 5px;
        }

        .quantity-input {
          width: 50px;
          text-align: center;
          padding: 5px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          margin: 0 5px;
          font-weight: bold;
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .quantity-btn {
          background-color: rgba(255, 255, 255, 0.1);
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          font-size: 14px;
          color: white;
        }

        .quantity-btn:hover {
          background-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 8px rgba(0, 219, 222, 0.5);
        }

        .remove-item {
          background: none;
          border: none;
          color: #ff6b6b;
          cursor: pointer;
          margin-left: 15px;
          transition: all 0.3s;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 14px;
        }

        .remove-item:hover {
          background: rgba(230, 57, 70, 0.1);
          transform: scale(1.1);
          box-shadow: 0 0 8px rgba(255, 107, 107, 0.5);
        }

        .cart-total {
          font-size: 20px;
          font-weight: bold;
          text-align: right;
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          position: sticky;
          bottom: 70px;
          background: rgba(15, 15, 35, 0.95);
          margin-top: auto;
          color: #ffffff;
          backdrop-filter: blur(10px);
        }

        .shipping-info {
          display: none;
        }

        .shipping-info.visible {
          display: block;
        }

        .cart-actions {
          display: flex;
          justify-content: space-between;
          padding: 15px 20px;
          position: sticky;
          bottom: 0;
          background: rgba(15, 15, 35, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          gap: 15px;
          backdrop-filter: blur(10px);
        }

        .clear-cart, .send-whatsapp {
          padding: 14px 22px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex: 1;
          font-size: 15px;
        }

        .clear-cart {
          background-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .clear-cart:hover {
          background-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }

        .send-whatsapp {
          background: linear-gradient(45deg, #25D366, #128C7E);
          color: white;
        }

        .send-whatsapp:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(37, 211, 102, 0.5);
        }

        .send-whatsapp.disabled {
          background: rgba(255, 255, 255, 0.1);
          cursor: not-allowed;
          opacity: 0.7;
          transform: none;
          box-shadow: none;
        }

        .empty-cart-message {
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          padding: 40px 0;
          font-size: 16px;
        }

        .no-results {
          text-align: center;
          grid-column: 1 / -1;
          padding: 40px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 18px;
        }

        .error-message {
          text-align: center;
          grid-column: 1 / -1;
          padding: 20px;
          color: #ff6b6b;
          font-size: 16px;
          background-color: rgba(255, 107, 107, 0.1);
          border-radius: 8px;
          margin: 20px;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }

        .number-selector {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }

        .number-selector select {
          flex: 1;
          padding: 8px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 5px;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .min-order-message {
          text-align: center;
          color: #ff6b6b;
          font-size: 14px;
          margin: 10px 0;
          padding: 10px;
          background-color: rgba(255, 107, 107, 0.1);
          border-radius: 5px;
          font-weight: bold;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }

        .customer-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: none;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          opacity: 0;
          transition: opacity 0.3s ease;
          backdrop-filter: blur(5px);
        }

        .customer-modal.active {
          display: flex;
          opacity: 1;
        }

        .customer-container {
          background-color: rgba(15, 15, 35, 0.95);
          width: 90%;
          max-width: 500px;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          transform: translateY(20px);
          transition: transform 0.3s ease;
          position: relative;
        }

        .customer-container::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          z-index: -1;
          background: linear-gradient(45deg, #00dbde, #fc00ff, #00dbde, #fc00ff);
          background-size: 400% 400%;
          border-radius: 18px;
          animation: borderAnimation 3s ease infinite;
        }

        .customer-modal.active .customer-container {
          transform: translateY(0);
        }

        .customer-header {
          margin-bottom: 20px;
          text-align: center;
        }

        .customer-title {
          font-size: 22px;
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 10px;
        }

        .customer-instructions {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .customer-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .form-group label {
          font-weight: bold;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
        }

        .form-group input {
          padding: 12px 15px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s;
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .form-group input:focus {
          outline: none;
          border-color: #00dbde;
          box-shadow: 0 0 10px rgba(0, 219, 222, 0.5);
        }

        .customer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .customer-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
        }

        .customer-btn.cancel {
          background-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .customer-btn.cancel:hover {
          background-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }

        .customer-btn.submit {
          background: linear-gradient(45deg, #00dbde, #fc00ff);
          color: white;
        }

        .customer-btn.submit:hover {
          box-shadow: 0 0 15px rgba(0, 219, 222, 0.5);
          transform: translateY(-2px);
        }

        .form-error {
          color: #ff6b6b;
          font-size: 13px;
          margin-top: 3px;
          display: none;
        }

        #installBanner {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 3000;
          backdrop-filter: blur(5px);
        }

        .install-content {
          background: rgba(15, 15, 35, 0.95);
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 400px;
          width: 90%;
          position: relative;
        }

        .install-content::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          z-index: -1;
          background: linear-gradient(45deg, #00dbde, #fc00ff, #00dbde, #fc00ff);
          background-size: 400% 400%;
          border-radius: 18px;
          animation: borderAnimation 3s ease infinite;
        }

        .install-content h3 {
          margin-bottom: 15px;
          font-size: 20px;
          color: #ffffff;
        }

        .install-content button {
          margin: 10px;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s;
        }

        #btnInstall {
          background: linear-gradient(45deg, #00dbde, #fc00ff);
          color: white;
        }

        #btnInstall:hover {
          box-shadow: 0 0 15px rgba(0, 219, 222, 0.5);
          transform: translateY(-2px);
        }

        #btnDismiss {
          background-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        #btnDismiss:hover {
          background-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }

        @keyframes borderAnimation {
          0% {
              background-position: 0% 50%;
              opacity: 0.7;
          }
          50% {
              background-position: 100% 50%;
              opacity: 1;
          }
          100% {
              background-position: 0% 50%;
              opacity: 0.7;
          }
        }

        @keyframes gradientText {
          0% {
              background-position: 0% 50%;
          }
          50% {
              background-position: 100% 50%;
          }
          100% {
              background-position: 0% 50%;
          }
        }

        @media (max-width: 768px) {
          .catalog {
              grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
              gap: 20px;
          }
          
          .search-filter-container {
              flex-direction: column;
              align-items: stretch;
          }
          
          .search-box, .category-filter {
              max-width: 100%;
          }
          
          .cart-container {
              width: 95%;
          }
          
          .cart-actions {
              flex-direction: column;
          }
          
          .product-gallery {
              height: 250px;
          }
          
          .customer-actions {
              flex-direction: column;
          }
          
          .customer-btn {
              width: 100%;
          }
          
          h1 {
              font-size: 2.2rem;
          }
        }
      `}</style>
    </>
  )
}
