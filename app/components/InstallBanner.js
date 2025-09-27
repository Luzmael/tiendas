'use client'

export default function InstallBanner({ isOpen, onInstall, onDismiss }) {
    if (!isOpen) return null

    return (
        <div id="installBanner" style={{ display: 'block' }}>
            <div className="install-content">
                <h3>¿Quieres agregar esta tienda a tu pantalla principal?</h3>
                <button id="btnInstall" onClick={onInstall}>Agregar</button>
                <button id="btnDismiss" onClick={onDismiss}>Ahora no</button>
            </div>
        </div>
    )
}
