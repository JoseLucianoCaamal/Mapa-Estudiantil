let capaRutaActual = null;

// --- DICCIONARIO DE COLORES PARA LAS RUTAS ---
const coloresRutas = {
    '72': '#e74c3c',        
    'Periferico': '#2ecc71',
    '92': '#9b59b6',        
    '64_Castilla_Camara': 'hsl(236, 73%, 50%)' ,
    'R1_Emiliano_Zapata_2_Paso_Texas': 'hsla(71, 79%, 49%, 0.51)',
    'R2_Periferico_Roble_San_Marcos': 'hsl(132, 42%, 14%)',
    'R4_60_Periferico_Guadalupana': 'hsl(0, 0%, 50%)',
    'R5_San_Roque': 'hsl(30, 100%, 50%)',
    '60_Penal_Hospital_Ohran': 'hsl(200, 100%, 50%)',
    '50_Penal': 'hsl(300, 100%, 50%)',
    'Xmatkuil': 'hsl(45, 100%, 50%)',
    '11_Zazil_Ha_San_Jose': 'hsl(335, 100%, 38%)', 
    '50_Sur_Villa_Magna': 'hsl(s210, 100%, 50%)',
    '42_Sur_Leona_Vicario': 'hsl(204, 100%, 50%)',
    '42_Sur_Cielo_Alto': 'hsl(120, 100%, 50%)',
    '42_Cruz_Roja_Salvador_Alvarado': 'hsl(300, 100%, 50%)',
    '21_Vicente_Solis': 'hsl(240, 100%, 50%)',
    '22_Quinta_Avenida': 'hsl(180, 100%, 50%)',
    '23_San_Haroldo': 'hsl(60, 100%, 50%)',
    '25_Santa_Isabel': 'hsl(0, 100%, 50%)',
    'Galvez_Villas_Oriente_R1': 'hsl(15, 100%, 50%)',
    'Kanasin_Naranjos_2': 'hsl(195, 100%, 50%)',
    'Vergel_1': 'hsl(75, 100%, 50%)',
    //Ietram
    'R903_Fac_Ingenieria': 'hsl(34, 100%, 50%)',
    'R907_Plancha_Aeropuerto': 'hsl(210, 100%, 50%)',
    'R906_La_Plancha_UMAN': 'hsl(120, 100%, 50%)',
    'R901_La_Plancha_Estacion_Teya': 'hsl(300, 100%, 50%)',
    'R902_La_Plancha_Kanasin': 'hsl(150, 100%, 50%)',
    'R905_Centro_Uman_Tren_Maya': 'hsl(0, 100%, 50%)'
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