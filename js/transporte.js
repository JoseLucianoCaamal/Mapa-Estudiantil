let capaRutaActual = null;

const coloresRutas = {
    '72': '#e74c3c',        
    'Periferico': '#2ecc71',
    '92': '#9b59b6',        
    'default': '#f39c12'    
};

export function inicializarRutas(mapa) {
    
    window.dibujarRuta = async (nombreRuta) => {
        if (capaRutaActual) mapa.removeLayer(capaRutaActual);

        try {
            const res = await fetch(`./rutas/${nombreRuta}.geojson`);
            const data = await res.json();

            const colorAsignado = coloresRutas[nombreRuta] || coloresRutas['default'];

            capaRutaActual = L.geoJSON(data, {
                style: {
                    color: colorAsignado, 
                    weight: 6,
                    opacity: 0.8
                }
            }).addTo(mapa);

            capaRutaActual.on('click', (e) => {
                const latlng = e.latlng; 
                
                const popupContent = document.createElement('div');
                popupContent.innerHTML = `<p style="margin:0 0 5px 0; font-weight:bold; font-size:14px; color:${colorAsignado}">Camión: Ruta ${nombreRuta}</p>`;

                const btnCaminarParadero = document.createElement('button');
                btnCaminarParadero.innerText = "🚶 Caminar a este paradero";
                btnCaminarParadero.style.cssText = `width:100%; padding:8px; background:${colorAsignado}; color:white; border:none; cursor:pointer; border-radius: 4px; font-weight:bold;`;
                
                btnCaminarParadero.onclick = () => {
                    if (window.trazarRutaPeatonal) window.trazarRutaPeatonal(latlng);
                    mapa.closePopup(); 
                };

                popupContent.appendChild(btnCaminarParadero);
                L.popup().setLatLng(latlng).setContent(popupContent).openOn(mapa);
            });

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

    const capasGlobales = {}; 

    window.toggleRutaGlobal = async (nombreRuta, mostrar) => {
        if (!mostrar) {
            if (capasGlobales[nombreRuta]) {
                mapa.removeLayer(capasGlobales[nombreRuta]);
                capasGlobales[nombreRuta] = null;
            }
            return;
        }
        
        if (capasGlobales[nombreRuta]) return;

        try {
            const res = await fetch(`./rutas/${nombreRuta}.geojson`);
            const data = await res.json();
            const colorAsignado = coloresRutas[nombreRuta] || coloresRutas['default'];

            capasGlobales[nombreRuta] = L.geoJSON(data, {
                style: { color: colorAsignado, weight: 5, opacity: 0.6, dashArray: '5, 10' }
            }).addTo(mapa);
            
        } catch(e) {
            console.error(`Error al mostrar ruta global ${nombreRuta}:`, e);
        }
    };
}