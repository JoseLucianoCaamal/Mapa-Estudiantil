import { listaMarcadores } from './datos.js';

export async function cargarEscuelas(mapa) {
    const cargandoDiv = document.getElementById('cargando');
    cargandoDiv.style.display = 'block';

    // Lista corregida con coordenadas precisas para Mérida
    const manuales = [
        { nombre: "ENES UNAM Mérida", lat: 20.9883, lon: -89.7355 },
        { nombre: "Universidad Politécnica de Yucatán (UPY)", lat: 20.9886, lon: -89.7375 },
        { nombre: "Universidad Modelo", lat: 21.0042, lon: -89.6187 },
        { nombre: "Facultad de Medicina UADY", lat: 20.973860, lon: -89.6278 },
        { nombre: "Universidad Vizcaya de las Américas", lat: 20.9790, lon: -89.640101},
        { nombre: "Universidad Santander Yucatán", lat: 21.0021, lon: -89.6055 },
        { nombre: "UHAB Península de Yucatán", lat: 20.9850, lon: -89.6380 },
        { nombre: "UTP CAMPUS MÉRIDA", lat: 20.9870, lon: -89.7360 },
        { nombre: "INTER Centro Universitario Interamericano", lat: 20.9820, lon: -89.6170 },
        { nombre: "Universidad del Sur (Centro)", lat: 20.9785, lon: -89.6250 },
        { nombre: "Universidad del Sur (Santa Lucía)", lat: 20.9740, lon: -89.6220 },
        { nombre: "Instituto De Ciencias Humanas", lat: 20.9810, lon: -89.6280 },
        { nombre: "Centro Institucional de Lenguas (CIL) - UADY", lat: 20.9825, lon: -89.6130 },
        { nombre: "Centro de Estudios Superiores CTM Justo Sierra", lat: 20.9760, lon: -89.6240 },
        { nombre: "Campus Administración Central UADY", lat: 20.9815, lon: -89.6150 },
        { nombre: "Centro de Formación Profesional de Yucatán UM", lat: 20.9830, lon: -89.6210 },
        { nombre: "Centro de Estudios Superiores del Sureste", lat: 20.9805, lon: -89.6270 },
        { nombre: "República de México", lat: 20.9860, lon: -89.6290 },
        { nombre: "Centro Universitario Felipe Carrillo Puerto", lat: 20.9840, lon: -89.6300 },
        { nombre: "Instituto Universitario del Sureste (IUNIS)", lat: 20.9875, lon: -89.6310 },
        { nombre: "Universidad Privada de la Península (UPP)", lat: 20.9910, lon: -89.6350 },
        { nombre: "Facultad de Psicología, UADY", lat: 20.9855, lon: -89.6185 },
        { nombre: "Facultad de Educación, UADY", lat: 20.9845, lon: -89.6195 },
        { nombre: "Facultad de Contaduría y Administración, UADY", lat: 20.9835, lon: -89.6175 },
        { nombre: "Facultad de Derecho, UADY", lat: 20.9825, lon: -89.6165 },
        { nombre: "Facultad de Odontología, UADY", lat: 20.973842, lon: -89.6140 },
        { nombre: "Facultad de Química, UADY", lat: 20.9780, lon: -89.6120 },
        { nombre: "Facultad de Enfermería, UADY", lat: 20.9770, lon: -89.6110 },
        { nombre: "Preparatoria Uno UADY", lat: 20.9850, lon: -89.6155 },
        { nombre: "Preparatoria Dos UADY", lat: 20.9890, lon: -89.6450 },
        { nombre: "CECyTEY", lat: 20.9650, lon: -89.6050 },
        { nombre: "Cecytey 06 Emiliano Zapata", lat: 20.9620, lon: -89.6020 }
    ];

    // --- LÓGICA DE RUTAS ---
    const rutasDisponibles = ['72', 'Periferico', '92']; 
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

    // --- CARGA Y PROCESAMIENTO ---
    try {
        const query = `[out:json][timeout:25];(node["amenity"~"university|college"](20.80,-89.80,21.15,-89.50);way["amenity"~"university|college"](20.80,-89.80,21.15,-89.50););out center;`;
        const response = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: "data=" + encodeURIComponent(query) });
        const data = await response.json();
        cargandoDiv.style.display = 'none';

        let circuloActual = null;

        const procesar = (nombre, lat, lon, esAgencia = false) => {
            // FORZAMOS L.latLng con el orden correcto: (lat, lon)
            const markerLatlng = L.latLng(parseFloat(lat), parseFloat(lon));

            const marker = L.marker(markerLatlng, {
                icon: L.icon({
                    iconUrl: './Img/Birretes.png',
                    iconSize: [48, 48],
                    iconAnchor: [24, 24],
                    popupAnchor: [0, -24]
                })
            }).addTo(mapa);
            
            marker.on('click', () => {
                if (circuloActual) mapa.removeLayer(circuloActual);
                circuloActual = L.circle(markerLatlng, { radius: 1000, color: '#3498db', fillOpacity: 0.15 }).addTo(mapa);
            });

            // Popup básico
            marker.bindPopup(`<h3>${nombre}</h3>`);
            listaMarcadores.push({ nombre, marker });
        };

        // Procesar API
        data.elements.forEach(el => {
            const lat = el.lat || el.center.lat;
            const lon = el.lon || el.center.lon;
            procesar(el.tags.name || "Sin nombre", lat, lon);
        });

        // Procesar Manuales
        manuales.forEach(m => procesar(m.nombre, m.lat, m.lon));

    } catch (err) {
        console.error("Error crítico:", err);
        cargandoDiv.style.display = 'none';
    }
}