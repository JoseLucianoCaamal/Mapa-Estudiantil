export function activarGeolocalizacion(mapa) {
    const btn = document.getElementById('btn-ubicacion');
    const btnCentrar = document.getElementById('btn-centrar'); 
    if (!btn) return;

    let marcadorUsuario = null;
    let circuloUbicacion = null; 
    let rastreando = false;

    window.ubicacionActualUsuario = null; 

    // Lógica del botón para centrar manualmente
    if (btnCentrar) {
        btnCentrar.addEventListener('click', () => {
            if (window.ubicacionActualUsuario) {
                mapa.setView(window.ubicacionActualUsuario, 16);
            }
        });
    }

    btn.addEventListener('click', () => {
        if (!rastreando) {
            btn.innerText = "🛑 Detener GPS";
            btn.style.backgroundColor = "#e74c3c";
            btn.style.color = "white";
            if(btnCentrar) btnCentrar.style.display = "inline-block"; // Mostrar el botón de centrar
            
            // CAMBIO CLAVE: setView en false para que no te secuestre la cámara
            mapa.locate({
                watch: true, 
                setView: false, 
                enableHighAccuracy: true
            });
            rastreando = true;
        } else {
            mapa.stopLocate();
            btn.innerText = "📍 ¿Dónde estoy?";
            btn.style.backgroundColor = "";
            btn.style.color = "";
            if(btnCentrar) btnCentrar.style.display = "none"; // Ocultar el botón
            rastreando = false;
        }
    });

    mapa.on('locationfound', (e) => {
        window.ubicacionActualUsuario = e.latlng;

        if (!marcadorUsuario) {
            // Centrar automáticamente solo la primera vez que te encuentra
            mapa.setView(e.latlng, 16);

            // NUEVO: ICONO PERSONALIZADO PARA EL USUARIO
            const iconoUser = L.icon({
                iconUrl: './Img/user.png',
                iconSize: [32, 32], // Ajusta el tamaño aquí si lo ves muy grande o pequeño
                iconAnchor: [22, 22],
                popupAnchor: [0, -22]
            });

            marcadorUsuario = L.marker(e.latlng, { icon: iconoUser }).addTo(mapa);
            
            // Círculo más realista (40 metros en lugar de 1000)
            circuloUbicacion = L.circle(e.latlng, {
                color: '#27ae60', fillColor: '#27ae60', fillOpacity: 0.15, radius: 40
            }).addTo(mapa);
            
            marcadorUsuario.bindPopup(`<h3 style="color:#27ae60; margin:0;">📍 Tú estás aquí</h3>`).openPopup();
        } else {
            // Si ya existías, solo mueve el ícono sin obligar a la cámara a moverse
            marcadorUsuario.setLatLng(e.latlng);
            circuloUbicacion.setLatLng(e.latlng);
        }
    });

    mapa.on('locationerror', (e) => {
        console.error("❌ Error de geolocalización:", e.message);
        btn.innerText = "📍 ¿Dónde estoy?"; 
        btn.style.backgroundColor = "";
        if(btnCentrar) btnCentrar.style.display = "none";
        rastreando = false;
        alert(`No pudimos rastrear tu ubicación.\nMotivo: ${e.message}`);
    });
}