import { listaMarcadores, puntosInteres } from './datos.js';

export async function cargarEscuelas(mapa) {
    const cargandoDiv = document.getElementById('cargando');
    cargandoDiv.style.display = 'block';

    const manuales = [
        { nombre: "ENES UNAM Mérida", lat: 20.9883, lon: -89.7355 },
        //{ nombre: "Universidad Politécnica de Yucatán (UPY)", lat: 20.9886, lon: -89.7375 },
        { nombre: "Universidad Modelo", lat: 21.02719, lon: -89.56716 },
        { nombre: "Facultad de Medicina UADY", lat: 20.973857, lon: -89.640133 },
        { nombre: "Universidad Vizcaya de las Américas", lat: 21.004016, lon: -89.632835 },
        { nombre: "Universidad Santander Yucatán", lat: 20.999531, lon: -89.608566 },
        { nombre: "UHAB Península de Yucatán", lat: 20.988758, lon: -89.601134 },
        { nombre: "UTP CAMPUS MÉRIDA", lat: 20.992730, lon: -89.618096 },
        { nombre: "INTER Centro Universitario Interamericano", lat: 20.990406, lon: -89.619352 },
        { nombre: "Universidad del Sur (Santa Lucía)", lat: 20.972079, lon: -89.623262 },
        { nombre: "Instituto De Ciencias Humanas", lat: 20.983865, lon: -89.608025 },
        { nombre: "Centro Institucional de Lenguas (CIL) - UADY", lat: 20.981035, lon: -89.598227 },
        { nombre: "Centro de Estudios Superiores CTM Justo Sierra", lat: 20.966319, lon: -89.589445 },
        { nombre: "Campus Administración Central UADY", lat: 20.970000, lon: -89.589799 },
        { nombre: "Centro de Formación Profesional de Yucatán UM", lat: 20.971761, lon: -89.615084 },
        { nombre: "Centro de Estudios Superiores del Sureste", lat: 20.973026, lon: -89.622806 },
        { nombre: "República de México", lat: 20.973760, lon: -89.629257 },
        { nombre: "Centro Universitario Felipe Carrillo Puerto", lat: 20.967050, lon: -89.631435 },
        { nombre: "Instituto Universitario del Sureste (IUNIS)", lat: 20.954296, lon: -89.627881 },
        { nombre: "Universidad Privada de la Península (UPP)", lat: 20.981907, lon: -89.650717 },
        { nombre: "Facultad de Psicología, UADY", lat: 21.025586, lon: -89.559077 },
        { nombre: "Facultad de Educación, UADY", lat: 21.023929, lon: -89.558353 },
        { nombre: "Facultad de Contaduría y Administración, UADY", lat: 21.021946, lon: -89.557838 },
        { nombre: "Facultad de Derecho, UADY", lat: 21.022347, lon: -89.555252 },
        { nombre: "Facultad de Odontología, UADY", lat: 20.970126, lon: -89.642268 },
        { nombre: "Facultad de Química, UADY", lat: 20.984576, lon: -89.645197 },
        { nombre: "Facultad de Enfermería, UADY", lat: 20.974859, lon: -89.643406 },
        { nombre: "Preparatoria Uno UADY", lat: 20.978358, lon: -89.600616 },
        { nombre: "Preparatoria Dos UADY", lat: 20.981401, lon: -89.655902 },
    ];

    // --- LÓGICA DE RUTAS ---
    localStorage.removeItem('escuelasCache'); 
    const rutasDisponibles = ['72', 
                              'Periferico', 
                              '92', 
                              '64_Castilla_Camara', 
                              '1_Emiliano_Zapata_2_Paso_Texas',
                              '2_Periferico_Roble_San_Marcos'];
    const puntosPorRuta = {};

    for (let nombreRuta of rutasDisponibles) {
        try {
            const resRuta = await fetch(`./rutas/${nombreRuta}.geojson`);
            const dataRuta = await resRuta.json();
            const featureLinea = dataRuta.features.find(f => f.geometry.type === "LineString");
            if (featureLinea) {
                puntosPorRuta[nombreRuta] = featureLinea.geometry.coordinates.map(coord => L.latLng(coord[1], coord[0]));
            }
        } catch (e) { console.warn(`Error ruta ${nombreRuta}`); }
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

    try {
        const query = `[out:json][timeout:25];(node["amenity"~"university|college"](20.80,-89.80,21.15,-89.50);way["amenity"~"university|college"](20.80,-89.80,21.15,-89.50););out center;`;
        const response = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: "data=" + encodeURIComponent(query) });
        const data = await response.json();

        const procesar = (nombre, lat, lon, esAgencia = false, categoria = 'uni') => {
            const markerLatlng = L.latLng(parseFloat(lat), parseFloat(lon));
            const marker = L.marker(markerLatlng).addTo(mapa);
            marker.categoria = categoria;

            const div = document.createElement('div');
            div.innerHTML = esAgencia ? `<h3>${nombre}</h3>` : `<h3>${nombre}</h3>`;
            
            const rutasCercanas = obtenerRutasCercanas(markerLatlng);
            rutasCercanas.forEach(ruta => {
                const btn = document.createElement('button');
                btn.innerText = `Ver ${ruta}`;
                btn.onclick = () => window.dibujarRuta(ruta);
                div.appendChild(btn);
            });

            marker.bindPopup(div);
            listaMarcadores.push({ nombre, marker, categoria });
        };

        // Cargar todo
        data.elements.forEach(el => procesar(el.tags.name, el.lat, el.lon, false, 'uni'));
        manuales.forEach(m => procesar(m.nombre, m.lat, m.lon, false, 'uni'));
        puntosInteres.supers.forEach(s => procesar(s.nombre, s.lat, s.lon, false, 'super'));
        puntosInteres.salud.forEach(s => procesar(s.nombre, s.lat, s.lon, false, 'salud'));
        procesar("Agencia Transporte", 20.9753, -89.6268, true, 'uni');

        // Filtros
        document.querySelectorAll('#filtros input').forEach(input => {
            input.addEventListener('change', (e) => {
                const cat = e.target.id.replace('check-', '');
                listaMarcadores.forEach(m => {
                    if (m.categoria === cat || (cat === 'uni' && m.categoria === 'uni')) {
                        e.target.checked ? m.marker.addTo(mapa) : mapa.removeLayer(m.marker);
                    }
                });
            });
        });
        cargandoDiv.style.display = 'none';
    } catch (err) { console.error(err); cargandoDiv.style.display = 'none'; }
}