export function activarGeolocalizacion(mapa) {
    const btn = document.getElementById('btn-ubicacion');
    if (!btn) return;

    let marcadorUsuario = null;
    let circuloUbicacion = null; 
    let rastreando = false;

    window.ubicacionActualUsuario = null; 

    btn.addEventListener('click', () => {
        if (!rastreando) {
            btn.innerText = "🛑 Detener GPS";
            btn.style.backgroundColor = "#e74c3c";
            btn.style.color = "white";
            
            mapa.locate({
                watch: true, 
                setView: 'untilPan', 
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

        if (window.destinoPeatonal && !window.yaAvisoLlegada) {
            const distanciaMetros = e.latlng.distanceTo(window.destinoPeatonal);
            console.log(`📍 Distancia al destino: ${Math.round(distanciaMetros)} metros`);
            
            if (distanciaMetros <= 50) {
                window.yaAvisoLlegada = true; 
                
                if (navigator.vibrate) {
                    navigator.vibrate([200, 100, 200, 100, 500]);
                }
                
                setTimeout(() => {
                    alert("📍 ¡Llegaste! Estás a menos de 50 metros del paradero seleccionado.");
                }, 500);
            }
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