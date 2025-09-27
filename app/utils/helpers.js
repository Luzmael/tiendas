// YouTube embed URL converter
export function getYouTubeEmbedUrl(url) {
    if (!url) return '';
    if (url.includes('youtube.com/embed')) return url;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) 
        ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0` 
        : url;
}

// Formatear precio
export function formatPrice(price, exchangeRate) {
    const priceValue = parseFloat(price?.replace(/[^0-9.]/g, '') || 0);
    return `Bs ${(priceValue * exchangeRate).toFixed(2)}`;
}

// Validar cédula
export function validateIdNumber(idNumber) {
    return /^\d+$/.test(idNumber);
}

// LocalStorage helpers
export const storage = {
    get: (key, defaultValue = null) => {
        if (typeof window === 'undefined') return defaultValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            return defaultValue;
        }
    },
    set: (key, value) => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error setting localStorage:', error);
        }
    }
};

// Función para validar datos del cliente (compatible con el código original)
export function validateCustomerInfo(name, lastName, idNumber) {
    const errors = {};
    
    if (!name.trim()) errors.name = 'Por favor ingrese su nombre';
    if (!lastName.trim()) errors.lastName = 'Por favor ingrese su apellido';
    if (!idNumber.trim() || !validateIdNumber(idNumber)) errors.id = 'Por favor ingrese un número de cédula válido';
    
    return errors;
}
