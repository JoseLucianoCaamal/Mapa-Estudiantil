export function activarGeolocalizacion(mapa) {
    const btn = document.getElementById('btn-ubicacion');
    if (!btn) {
        console.error("Error: No se encontró el botón con ID 'btn-ubicacion' en el HTML.");
        return;
    }

    let marcadorUsuario = null;
    let circuloUbicacion = null; // Variable para el círculo verde

    btn.addEventListener('click', () => {
        console.log("📍 Solicitando ubicación al navegador...");
        btn.innerText = "⏳ Buscando..."; 
        
        mapa.locate({
            setView: true, 
            maxZoom: 15, 
            enableHighAccuracy: true,
            timeout: 10000 
        });
    });

    // ÉXITO
    mapa.on('locationfound', (e) => {
        console.log("✅ Ubicación encontrada:", e.latlng);
        btn.innerText = "📍 ¿Dónde estoy?"; 

        if (marcadorUsuario) mapa.removeLayer(marcadorUsuario);
        if (circuloUbicacion) mapa.removeLayer(circuloUbicacion); // Borrar círculo viejo si se mueve
        
        marcadorUsuario = L.marker(e.latlng).addTo(mapa);
        
        // --- DIBUJAR CÍRCULO VERDE DE 1KM ---
        circuloUbicacion = L.circle(e.latlng, {
            color: '#27ae60',
            fillColor: '#27ae60',
            fillOpacity: 0.15,
            radius: 1000 // 1km
        }).addTo(mapa);

        let div = document.createElement('div');
        div.innerHTML = `<h3 style="color: #27ae60; margin-bottom: 5px;">📍 Tu ubicación actual</h3>`;

        if (window.obtenerRutasGlobal) {
            const rutas = window.obtenerRutasGlobal(e.latlng);
            
            if (rutas.length > 0) {
                div.innerHTML += `<p style="font-size:12px; margin-bottom:5px;">Rutas a menos de 1km de ti:</p>`;
                
                rutas.forEach(ruta => {
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
            } else {
                div.innerHTML += `<p style="font-size:11px; color:#888;">No tienes rutas registradas a menos de 1km de tu posición actual.</p>`;
            }
        } else {
            console.error("⚠️ window.obtenerRutasGlobal no está definida aún.");
        }
        
        marcadorUsuario.bindPopup(div).openPopup();
    });

    // ERROR
    mapa.on('locationerror', (e) => {
        console.error("❌ Error de geolocalización:", e.message);
        btn.innerText = "📍 ¿Dónde estoy?"; 
        
        alert(`No pudimos encontrar tu ubicación.\nMotivo: ${e.message}\n\nPor favor, verifica que tienes el GPS encendido y que le diste permisos a esta página en el ícono del candado junto a la URL.`);
    });
}
