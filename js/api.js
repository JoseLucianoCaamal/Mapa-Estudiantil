import { listaMarcadores } from './datos.js';

export async function cargarEscuelas(mapa) {
    const cargandoDiv = document.getElementById('cargando');
    cargandoDiv.style.display = 'block';

    // 1. Coordenadas reales exactas (Carretera Mérida-Tetiz Km 4.5, Zona Ucú/Caucel)
    const manuales = [
        { nombre: "ENES UNAM Mérida", lat: 20.9883, lon: -89.7355 },
        { nombre: "Universidad Politécnica de Yucatán (UPY)", lat: 20.9886, lon: -89.7375 }
    ];

    // ---  SISTEMA MULTIRUTAS ---
    // Solo agrega aquí el nombre de tus archivos .geojson (sin la extensión)
    const rutasDisponibles = ['72', 'Periferico', '92']; 
    const puntosPorRuta = {}; // Guardará los puntos de cada ruta

    // Cargamos todas las rutas de la lista
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

    // Función que devuelve un arreglo con los nombres de las rutas que pasan cerca
    const obtenerRutasCercanas = (latlng) => {
        const cercanas = [];
        for (let ruta in puntosPorRuta) {
            const puntos = puntosPorRuta[ruta];
            for (let punto of puntos) {
                if (latlng.distanceTo(punto) <= 1000) {
                    cercanas.push(ruta);
                    break; // Ya sabemos que pasa cerca, pasamos a evaluar la siguiente ruta
                }
            }
        }
        return cercanas;
    };
    // --------------------------------

    const query = `[out:json][timeout:25];(node["amenity"~"university|college"](20.80,-89.80,21.15,-89.50);way["amenity"~"university|college"](20.80,-89.80,21.15,-89.50););out center;`;

    try {
        const response = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: "data=" + encodeURIComponent(query) });
        const data = await response.json();
        cargandoDiv.style.display = 'none';

        const procesar = (nombre, lat, lon) => {
            const markerLatlng = L.latLng(lat, lon);
            const marker = L.marker(markerLatlng, { 
                icon: L.divIcon({ html: `<div class="pin-academico pin-uni">🎓</div>`, iconSize: [25, 25] }) 
            }).addTo(mapa);
            
            const div = document.createElement('div');
            div.innerHTML = `<h3>${nombre}</h3>`;
            
            // Obtenemos las rutas que pasan por esta universidad
            const rutasCercanas = obtenerRutasCercanas(markerLatlng);
            
            if (rutasCercanas.length > 0) {
                div.innerHTML += `<p style="font-size:12px; margin-bottom:5px;">Rutas a menos de 1km:</p>`;
                
                // Creamos un botón naranja por cada ruta cercana
                rutasCercanas.forEach(ruta => {
                    const btnVer = document.createElement('button');
                    btnVer.innerText = `Ver Ruta ${ruta}`;
                    btnVer.style.cssText = "width:100%; padding:8px; background:#e67e22; color:white; border:none; cursor:pointer; margin-bottom: 5px; border-radius: 4px;";
                    btnVer.onclick = () => { if (window.dibujarRuta) window.dibujarRuta(ruta); };
                    div.appendChild(btnVer);
                });

                // Botón rojo general para limpiar el mapa
                const btnOcultar = document.createElement('button');
                btnOcultar.innerText = "Quitar Ruta";
                btnOcultar.style.cssText = "width:100%; padding:8px; background:#e74c3c; color:white; border:none; cursor:pointer; border-radius: 4px; margin-top: 5px;";
                btnOcultar.onclick = () => { if (window.limpiarRuta) window.limpiarRuta(); };
                div.appendChild(btnOcultar);
            } else {
                div.innerHTML += `<p style="font-size:11px; color:#888;">No hay rutas registradas a menos de 1km.</p>`;
            }
            
            marker.bindPopup(div);
            listaMarcadores.push({ nombre, marker });
        };

        data.elements.forEach(el => {
            const nombre = el.tags.name || "";
            const esSuperior = /universidad|facultad|instituto tecn|anahuac|marista|enes|uady|politécnica|humanitas/i.test(nombre);
            const esBasicaOPrepa = /primaria|secundaria|kinder|jardin|preescolar|telesecundaria|prepa|bachiller/i.test(nombre);
            
            if (esSuperior && !esBasicaOPrepa) {
                procesar(nombre, el.lat || el.center.lat, el.lon || el.center.lon);
            }
        });

        manuales.forEach(m => procesar(m.nombre, m.lat, m.lon));

    } catch (err) {
        console.error("Error al cargar datos:", err);
        cargandoDiv.style.display = 'none';
    }
}