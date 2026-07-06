export function inicializarRutas(mapa) {
    let capaRuta = null;
    
    // Función para dibujar
    window.dibujarRuta = (nombre) => {
        if (capaRuta) mapa.removeLayer(capaRuta);
        
        fetch(`./rutas/${nombre}.geojson`)
            .then(r => r.json())
            .then(data => {
                capaRuta = L.geoJSON(data, { style: { color: "#e67e22", weight: 6, opacity: 0.9 } }).addTo(mapa);
                mapa.fitBounds(capaRuta.getBounds());
            })
            .catch(err => console.error("No se encontró el archivo de ruta.", err));
    };

    // NUEVA FUNCIÓN: Para ocultar la ruta
    window.limpiarRuta = () => {
        if (capaRuta) {
            mapa.removeLayer(capaRuta); // Quita la línea del mapa
            capaRuta = null; // Reinicia la variable
        }
    };
}