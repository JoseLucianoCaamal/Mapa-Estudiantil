import { listaMarcadores, puntosInteres } from './datos.js';

export async function cargarEscuelas(mapa) {
    const cargandoDiv = document.getElementById('cargando');
    cargandoDiv.style.display = 'block';

    // 1. LÓGICA DE RUTAS (Se mantiene igual)
    localStorage.removeItem('escuelasCache'); 
    const rutasDisponibles = ['72', 'Periferico', '92', '64_Castilla_Camara', '1_Emiliano_Zapata_2_Paso_Texas', '2_Periferico_Roble_San_Marcos'];
    const puntosPorRuta = {}; 

    for (let nombreRuta of rutasDisponibles) {
        try {
            const resRuta = await fetch(`./rutas/${nombreRuta}.geojson`);
            const dataRuta = await resRuta.json();
            const featureLinea = dataRuta.features.find(f => f.geometry.type === "LineString");
            if (featureLinea) {
                puntosPorRuta[nombreRuta] = featureLinea.geometry.coordinates.map(coord => L.latLng(coord[1], coord[0]));
            }
        } catch (e) { console.warn(`Error cargando ruta ${nombreRuta}`); }
    }

    const obtenerRutasCercanas = (latlng) => {
        const cercanas = [];
        for (let ruta in puntosPorRuta) {
            const puntos = puntosPorRuta[ruta];
            for (let punto of puntos) {
                if (latlng.distanceTo(punto) <= 1000) { cercanas.push(ruta); break; }
            }
        }
        return cercanas;
    };
    window.obtenerRutasGlobal = obtenerRutasCercanas;

    // 2. FUNCIÓN PROCESAR (Ahora incluye categoría)
    const procesar = (nombre, lat, lon, categoria, esAgencia = false) => {
        const markerLatlng = L.latLng(parseFloat(lat), parseFloat(lon));
        
        let opcionesIcono = {
            icon: L.icon({
                iconUrl: './Img/Birretes.png',
                iconSize: [48, 48],
                iconAnchor: [24, 24],
                popupAnchor: [0, -24]
            })
        };

        if(esAgencia) {
            opcionesIcono = {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            };
        }

        const marker = L.marker(markerLatlng, opcionesIcono).addTo(mapa);
        marker.categoria = categoria; // Guardamos la categoría aquí
        
        marker.on('click', () => {
            // Lógica de círculo original...
        });

        // Configuración de Popup y Botones
        const div = document.createElement('div');
        div.innerHTML = `<h3>${nombre}</h3>`;
        
        const rutasCercanas = obtenerRutasCercanas(markerLatlng);
        if (rutasCercanas.length > 0) {
            div.innerHTML += `<p>Rutas a menos de 1km:</p>`;
            rutasCercanas.forEach(ruta => {
                const btnVer = document.createElement('button');
                btnVer.innerText = `Ver ${ruta}`;
                btnVer.onclick = () => window.dibujarRuta(ruta);
                div.appendChild(btnVer);
            });
        }
        marker.bindPopup(div);
        listaMarcadores.push({ marker, categoria });
    };

    // 3. CARGA DESDE DATOS.JS
    try {
        puntosInteres.uni.forEach(p => procesar(p.nombre, p.lat, p.lon, 'uni'));
        puntosInteres.super.forEach(p => procesar(p.nombre, p.lat, p.lon, 'super'));
        puntosInteres.salud.forEach(p => procesar(p.nombre, p.lat, p.lon, 'salud'));
        procesar("Agencia de Transporte", 20.9753, -89.6268, 'uni', true);
        
        cargandoDiv.style.display = 'none';
    } catch (err) {
        console.error("Error al cargar:", err);
        cargandoDiv.style.display = 'none';
    }

    // 4. LÓGICA DE FILTROS (Activación)
    document.querySelectorAll('#filtros input').forEach(input => {
        input.addEventListener('change', (e) => {
            const cat = e.target.id.replace('check-', '');
            listaMarcadores.forEach(m => {
                if (m.categoria === cat) {
                    e.target.checked ? m.marker.addTo(mapa) : mapa.removeLayer(m.marker);
                }
            });
        });
    });
}