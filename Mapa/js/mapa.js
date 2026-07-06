export function inicializarMapa() {
    const latitudMerida = 20.9850;
    const longitudMerida = -89.6150;
    
    const mapa = L.map('mapa-merida').setView([latitudMerida, longitudMerida], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(mapa);

    return mapa;
}