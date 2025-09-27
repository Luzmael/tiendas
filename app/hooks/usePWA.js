'use client'
import { useState, useEffect } from 'react'

export function usePWA() {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showInstallBanner, setShowInstallBanner] = useState(false)

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowInstallBanner(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const installApp = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        
        if (outcome === 'accepted') {
            console.log('Usuario aceptó instalar la app')
        } else {
            console.log('Usuario rechazó la instalación')
        }

        setDeferredPrompt(null)
        setShowInstallBanner(false)
    }

    const dismissInstall = () => {
        setShowInstallBanner(false)
    }

    return {
        showInstallBanner,
        installApp,
        dismissInstall
    }
}
