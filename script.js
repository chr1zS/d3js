console.log("Cargando fichero script.js")


// Función para redimensionar el mapa
function resize() {
  var width = window.innerWidth;
  var height = window.innerHeight;

  // Actualizar el tamaño del contenedor SVG
  svg.attr("width", width)
    .attr("height", height);


  // Calcular la escala y la traslación óptimas para el mapa
  var bounds = path.bounds(geojson);
  var scale = 0.9 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height);
  var translate = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2, (height - scale * (bounds[1][1] + bounds[0][1])) / 2];

  // Actualizar la proyección del mapa con la escala y traslación calculadas
  projection.scale(scale).translate(translate);

  // Volver a dibujar los distritos
  svg.selectAll(".distrito")
    .attr("d", path);
}

// Ancho y alto iniciales del contenedor SVG
var width = window.innerWidth - 150;
var height = window.innerHeight;


// Crear una proyección inicial para el mapa
var projection = d3.geoMercator()
  .center([-3.7038, 40.4168])  // Coordenadas de Madrid
  .scale(70000) // Cambiar este valor para ajustar la escala del mapa
  .translate([width / 2, height / 2]);

// Crear una función de trayecto para dibujar las geometrías
var path = d3.geoPath().projection(projection);

// Seleccionar el contenedor SVG
var svg = d3.select("#mapaMadrid")
  .attr("width", width)
  .attr("height", height);

// Cargar los datos geoespaciales de los distritos de Madrid
d3.json("madrid_districts.geojson").then(function (geojson) {
  // Dibujar los distritos
  svg.selectAll(".distrito")
    .data(geojson.features)
    .enter().append("path")
    .attr("class", "distrito")
    .attr("d", path)
      // Agregar evento para mostrar el nombre del distrito al pasar el ratón
    .on("mouseover", function (d) {
      // Obtener el nombre del distrito
      var distritoNombre = d.properties.NAME;

      // Mostrar el nombre del distrito en un tooltip
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(distritoNombre)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function (d) {
      // Ocultar el tooltip al quitar el ratón del distrito
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
});

// Crear un tooltip para mostrar el nombre del distrito
var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Escuchar el evento de redimensionamiento de la ventana
window.addEventListener("resize", resize);





