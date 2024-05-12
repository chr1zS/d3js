console.log("Cargando fichero script.js")

// Ancho y alto iniciales del contenedor SVG
var width = 569;
var height = 725;

// Crear una proyección inicial para el mapa
var projection = d3.geoMercator()
  .center([-3.7038, 40.4168])  // Coordenadas de Madrid
  .scale(70000) // Cambiar este valor para ajustar la escala del mapa
  .translate([width / 2, height / 2]);

// Crear una función de trayecto para dibujar las geometrías
var path = d3.geoPath().projection(projection);
var dist = "";
// Seleccionar el contenedor SVG
var svg = d3.select("#mapaMadrid")

// Cargar los datos geoespaciales de los distritos de Madrid
console.log("Cargando datos geoespaciales...");
d3.json("madrid_districts.geojson").then(function (geojson) {

  // Dibujar los distritos
  svg.selectAll(".distrito")
    .data(geojson.features)
    .enter().append("path")
    .attr("class", "distrito")
    .attr("d", path)
    .on("click", d => subtitulo(d))

  function subtitulo(e) {
    console.log("Datos del distrito:", e);
    d3.select("#nombreDistrito").remove();
    dist = e.target.__data__.properties.name;
    d3.select("h1").append("h2")
      .style("font-size", "25px")
      .attr("id", "nombreDistrito")
      .text("Distrito: " + dist)
    construirTabla(dist);
  }

  // Mostrar nombres de distritos como etiquetas de texto
  svg.selectAll(".distrito-label")
    .data(geojson.features)
    .enter().append("text")
    .attr("class", "distrito-label")
    .attr("x", function (d) { return path.centroid(d)[0] - 13; }) // Ajustar la posición x
    .attr("y", function (d) { return path.centroid(d)[1]; }) // Mantener la posición y en el centro vertical
    .attr("dy", ".35em")
    .style("font-size", "8px")
    .text(function (d) { return d.properties.name; })


}).catch(function (error) {
  console.error("Error al cargar los datos geoespaciales:", error);
});

// Crear un tooltip para mostrar el nombre del distrito
var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);


//----------------------

function construirTabla(a) {
  nombreDistrito = a.toUpperCase();
  // Seleccionar el contenedor de la tabla y eliminar su contenido
  d3.select("#table-container").html("");
  //console.log("el distrito es: " + nombreDistrito)
  // Ruta del archivo CSV
  const csvFilePath = "AccidentesBicicleta_2023.csv";
  // Cargar el archivo CSV con D3.js
  d3.csv(csvFilePath).then(function (data) {
    //console.log("dentro de data")
    const centroData = data.filter(function (d) {
      console.log("Dentro de tabla: el distrito es: " + nombreDistrito)
      return d.distrito === nombreDistrito;
    });

    // Obtener la cantidad de accidentes en el distrito "CENTRO"
    const numAccidentesCentro = data.reduce(function (acc, d) {
      return acc + (d.distrito === nombreDistrito ? 1 : 0);
    }, 0);
    // Contar el número de accidentes por sexo en el distrito "CENTRO"
    const numMasculino = data.filter(function (d) {
      return d.distrito === nombreDistrito && d.sexo === "Hombre";
    }).length;
    const numFemenino = data.filter(function (d) {
      return d.distrito === nombreDistrito && d.sexo === "Mujer";
    }).length;
    const numOtro = data.filter(function (d) {
      return d.distrito === nombreDistrito && d.sexo === "Otro";
    }).length;

    // Determinar el sexo mayoritario en el distrito "CENTRO"

    const sexoMayoritario = encontrarMayor(numMasculino, numFemenino, numOtro);
    function encontrarMayor(a, b, c) {
      if (a >= b && a >= c) {
        return "Hombre";
      } else if (b >= a && b >= c) {
        return "Mujer";
      } else {
        return "Otro";
      }
    }

    // Función para obtener la hora más común
    function horaMasComun(data) {
      const horas = {};
      data.forEach(function (d) {
        const hora = d.hora.substr(0, 2); // Extraer solo la hora (primeros dos caracteres)
        if (horas[hora]) {
          horas[hora]++;
        } else {
          horas[hora] = 1;
        }
      });
      const horaMasComun = Object.keys(horas).reduce(function (a, b) {
        return horas[a] > horas[b] ? a : b;
      });
      return horaMasComun;
    }

    // Función para obtener la fecha más común
    function fechaMasComun(data) {
      const fechas = {};
      data.forEach(function (d) {
        const fecha = d.fecha;
        if (fechas[fecha]) {
          fechas[fecha]++;
        } else {
          fechas[fecha] = 1;
        }
      });
      const fechaMasComun = Object.keys(fechas).reduce(function (a, b) {
        return fechas[a] > fechas[b] ? a : b;
      });
      return fechaMasComun;
    }

    function lesividadMasComun(data) {

      // Contar la frecuencia de cada tipo de lesividad
      const lesividadCount = {};
      centroData.forEach(d => {
        if (d.lesividad in lesividadCount) {
          lesividadCount[d.lesividad]++;
        } else {
          lesividadCount[d.lesividad] = 1;
        }
      });

      // Encontrar la lesividad más común
      let maxLesividad = "";
      let maxCount = 0;
      for (const lesividad in lesividadCount) {
        if (lesividadCount[lesividad] > maxCount) {
          maxCount = lesividadCount[lesividad];
          maxLesividad = lesividad;
        }
      }
      return maxLesividad;
    }

    // Obtener el contenedor de la tabla
    const tableContainer = d3.select("#table-container");

    // Añadir el título de la tabla
    tableContainer.append("h3").text("Información del distrito " + a);

    // Crear la tabla
    const table = tableContainer.append("table");

    // Añadir filas a la tabla
    table.append("tr").html(`<td>Número de accidentes:</td><td>${numAccidentesCentro}</td>`);
    table.append("tr").html(`<td>Sexo con mayor accidentes:</td><td>${sexoMayoritario}</td>`);
    table.append("tr").html(`<td>Hora de más accidentes:</td><td>Entre las ${horaMasComun(centroData)} y ${parseInt(horaMasComun(centroData)) + 1} horas</td>`);
    table.append("tr").html(`<td>Fecha de más accidentes:</td><td>${fechaMasComun(centroData)}</td>`);
    table.append("tr").html(`<td>Lesividad más común:</td><td>${lesividadMasComun(data)}</td>`);

  })
}


// Escuchar el evento de redimensionamiento de la ventana
window.addEventListener("resize", resize);

