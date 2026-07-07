export function activarGeolocalizacion(mapa) {
    const btn = document.getElementById('btn-ubicacion');
    if (!btn) return;

    let marcadorUsuario = null;
    let circuloUbicacion = null; 
    let rastreando = false;

    // Variable global para que el enrutador sepa desde dónde caminar
    window.ubicacionActualUsuario = null; 

    btn.addEventListener('click', () => {
        if (!rastreando) {
            btn.innerText = "🛑 Detener GPS";
            btn.style.backgroundColor = "#e74c3c";
            btn.style.color = "white";
            
            // watch: true activa el seguimiento en tiempo real
            mapa.locate({
                watch: true, 
                setView: 'untilPan', // Te centra la primera vez, pero luego te deja deslizar el mapa libremente
                maxZoom: 16, 
                enableHighAccuracy: true
            });
            rastreando = true;
        } else {
            mapa.stopLocate();
            btn.innerText = "📍 ¿Dónde estoy?";
            btn.style.backgroundColor = "";
            btn.style.color = "";
            rastreando = false;
        }
    });

    mapa.on('locationfound', (e) => {
        window.ubicacionActualUsuario = e.latlng;

        // Si es la primera vez que te encuentra, dibuja el círculo. Si ya existía, solo lo mueve a tu nuevo paso.
        if (!marcadorUsuario) {
            marcadorUsuario = L.marker(e.latlng).addTo(mapa);
            circuloUbicacion = L.circle(e.latlng, {
                color: '#27ae60', fillColor: '#27ae60', fillOpacity: 0.15, radius: 1000
            }).addTo(mapa);
            marcadorUsuario.bindPopup(`<h3 style="color:#27ae60; margin:0;">📍 Tú estás aquí</h3>`).openPopup();
        } else {
            marcadorUsuario.setLatLng(e.latlng);
            circuloUbicacion.setLatLng(e.latlng);
        }
    });

    mapa.on('locationerror', (e) => {
        console.error("❌ Error de geolocalización:", e.message);
        btn.innerText = "📍 ¿Dónde estoy?"; 
        btn.style.backgroundColor = "";
        rastreando = false;
        alert(`No pudimos rastrear tu ubicación.\nMotivo: ${e.message}`);
    });
}