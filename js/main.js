import { inicializarMapa } from './mapa.js';
import { cargarEscuelas } from './api.js';
import { inicializarRutas } from './transporte.js';
import { listaMarcadores } from './datos.js';
import { activarGeolocalizacion } from './ubicacion.js'; 

document.addEventListener('DOMContentLoaded', () => {
    const mapa = inicializarMapa();
    
    inicializarRutas(mapa); 
    cargarEscuelas(mapa);   
    activarGeolocalizacion(mapa);
    
    // --- LÓGICA DEL BUSCADOR ---
    const input = document.getElementById('buscador');
    input.addEventListener('input', (e) => {
        const busqueda = e.target.value.toLowerCase();
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
        // Verificamos que el GPS esté activo
        if (!window.ubicacionActualUsuario) {
            alert("📍 Primero activa el botón de '¿Dónde estoy?' para saber desde dónde vas a caminar.");
            return;
        }

        if (controlRutaPeatonal) mapa.removeControl(controlRutaPeatonal);

        controlRutaPeatonal = L.Routing.control({
            waypoints: [window.ubicacionActualUsuario, destino],
            router: L.Routing.osrmv1({ profile: 'foot' }), // 'foot' asegura que busque calles peatonales
            lineOptions: { 
                styles: [{ color: '#8e44ad', opacity: 0.8, weight: 6, dashArray: '10, 10' }] // Línea punteada morada
            },
            show: false, // Oculta el panel gigante de instrucciones de texto
            createMarker: function() { return null; } // Evita crear pines extra innecesarios
        }).addTo(mapa);
    };
});