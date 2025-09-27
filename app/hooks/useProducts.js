'use client'
import { useState, useEffect } from 'react'
import { supabaseClient } from '../utils/supabase'
import { formatPrice } from '../utils/helpers'

export function useProducts() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [exchangeRate, setExchangeRate] = useState(115.33)
    const [shippingCost, setShippingCost] = useState(0)
    const [whatsappNumber, setWhatsappNumber] = useState('584149834667')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadAppData()
    }, [])

    const loadAppData = async () => {
        try {
            setLoading(true)
            await loadWhatsAppNumber()
            await loadAppSettings()
            await loadProducts()
        } catch (error) {
            console.error('Error loading app data:', error)
            setError('Error al cargar los productos. Por favor intente más tarde.')
        } finally {
            setLoading(false)
        }
    }

    const loadWhatsAppNumber = async () => {
        try {
            const whatsappUUID = 'a327e09a-0f45-4327-abb6-13e0f1fab85d'
            
            const { data, error } = await supabaseClient
                .from('whatsapp_numbers')
                .select('phone_number, is_active')
                .eq('id', whatsappUUID)
                .eq('is_active', true)
                .single()

            if (error) throw error
            if (data?.phone_number) {
                setWhatsappNumber(data.phone_number)
            }
        } catch (error) {
            console.error('Error loading WhatsApp number:', error)
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
                setExchangeRate(parseFloat(data[0].rate) || 115.33)
                setShippingCost(parseFloat(data[0].shipping_cost) || 0)
            }
        } catch (error) {
            console.error('Error loading app settings:', error)
        }
    }

    const loadProducts = async () => {
        try {
            const { data, error } = await supabaseClient
                .from('products')
                .select('*')

            if (error) throw error

            if (data && data.length > 0) {
                const processedProducts = data.map(product => ({
                    id: product.id,
                    name: product.name || 'Unnamed Product',
                    description: product.description || '',
                    price: formatPrice(product.price, exchangeRate),
                    originalPrice: product.price || '$0.00',
                    priceValue: parseFloat(product.price?.replace(/[^0-9.]/g, '') || 0),
                    image: product.image || 'https://via.placeholder.com/500',
                    images: product.images || [],
                    video: product.video || '',
                    sizes: product.sizes || [],
                    colors: product.colors || [],
                    badge: product.badge || '',
                    category: product.category || 'Uncategorized'
                }))

                setProducts(processedProducts)
                setCategories([...new Set(data.map(p => p.category))])
            }
        } catch (error) {
            throw error
        }
    }

    const filterProducts = (searchTerm = '', category = '') => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 product.description.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = !category || product.category === category
            return matchesSearch && matchesCategory
        })
    }

    return {
        products,
        categories,
        exchangeRate,
        shippingCost,
        whatsappNumber,
        loading,
        error,
        filterProducts,
        refetch: loadAppData
    }
}
