export function activarGeolocalizacion(mapa) {
    const btn = document.getElementById('btn-ubicacion');
    if (!btn) return;

    // Variables para guardar tu marcador y poder borrarlo si te mueves
    let marcadorUsuario = null;

    btn.addEventListener('click', () => {
        // Pedimos al navegador que busque tu ubicación
        mapa.locate({setView: true, maxZoom: 15});
    });

    // Si el navegador encuentra tu ubicación exitosamente:
    mapa.on('locationfound', (e) => {
        // 1. Limpiar tu marcador anterior si le vuelves a dar clic
        if (marcadorUsuario) mapa.removeLayer(marcadorUsuario);

        const latlng = e.latlng;
        
        // 2. Dibujamos un ícono especial (punto azul/verde) para ti
        marcadorUsuario = L.marker(latlng).addTo(mapa);

        // 3. Crear el cuadro de información (Popup)
        let div = document.createElement('div');
        div.innerHTML = `<h3 style="color: #27ae60; margin-bottom: 5px;">📍 Tu ubicación</h3>`;

        // 4. Buscar las rutas a 1km usando la función que hicimos global
        if (window.obtenerRutasGlobal) {
            const rutas = window.obtenerRutasGlobal(latlng);
            
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
        }
        
        marcadorUsuario.bindPopup(div).openPopup();
    });

    // Si el usuario rechaza los permisos o falla el GPS:
    mapa.on('locationerror', (e) => {
        alert("No se pudo obtener tu ubicación. Verifica que tienes activado el GPS y permite a tu navegador (candadito en la URL) acceder a tu ubicación.");
    });
}
