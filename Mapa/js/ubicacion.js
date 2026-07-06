export function activarGeolocalizacion(mapa) {
    const btn = document.getElementById('btn-ubicacion');

    btn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización.");
            return;
        }

        btn.innerText = "Buscando...";

        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const lat = posicion.coords.latitude;
                const lon = posicion.coords.longitude;

                // Centramos el mapa en el usuario con animación
                mapa.flyTo([lat, lon], 15);

                // Le ponemos un pin visual distinto (un círculo azul)
                L.circleMarker([lat, lon], {
                    radius: 8,
                    fillColor: "#3388ff",
                    color: "#ffffff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(mapa).bindPopup("¡Estás aquí!").openPopup();

                btn.innerText = "📍 ¿Dónde estoy?";
            },
            (error) => {
                console.error("Error GPS:", error);
                alert("No pudimos obtener tu ubicación. Revisa tus permisos.");
                btn.innerText = "📍 ¿Dónde estoy?";
            }
        );
    });
}