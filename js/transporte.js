let capaRutaActual = null;

// --- DICCIONARIO DE COLORES PARA LAS RUTAS ---
const coloresRutas = {
    '72': '#e74c3c',        // Rojo
    'Periferico': '#2ecc71',// Verde
    '92': '#9b59b6',        // Morado
    '64_Castilla_Camara': 'hsl(236, 73%, 50%)'   
};

export function inicializarRutas(mapa) {
    
    window.dibujarRuta = async (nombreRuta) => {
        // Borramos la ruta anterior si existía
        if (capaRutaActual) mapa.removeLayer(capaRutaActual);

        try {
            const res = await fetch(`./rutas/${nombreRuta}.geojson`);
            const data = await res.json();

            // Buscamos qué color le toca a esta ruta específica
            const colorAsignado = coloresRutas[nombreRuta] || coloresRutas['default'];

            capaRutaActual = L.geoJSON(data, {
                style: {
                    color: colorAsignado, // Asignamos su color único
                    weight: 6,
                    opacity: 0.8
                }
            }).addTo(mapa);

            // --- NUEVO: CAMINAR HACIA EL PARADERO (Línea del camión) ---
            capaRutaActual.on('click', (e) => {
                const latlng = e.latlng; // Coordenada exacta donde el usuario tocó la línea
                
                // Creamos un mini panel (Popup)
                const popupContent = document.createElement('div');
                popupContent.innerHTML = `<p style="margin:0 0 5px 0; font-weight:bold; font-size:14px; color:${colorAsignado}">Camión: Ruta ${nombreRuta}</p>`;

                const btnCaminarParadero = document.createElement('button');
                btnCaminarParadero.innerText = "🚶 Caminar a este paradero";
                btnCaminarParadero.style.cssText = `width:100%; padding:8px; background:${colorAsignado}; color:white; border:none; cursor:pointer; border-radius: 4px; font-weight:bold;`;
                
                // Al darle clic, traza la ruta desde el GPS del usuario hasta ese punto de la calle
                btnCaminarParadero.onclick = () => {
                    if (window.trazarRutaPeatonal) window.trazarRutaPeatonal(latlng);
                    mapa.closePopup(); // Cierra el globito para que se vea la ruta
                };

                popupContent.appendChild(btnCaminarParadero);

                // Mostramos el globito justo donde hizo clic
                L.popup().setLatLng(latlng).setContent(popupContent).openOn(mapa);
            });

            // Hacemos zoom para que la ruta quepa en la pantalla
            mapa.fitBounds(capaRutaActual.getBounds());
            
        } catch (error) {
            console.error(`Error al cargar la ruta ${nombreRuta}:`, error);
            alert(`No pudimos cargar la ruta ${nombreRuta}.`);
        }
    };

    window.limpiarRuta = () => {
        if (capaRutaActual) {
            mapa.removeLayer(capaRutaActual);
            capaRutaActual = null;
        }
    };
}