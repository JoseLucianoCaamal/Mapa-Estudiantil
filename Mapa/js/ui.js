import { listaMarcadores } from './api.js';

export function activarBuscador(mapa) {
    const input = document.getElementById('buscador');
    input.addEventListener('input', (e) => {
        const busqueda = e.target.value.toLowerCase();
        listaMarcadores.forEach(item => {
            const visible = item.nombre.toLowerCase().includes(busqueda);
            item.marker.setOpacity(visible ? 1 : 0);
        });
    });
}