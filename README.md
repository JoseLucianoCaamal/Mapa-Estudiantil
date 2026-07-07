# 🎓 Mapa Estudiantil Mérida (Mapa Bus)

[![Website Live](https://img.shields.io/badge/Website-Live-brightgreen.svg)](https://joselucianocaamal.github.io/Mapa-Estudiantil/)

Una Aplicación Web Progresiva (PWA) interactiva diseñada para ayudar a los estudiantes universitarios de Mérida, Yucatán, a encontrar rutas de transporte público (Va-y-Ven Periférico, Ruta 72, Ruta 92) cercanas a sus instituciones académicas.

## 🚀 Características Principales

* **Integración de Overpass API:** Consulta en tiempo real de nodos y vías educativas usando OpenStreetMap, con filtrado estricto mediante Expresiones Regulares (RegEx) para excluir educación básica y centrarse en nivel superior.
* **Caché Inteligente (LocalStorage):** Sistema de almacenamiento local con caducidad de 7 días para minimizar las peticiones a la API y reducir los tiempos de carga a 0 segundos en visitas recurrentes.
* **Progressive Web App (PWA):** Instalable en dispositivos móviles con *Service Worker* configurado para el manejo de caché estático (`sw.js`) y estrategias de actualización de red (Network-first / Cache-fallback).
* **Geocerca y Vibración (Geofencing):** Seguimiento GPS del usuario en tiempo real (`watch: true`) que calcula matemáticamente la distancia al paradero y activa la API nativa de vibración del dispositivo (`navigator.vibrate`) al estar a menos de 50 metros del objetivo.
* **Enrutamiento Peatonal ("Última Milla"):** Trazado dinámico de rutas a pie desde la ubicación del usuario hasta el paradero del camión utilizando `Leaflet Routing Machine` (OSRM).
* **Deep Linking:** Manipulación del estado de la URL mediante `URLSearchParams` y la *History API* para generar enlaces compartibles que hacen búsqueda y zoom automático a facultades específicas.
* **UI/UX Premium:** Interfaz responsiva *Mobile-First* con diseño *Glassmorphism*, feedback visual mediante geometría vectorial (círculos translúcidos de 1km de radio) y Modo Oscuro nativo con inversión inteligente de capas base del mapa.

## 🛠️ Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
* **Mapas y Geocodificación:** Leaflet.js, OpenStreetMap, OSRM (Open Source Routing Machine)
* **Consumo de Datos:** Fetch API, Overpass API, procesamiento de archivos GeoJSON
* **Arquitectura web:** PWA, Service Workers, Web Storage API, Geolocation API, Vibration API
