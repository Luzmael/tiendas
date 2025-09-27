'use client'
import { useState, useEffect } from 'react'

export function useCart() {
    const [cart, setCart] = useState([])

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || []
        setCart(savedCart)
    }, [])

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart))
    }, [cart])

    const addToCart = (product, selectedSize = '', selectedColor = '') => {
        const existingItemIndex = cart.findIndex(item => 
            item.id === product.id && 
            item.size === selectedSize && 
            item.color === selectedColor
        )

        if (existingItemIndex !== -1) {
            const updatedCart = [...cart]
            updatedCart[existingItemIndex].quantity += 1
            setCart(updatedCart)
        } else {
            setCart([...cart, {
                ...product,
                size: selectedSize,
                color: selectedColor,
                quantity: 1
            }])
        }
    }

    const updateQuantity = (index, newQuantity) => {
        const updatedCart = [...cart]
        if (newQuantity < 1) {
            updatedCart.splice(index, 1)
        } else {
            updatedCart[index].quantity = newQuantity
        }
        setCart(updatedCart)
    }

    const removeItem = (index) => {
        const updatedCart = cart.filter((_, i) => i !== index)
        setCart(updatedCart)
    }

    const clearCart = () => {
        setCart([])
    }

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0)
    }

    const getSubtotal = (exchangeRate) => {
        return cart.reduce((sum, item) => {
            return sum + (item.priceValue * item.quantity * exchangeRate)
        }, 0)
    }

    return {
        cart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        getTotalItems,
        getSubtotal
    }
}
