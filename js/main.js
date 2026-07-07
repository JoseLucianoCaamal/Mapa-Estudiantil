import { inicializarMapa } from './mapa.js';
import { cargarEscuelas } from './api.js';
import { inicializarRutas } from './transporte.js';
import { listaMarcadores } from './datos.js';
import { activarGeolocalizacion } from './ubicacion.js'; 

// Agregamos 'async' aquí para poder esperar la carga de escuelas
document.addEventListener('DOMContentLoaded', async () => {
    const mapa = inicializarMapa();
    
    inicializarRutas(mapa); 
    activarGeolocalizacion(mapa);
    
    // Esperamos pacientemente a que Overpass / Caché descargue las escuelas
    await cargarEscuelas(mapa);   
    
    const input = document.getElementById('buscador');

    // --- NUEVO: DEEP LINKING (LEER ENLACE COMPARTIDO) ---
    // Buscamos si en el enlace (URL) hay una variable que diga "?escuela=..."
    const parametrosUrl = new URLSearchParams(window.location.search);
    const escuelaBuscada = parametrosUrl.get('escuela');

    if (escuelaBuscada) {
        input.value = escuelaBuscada; // Ponemos el texto en el buscador
        
        listaMarcadores.forEach(item => {
            const visible = item.nombre.toLowerCase().includes(escuelaBuscada.toLowerCase());
            item.marker.setOpacity(visible ? 1 : 0);
            
            // Si encontramos la escuela del enlace, hacemos zoom automático y abrimos su información
            if (visible) {
                mapa.setView(item.marker.getLatLng(), 16);
                item.marker.fire('click'); 
            }
        });
    }

    // --- BÚSQUEDA EN TIEMPO REAL ---
    input.addEventListener('input', (e) => {
        const busqueda = e.target.value.toLowerCase();

        // DEEP LINKING: Actualizar el enlace del navegador en tiempo real para poder copiarlo
        const nuevaUrl = new URL(window.location);
        if (busqueda.length > 0) {
            nuevaUrl.searchParams.set('escuela', busqueda);
        } else {
            nuevaUrl.searchParams.delete('escuela');
        }
        // Cambia la URL en la barra superior sin recargar la página
        window.history.replaceState({}, '', nuevaUrl);

        listaMarcadores.forEach(item => {
            const visible = item.nombre.toLowerCase().includes(busqueda);
            item.marker.setOpacity(visible ? 1 : 0);
        });
    });

    // --- LÓGICA DEL MODO OSCURO ---
    const btnTema = document.getElementById('btn-tema');
    if (btnTema) {
        btnTema.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                btnTema.innerText = "☀️ Claro";
            } else {
                btnTema.innerText = "🌙 Oscuro";
            }
        });
    }

    // --- LÓGICA DE LA ÚLTIMA MILLA (PEATONAL) ---
    let controlRutaPeatonal = null;
    window.trazarRutaPeatonal = (destino) => {
        if (!window.ubicacionActualUsuario) {
            alert("📍 Primero activa el botón de '¿Dónde estoy?' o 'Detener GPS' para saber desde dónde vas a caminar.");
            return;
        }

        if (controlRutaPeatonal) mapa.removeControl(controlRutaPeatonal);

        controlRutaPeatonal = L.Routing.control({
            waypoints: [window.ubicacionActualUsuario, destino],
            router: L.Routing.osrmv1({ profile: 'foot' }), 
            lineOptions: { 
                styles: [{ color: '#8e44ad', opacity: 0.8, weight: 6, dashArray: '10, 10' }] 
            },
            show: false, 
            createMarker: function() { return null; } 
        }).addTo(mapa);
    };
});