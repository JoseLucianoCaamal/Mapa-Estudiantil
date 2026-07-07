<div align="center">
  
  <h1>🗺️ Mapa Estudiantil Mérida</h1>
  <p><b>Aplicación Web Progresiva (PWA) de movilidad y transporte público para universitarios.</b></p>

  <a href="https://joselucianocaamal.github.io/Mapa-Estudiantil/">
    <img src="https://img.shields.io/badge/📍_ABRIR_MAPA_EN_VIVO-004a99?style=for-the-badge&logo=safari&logoColor=white" alt="Abrir Aplicación" />
  </a>

  <br><br>

  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/Leaflet-199900?style=flat-square&logo=leaflet&logoColor=white" alt="Leaflet" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white" alt="PWA" />

</div>

<br>

## 🚀 Arquitectura y Soluciones Técnicas

Este proyecto no es solo un mapa, es una herramienta optimizada para dispositivos móviles que resuelve problemas de conectividad, rendimiento y usabilidad mediante ingeniería de software moderna:

* ⚡ **Caché Inteligente (Web Storage API):** Sistema de `LocalStorage` con caducidad programada de 7 días. Reduce las peticiones a bases de datos externas y disminuye el tiempo de renderizado inicial a 0 milisegundos en visitas recurrentes.
* 📱 **Progressive Web App (PWA):** Aplicación instalable nativamente mediante `manifest.json`. Implementa un *Service Worker* con estrategias de interceptación de red y actualización automática de caché para garantizar disponibilidad inmediata.
* 🔔 **Geocerca y Hardware Feedback (Geofencing):** Algoritmo de seguimiento en tiempo real (`watch: true`) que calcula matemáticamente la distancia vectorial hacia un paradero. Al quebrar la barrera de los 50 metros, invoca la `Vibration API` nativa del dispositivo para alertar al usuario de forma física.
* 🌐 **Consumo Dinámico & RegEx:** Integración con *Overpass API* (OpenStreetMap) para minería de datos espaciales. Utiliza Expresiones Regulares para aplicar filtros estrictos, discriminando centros de educación básica y aislando exclusivamente instituciones de nivel superior.
* 🚶‍♂️ **Enrutamiento Peatonal (Última Milla):** Consumo del motor *OSRM (Open Source Routing Machine)* para trazar dinámicamente caminos navegables a pie desde la posición GPS exacta del estudiante hasta la ruta de transporte seleccionada.
* 🔗 **Deep Linking & Manejo de Estado:** Uso de `URLSearchParams` y la *History API* para inyectar variables en la URL en tiempo real. Permite crear enlaces que, al compartirse, aíslan instituciones específicas, ejecutan autocompletado y realizan un *fly-to* (zoom automático) al objetivo.
* 🎨 **UI/UX Premium:** Interfaz *Mobile-First* bajo principios de *Glassmorphism* y control dinámico del DOM para alternar un Modo Oscuro nativo mediante inversión de matrices de color (`hue-rotate` e `invert`).
