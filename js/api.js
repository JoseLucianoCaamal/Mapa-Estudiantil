import { listaMarcadores } from './datos.js';

export async function cargarEscuelas(mapa) {
    const cargandoDiv = document.getElementById('cargando');
    cargandoDiv.style.display = 'block';

    // 1. Coordenadas reales exactas
    const manuales = [
        { nombre: "ENES UNAM Mérida", lat: 20.9883, lon: -89.7355 },
        { nombre: "Universidad Politécnica de Yucatán (UPY)", lat: 20.9886, lon: -89.7375 }
    ];

    // --- SISTEMA MULTIRUTAS ---
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
        } catch (e) { 
            console.warn(`No se encontró la ruta ${nombreRuta} en la carpeta, se omitirá.`); 
        }
    }

    const obtenerRutasCercanas = (latlng) => {
        const cercanas = [];
        for (let ruta in puntosPorRuta) {
            const puntos = puntosPorRuta[ruta];
            for (let punto of puntos) {
                if (latlng.distanceTo(punto) <= 1000) {
                    cercanas.push(ruta);
                    break; 
                }
            }
        }
        return cercanas;
    };
    window.obtenerRutasGlobal = obtenerRutasCercanas;
    
    const query = `[out:json][timeout:25];(node["amenity"~"university|college"](20.80,-89.80,21.15,-89.50);way["amenity"~"university|college"](20.80,-89.80,21.15,-89.50););out center;`;

    // --- SISTEMA DE CACHÉ LOCALSTORAGE ---
    const cacheKey = 'escuelasCache';
    const cacheTime = 'escuelasTime';
    const expiracion = 7 * 24 * 60 * 60 * 1000; 
    const ahora = Date.now();

    let data;
    const guardado = localStorage.getItem(cacheKey);
    const tiempo = localStorage.getItem(cacheTime);

    try {
        if (guardado && tiempo && (ahora - parseInt(tiempo)) < expiracion) {
            console.log("⚡ Cargando instituciones desde el caché local");
            data = JSON.parse(guardado);
            cargandoDiv.style.display = 'none';
        } else {
            console.log("🌐 Descargando instituciones de Overpass API...");
            const response = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: "data=" + encodeURIComponent(query) });
            data = await response.json();
            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(cacheTime, ahora.toString());
            cargandoDiv.style.display = 'none';
        }

        let circuloActual = null; 

        const procesar = (nombre, lat, lon, esAgencia = false) => {
            const markerLatlng = L.latLng(lat, lon);
            
            // --- AQUÍ USAMOS TU ICONO PERSONALIZADO ---
            let opcionesIcono = {
                icon: L.icon({
                    iconUrl: './Img/Birretes.png', 
                    iconSize: [48, 48],      
                    iconAnchor: [24, 48],    
                    popupAnchor: [0, -48]
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
            
            marker.on('click', () => {
                if (circuloActual) mapa.removeLayer(circuloActual);
                circuloActual = L.circle(markerLatlng, {
                    color: '#3498db',
                    fillColor: '#3498db',
                    fillOpacity: 0.15,
                    radius: 1000 
                }).addTo(mapa);
            });

            const div = document.createElement('div');
            
            if(esAgencia) {
                div.innerHTML = `
                    <div style="min-width: 220px; font-family: sans-serif;">
                        <h3 style="margin-bottom: 5px; color: #004a99;">${nombre}</h3>
                        <p style="font-size: 13px; margin-bottom: 5px;"><strong>Requisitos:</strong></p>
                        <ul style="font-size: 13px; margin-top: 0; padding-left: 20px;">
                            <li>Constancia vigente</li>
                            <li>Comprobante domicilio</li>
                            <li>CURP</li>
                        </ul>
                    </div>`;
            } else {
                div.innerHTML = `<h3>${nombre}</h3>`;
            }

            const rutasCercanas = obtenerRutasCercanas(markerLatlng);
            
            if (rutasCercanas.length > 0) {
                div.innerHTML += `<p style="font-size:12px; margin-bottom:5px;">Rutas a menos de 1km:</p>`;
                rutasCercanas.forEach(ruta => {
                    const btnVer = document.createElement('button');
                    btnVer.innerText = `Ver Ruta ${ruta}`;
                    btnVer.style.cssText = "width:100%; padding:8px; background:#e67e22; color:white; border:none; cursor:pointer; margin-bottom: 5px; border-radius: 4px;";
                    btnVer.onclick = () => { if (window.dibujarRuta) window.dibujarRuta(ruta); };
                    div.appendChild(btnVer);
                });

                const btnOcultar = document.createElement('button');
                btnOcultar.innerText = "Quitar Ruta";
                btnOcultar.style.cssText = "width:100%; padding:8px; background:#e74c3c; color:white; border:none; cursor:pointer; border-radius: 4px; margin-top: 5px;";
                btnOcultar.onclick = () => { if (window.limpiarRuta) window.limpiarRuta(); };
                div.appendChild(btnOcultar);
                
                const btnCaminar = document.createElement('button');
                btnCaminar.innerText = "🚶 Caminar hasta aquí";
                btnCaminar.style.cssText = "width:100%; padding:8px; background:#8e44ad; color:white; border:none; cursor:pointer; border-radius: 4px; margin-top: 5px;";
                btnCaminar.onclick = () => { if (window.trazarRutaPeatonal) window.trazarRutaPeatonal(markerLatlng); };
                div.appendChild(btnCaminar);
            } else {
                div.innerHTML += `<p style="font-size:11px; color:#888;">No hay rutas registradas a menos de 1km.</p>`;
            }
            
            marker.bindPopup(div);
            listaMarcadores.push({ nombre, marker });
        };

        data.elements.forEach(el => {
            const nombre = el.tags.name || "";
            const esSuperior = /universidad|facultad|instituto tecn|anahuac|marista|enes|uady|politécnica|humanitas|prepa|bachiller|colegio/i.test(nombre);
            const esBasica = /primaria|secundaria|kinder|jardin|preescolar|telesecundaria/i.test(nombre);
            if (esSuperior && !esBasica) {
                procesar(nombre, el.lat || el.center.lat, el.lon || el.center.lon);
            }
        });

        manuales.forEach(m => procesar(m.nombre, m.lat, m.lon));
        procesar("Agencia de Transporte de Yucatán", 20.9753, -89.6268, true);

    } catch (err) {
        console.error("Error al cargar datos:", err);
        cargandoDiv.style.display = 'none';
    }
}