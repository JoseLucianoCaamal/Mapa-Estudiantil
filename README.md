#Mapa Estudiantil - Mérida 🎓

Un mapa web interactivo diseñado para ayudar a los estudiantes de Mérida, Yucatán, a encontrar las rutas de transporte público que pasan cerca de sus centros educativos. El mapa filtra dinámicamente instituciones de nivel medio superior y superior, y calcula con precisión si las rutas de autobús pasan dentro de un radio útil para el estudiante.

## ✨ Características Principales

* **Filtro Educativo Estricto:** Utiliza la API de Overpass (OpenStreetMap) para cargar dinámicamente instituciones de educación superior (Universidades, Facultades, Institutos Tecnológicos) y preparatorias, excluyendo automáticamente escuelas de educación básica (primarias, secundarias, preescolares).
* **Cálculo de Proximidad (Geofencing):** Mide matemáticamente la distancia entre la universidad y el trazado completo de la ruta de transporte. Los botones de las rutas solo se habilitan si el camión pasa a **menos de 1 km** de la institución.
* **Sistema Multirutas Escalable:** Preparado para leer múltiples archivos `.geojson` (Ruta 72, R1, R2, etc.). Si una escuela tiene más de una ruta cercana, generará las opciones correspondientes de forma dinámica.
* **Trazado y Limpieza de Rutas:** Interfaz intuitiva en cada marcador (pin) para dibujar la línea de la ruta en el mapa y un botón dedicado para limpiar la capa visual cuando ya no se necesite.
* **Geolocalización en Tiempo Real:** Herramienta integrada para centrar el mapa en la ubicación actual del usuario mediante el GPS del dispositivo.
* **Búsqueda Dinámica:** Barra de búsqueda optimizada para filtrar los marcadores en tiempo real por el nombre de la facultad o universidad.

## 🛠️ Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6 Modules).
* **Mapas y Renderizado:** [Leaflet.js](https://leafletjs.com/) para el motor del mapa interactivo.
* **Fuentes de Datos:**
  * **Overpass API / OpenStreetMap:** Para la obtención de coordenadas y nombres de los recintos universitarios (procesando tanto Nodos como Áreas/Ways).
  * **GeoJSON:** Para el renderizado de los recorridos de las rutas de transporte público.

## 📂 Estructura del Proyecto

```text
/
├── css/
│   └── estilos.css         # Estilos globales y personalización de pines (marcadores)
├── js/
│   ├── api.js              # Fetch a Overpass, filtro de niveles y lógica de distancia (1km)
│   ├── datos.js            # Almacenamiento del estado global de los marcadores
│   ├── main.js             # Punto de entrada y orquestador de módulos
│   ├── mapa.js             # Inicialización del canvas de Leaflet y Mapbox/Carto
│   ├── transporte.js       # Renderizado de capas GeoJSON (dibujar/limpiar rutas)
│   ├── ubicacion.js        # Lógica del botón "¿Dónde estoy?" (API de Geolocalización)
│   └── ui.js               # Control de eventos de la barra de búsqueda
├── rutas/
│   ├── 72.geojson          # Coordenadas de la Ruta 72
│   └── [otras_rutas].geojson 
└── index.html              # Estructura principal de la aplicación
