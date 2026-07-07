export function activarGeolocalizacion(mapa) {
    const btn = document.getElementById('btn-ubicacion');
    if (!btn) {
        console.error("Error: No se encontró el botón con ID 'btn-ubicacion' en el HTML.");
        return;
    }

    let marcadorUsuario = null;

    btn.addEventListener('click', () => {
        console.log("📍 Solicitando ubicación al navegador...");
        // Cambiamos el texto del botón para que sepas que sí le diste clic
        btn.innerText = "⏳ Buscando..."; 
        
        // Pedimos la ubicación con alta precisión y un límite de tiempo de 10 segundos
        mapa.locate({
            setView: true, 
            maxZoom: 15, 
            enableHighAccuracy: true,
            timeout: 10000 
        });
    });

    // ÉXITO: El navegador encontró tu ubicación
    mapa.on('locationfound', (e) => {
        console.log("✅ Ubicación encontrada:", e.latlng);
        btn.innerText = "📍 ¿Dónde estoy?"; // Restaurar el botón

        if (marcadorUsuario) mapa.removeLayer(marcadorUsuario);
        
        marcadorUsuario = L.marker(e.latlng).addTo(mapa);
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

    // ERROR: El navegador rechazó el permiso o no tiene GPS
    mapa.on('locationerror', (e) => {
        console.error("❌ Error de geolocalización:", e.message);
        btn.innerText = "📍 ¿Dónde estoy?"; // Restaurar el botón
        
        // Le mostramos al usuario exactamente qué falló
        alert(`No pudimos encontrar tu ubicación.\nMotivo: ${e.message}\n\nPor favor, verifica que tienes el GPS encendido y que le diste permisos a esta página en el ícono del candado junto a la URL.`);
    });
}
