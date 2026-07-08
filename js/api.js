import { listaMarcadores } from './datos.js';

export async function cargarEscuelas(mapa) {
    const cargandoDiv = document.getElementById('cargando');
    cargandoDiv.style.display = 'block';

    let circuloActual = null; 

    // 1. Coordenadas Manuales
    const puntosManuales = [
        { nombre: "ENES UNAM Mérida", lat: 20.9883, lon: -89.7355, cat: 'uni' },
        { nombre: "Universidad Modelo", lat: 21.02719, lon: -89.56716, cat: 'uni' },
        { nombre: "Facultad de Medicina UADY", lat: 20.973857, lon: -89.640133, cat: 'uni' },
        { nombre: "Universidad Vizcaya de las Américas", lat: 21.004016, lon: -89.632835, cat: 'uni' },
        { nombre: "Universidad Santander Yucatán", lat: 20.999531, lon: -89.608566, cat: 'uni' },
        { nombre: "UHAB Península de Yucatán", lat: 20.988758, lon: -89.601134, cat: 'uni' },
        { nombre: "UTP CAMPUS MÉRIDA", lat: 20.992730, lon: -89.618096, cat: 'uni' },
        { nombre: "INTER Centro Universitario Interamericano", lat: 20.990406, lon: -89.619352, cat: 'uni' },
        { nombre: "Universidad del Sur (Santa Lucía)", lat: 20.972079, lon: -89.623262, cat: 'uni' },
        { nombre: "Instituto De Ciencias Humanas", lat: 20.983865, lon: -89.608025, cat: 'uni' },
        { nombre: "Centro Institucional de Lenguas (CIL) - UADY", lat: 20.977809, lon: -89.599037, cat: 'uni' },
        { nombre: "Centro de Estudios Superiores CTM Justo Sierra", lat: 20.966319, lon: -89.589445, cat: 'uni' },
        { nombre: "Campus Administración Central UADY", lat: 20.970000, lon: -89.589799, cat: 'uni' },
        { nombre: "Centro de Formación Profesional de Yucatán UM", lat: 20.971761, lon: -89.615084, cat: 'uni' },
        { nombre: "Centro de Estudios Superiores del Sureste", lat: 20.973026, lon: -89.622806, cat: 'uni' },
        { nombre: "República de México", lat: 20.973760, lon: -89.629257, cat: 'uni' },
        { nombre: "Centro Universitario Felipe Carrillo Puerto", lat: 20.967050, lon: -89.631435, cat: 'uni' },
        { nombre: "Instituto Universitario del Sureste (IUNIS)", lat: 20.954296, lon: -89.627881, cat: 'uni' },
        { nombre: "Universidad Privada de la Península (UPP)", lat: 20.981907, lon: -89.650717, cat: 'uni' },
        { nombre: "Facultad de Psicología, UADY", lat: 21.025586, lon: -89.559077, cat: 'uni' },
        { nombre: "Facultad de Educación, UADY", lat: 21.023929, lon: -89.558353, cat: 'uni' },
        { nombre: "Facultad de Contaduría y Administración, UADY", lat: 21.021946, lon: -89.557838, cat: 'uni' },
        { nombre: "Facultad de Derecho, UADY", lat: 21.022347, lon: -89.555252, cat: 'uni' },
        { nombre: "Facultad de Odontología, UADY", lat: 20.970126, lon: -89.642268, cat: 'uni' },
        { nombre: "Facultad de Química, UADY", lat: 20.984576, lon: -89.645197, cat: 'uni' },
        { nombre: "Facultad de Enfermería, UADY", lat: 20.974859, lon: -89.643406, cat: 'uni' },
        { nombre: "Preparatoria Uno UADY", lat: 20.978358, lon: -89.600616, cat: 'uni' },
        { nombre: "Preparatoria Dos UADY", lat: 20.981401, lon: -89.655902, cat: 'uni' },
        { nombre: "Chedraui Norte", lat: 21.0345, lon: -89.6123, cat: 'super' },
        { nombre: "Farmacia del Ahorro Centro", lat: 20.9750, lon: -89.6250, cat: 'salud' },
        
        // --- AQUÍ ESTÁ LA NUEVA AGENCIA VA Y VEN ---
        { 
            nombre: "Agencia de Transporte de Yucatán (Va y Ven)", 
            lat: 20.981045, 
            lon: -89.625853, 
            cat: 'agencia',
            req: "<b>Requisitos para credencial de estudiante:</b><br>• Constancia de estudios vigente<br>• Comprobante de Domicilio<br>• CURP"
        }
    ];

    // 2. Lógica de Rutas
    const rutasDisponibles = [
        '72', 
        '92', 
        'Periferico', 
        '64_Castilla_Camara', 
        'R1_Emiliano_Zapata_2_Paso_Texas', 
        'R2_Periferico_Roble_San_Marcos',
        'R4_60_Periferico_Guadalupana',
        'R5_San_Roque',
        '60_Penal_Hospital_Ohran',
        '50_Penal',
        'Xmatkuil',
        '11_Zazil_Ha_San_Jose',
        '50_Sur_Villa_Magna',
        '50_Serapio_Rendon_Sur',
        '42_Sur_Leona_Vicario',
        '42_Sur_Cielo_Alto',
        '42_Cruz_Roja_Salvador_Alvarado',
        '21_Vicente_Solis',
        '22_Quinta_Avenida',
        'San_Haroldo',

        //Ietram
        'R903_Fac_Ingenieria',
        'R907_Plancha_Aeropuerto',
        'R906_La_Plancha_UMAN'
    ];
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
                if (latlng.distanceTo(punto) <= 500) { cercanas.push(ruta); break; }
            }
        }
        return cercanas;
    };
    window.obtenerRutasGlobal = obtenerRutasCercanas;

    // 3. Procesamiento (Ahora recibe los "requisitos" como un parámetro extra)
    const procesar = (nombre, lat, lon, categoria, requisitos = '') => {
        const markerLatlng = L.latLng(parseFloat(lat), parseFloat(lon));
        
        let urlIcono = './Img/Birretes.png';
        if (categoria === 'salud') urlIcono = './Img/Salud.png';
        else if (categoria === 'super') urlIcono = './Img/Compra.png';
        else if (categoria === 'agencia') urlIcono = './Img/va.png'; // <-- Icono del Va y Ven

        const icono = L.icon({
            iconUrl: urlIcono,
            iconSize: [48, 48],
            iconAnchor: [24, 24],
            popupAnchor: [0, -24]
        });

        const marker = L.marker(markerLatlng, { icon: icono }).addTo(mapa);
        marker.categoria = categoria; 

        marker.on('click', () => {
            if (circuloActual) mapa.removeLayer(circuloActual);
            circuloActual = L.circle(markerLatlng, { 
                radius: 1000, 
                color: '#3498db', 
                fillOpacity: 0.15 
            }).addTo(mapa);
        });

        const div = document.createElement('div');
        div.innerHTML = `<h3>${nombre}</h3>`;
        
        // --- AQUÍ AGREGAMOS LA CAJITA CON LOS REQUISITOS SI EXISTEN ---
        if (requisitos) {
            div.innerHTML += `<div style="background: #eef2f5; border-left: 4px solid #004a99; padding: 10px; margin-bottom: 10px; font-size: 13px; border-radius: 4px;">${requisitos}</div>`;
        }
        
        const rutasCercanas = obtenerRutasCercanas(markerLatlng);
        if (rutasCercanas.length > 0) {
            div.innerHTML += `<p>Rutas a menos de 1km:</p>`;
            rutasCercanas.forEach(ruta => {
                const btn = document.createElement('button');
                const nombreLimpio = ruta.replaceAll('_', ' ');
                btn.innerText = `Ver Ruta ${nombreLimpio}`;
                btn.style.cssText = "width:100%; padding:8px; background:#e67e22; color:white; border:none; margin-bottom:5px; border-radius:4px;";
                btn.onclick = () => window.dibujarRuta(ruta);
                div.appendChild(btn);
            });
        }

        const btnCaminar = document.createElement('button');
        btnCaminar.innerText = "🚶 Caminar hasta aquí";
        btnCaminar.style.cssText = "width:100%; padding:8px; background:#8e44ad; color:white; border:none; margin-top:5px; border-radius:4px;";
        btnCaminar.onclick = () => { 
            if (window.trazarRutaPeatonal) window.trazarRutaPeatonal(markerLatlng); 
        };
        div.appendChild(btnCaminar);

        marker.bindPopup(div);
        listaMarcadores.push({ marker, categoria, nombre });
    };

    // 4. Carga Final
    try {
        const query = `[out:json][timeout:25];(node["amenity"~"university|college"](20.80,-89.80,21.15,-89.50);way["amenity"~"university|college"](20.80,-89.80,21.15,-89.50););out center;`;
        const response = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: "data=" + encodeURIComponent(query) });
        const data = await response.json();
        
        data.elements.forEach(el => procesar(el.tags.name || "Facultad", el.lat || el.center.lat, el.lon || el.center.lon, 'uni'));
        // Pasamos "m.req" a la función procesar para que lea los requisitos
        puntosManuales.forEach(m => procesar(m.nombre, m.lat, m.lon, m.cat, m.req));
        
        cargandoDiv.style.display = 'none';
    } catch (err) { 
        console.error("Error al cargar datos:", err);
        cargandoDiv.style.display = 'none'; 
    }

    // 5. Filtros
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