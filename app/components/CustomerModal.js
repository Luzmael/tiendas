'use client'
import { useState } from 'react'
import { validateIdNumber } from '../utils/helpers'

export default function CustomerModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    cart, 
    exchangeRate, 
    shippingCost,
    whatsappNumber 
}) {
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        id: ''
    })
    const [errors, setErrors] = useState({})

    if (!isOpen) return null

    const validateForm = () => {
        const newErrors = {}
        
        if (!formData.name.trim()) {
            newErrors.name = 'Por favor ingrese su nombre'
        }
        
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Por favor ingrese su apellido'
        }
        
        if (!formData.id.trim() || !validateIdNumber(formData.id)) {
            newErrors.id = 'Por favor ingrese un número de cédula válido'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm()) {
            onSubmit(formData)
            setFormData({ name: '', lastName: '', id: '' })
            setErrors({})
        }
    }

    const handleCancel = () => {
        setFormData({ name: '', lastName: '', id: '' })
        setErrors({})
        onClose()
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
    const subtotal = cart.reduce((sum, item) => sum + (item.priceValue * item.quantity * exchangeRate), 0)
    const total = totalItems >= 8 ? subtotal + shippingCost : subtotal

    return (
        <div className={`customer-modal ${isOpen ? 'active' : ''}`}>
            <div className="customer-container">
                <div className="customer-header">
                    <h3 className="customer-title">Complete sus datos</h3>
                    <p className="customer-instructions">Por favor ingrese su información personal para procesar el pedido</p>
                </div>
                
                <form className="customer-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="customerName">Nombre*</label>
                        <input 
                            type="text" 
                            id="customerName"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Ingrese su nombre" 
                        />
                        {errors.name && <div className="form-error" style={{display: 'block'}}>{errors.name}</div>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="customerLastName">Apellido*</label>
                        <input 
                            type="text" 
                            id="customerLastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Ingrese su apellido" 
                        />
                        {errors.lastName && <div className="form-error" style={{display: 'block'}}>{errors.lastName}</div>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="customerId">Número de Cédula*</label>
                        <input 
                            type="text" 
                            id="customerId"
                            value={formData.id}
                            onChange={(e) => handleInputChange('id', e.target.value.replace(/\D/g, ''))}
                            placeholder="Ingrese su cédula" 
                        />
                        {errors.id && <div className="form-error" style={{display: 'block'}}>{errors.id}</div>}
                    </div>
                    
                    <div className="customer-actions">
                        <button type="button" className="customer-btn cancel" onClick={handleCancel}>
                            Cancelar
                        </button>
                        <button type="submit" className="customer-btn submit">
                            Enviar Pedido
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
