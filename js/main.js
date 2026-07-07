import { inicializarMapa } from './mapa.js';
import { cargarEscuelas } from './api.js';
import { inicializarRutas } from './transporte.js';
import { listaMarcadores } from './datos.js';
import { activarGeolocalizacion } from './ubicacion.js'; 

document.addEventListener('DOMContentLoaded', async () => {
    const mapa = inicializarMapa();
    
    inicializarRutas(mapa); 
    activarGeolocalizacion(mapa);
    
    await cargarEscuelas(mapa);   
    
    const input = document.getElementById('buscador');

    const parametrosUrl = new URLSearchParams(window.location.search);
    const escuelaBuscada = parametrosUrl.get('escuela');

    if (escuelaBuscada) {
        input.value = escuelaBuscada; 
        
        listaMarcadores.forEach(item => {
            const visible = item.nombre.toLowerCase().includes(escuelaBuscada.toLowerCase());
            item.marker.setOpacity(visible ? 1 : 0);
            
            if (visible) {
                mapa.setView(item.marker.getLatLng(), 16);
                item.marker.fire('click'); 
            }
        });
    }

    input.addEventListener('input', (e) => {
        const busqueda = e.target.value.toLowerCase();

        const nuevaUrl = new URL(window.location);
        if (busqueda.length > 0) {
            nuevaUrl.searchParams.set('escuela', busqueda);
        } else {
            nuevaUrl.searchParams.delete('escuela');
        }
        window.history.replaceState({}, '', nuevaUrl);

        listaMarcadores.forEach(item => {
            const visible = item.nombre.toLowerCase().includes(busqueda);
            item.marker.setOpacity(visible ? 1 : 0);
        });
    });

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

    let controlRutaPeatonal = null;
    window.trazarRutaPeatonal = (destino) => {
        if (!window.ubicacionActualUsuario) {
            alert("📍 Primero activa el botón de '¿Dónde estoy?' para saber desde dónde vas a caminar.");
            return;
        }

        window.destinoPeatonal = destino;
        window.yaAvisoLlegada = false; 

        if (controlRutaPeatonal) mapa.removeControl(controlRutaPeatonal);

        controlRutaPeatonal = L.Routing.control({
            waypoints: [window.ubicacionActualUsuario, destino],
            router: L.Routing.osrmv1({ profile: 'foot' }), 
            lineOptions: { styles: [{ color: '#8e44ad', opacity: 0.8, weight: 6, dashArray: '10, 10' }] },
            show: false, createMarker: function() { return null; } 
        }).addTo(mapa);
    };

    const checkboxesRutas = document.querySelectorAll('.selector-rutas input[type="checkbox"]');
    checkboxesRutas.forEach(chk => {
        chk.addEventListener('change', (e) => {
            if (window.toggleRutaGlobal) {
                window.toggleRutaGlobal(e.target.value, e.target.checked);
            }
        });
    });
});