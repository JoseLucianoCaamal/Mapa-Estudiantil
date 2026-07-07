import { inicializarMapa } from './mapa.js';
import { cargarEscuelas } from './api.js';
import { inicializarRutas } from './transporte.js';
import { listaMarcadores } from './datos.js';
// 1. Agregamos la importación de tu módulo de ubicación
import { activarGeolocalizacion } from './ubicacion.js'; 

document.addEventListener('DOMContentLoaded', () => {
    const mapa = inicializarMapa();
    
    inicializarRutas(mapa); // Prepara la función window.dibujarRuta
    cargarEscuelas(mapa);   // Carga los pines y botones
    
    // 2. Activamos la función conectándola a tu mapa
    activarGeolocalizacion(mapa);
    
    const input = document.getElementById('buscador');
    input.addEventListener('input', (e) => {
        const busqueda = e.target.value.toLowerCase();
        listaMarcadores.forEach(item => {
            const visible = item.nombre.toLowerCase().includes(busqueda);
            item.marker.setOpacity(visible ? 1 : 0);
        });
    });
});
