var format = d3.format(",");

// Set tooltips
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function (d) {
    return "<strong>Country: </strong><span class='details'>"
      + d.properties.name
      + "<br></span>"
      + "<strong>Population: </strong><span class='details'>"
      + format(d.population)
      + "</span>";
  })

// Setting camvas size
var margin = { top: 0, right: 0, bottom: 0, left: 0 },
  width = 960 - margin.left - margin.right,
  height = 750 - margin.top - margin.bottom;

// the color of the map with its scale
var color = d3.scaleThreshold()
  .domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000])
  .range([
    "#FEFCED",
    "#FFF8D9",
    "#FEF5BD",
    "#FFEDB8",
    "#FDE3B3",
    "#F8CFAA",
    "#F1A893",
    "#E47479",
    "#C03F58",
    "#760420"
  ]);

var path = d3.geoPath();

var svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append('g')
  .attr('class', 'map');

var projection = d3.geoMercator()
  .scale(130)
  .translate([width / 2, height / 1.5]);

var path = d3.geoPath().projection(projection);

svg.call(tip);

var gpopulation;
var gdata;

queue()
  .defer(d3.json, "world_countries.json")
  .defer(d3.json, "country-full-population.json")
  .await(ready);

function ready(error, data, population) {
  gdata = data;
  gpopulation = population;
  drawchart();
  setInterval(drawchart, 1000)
}


function drawchart() {

  
  var populationById = {};
  var paises = [];

  // select the year we want to watch from the combo
  var year=parseInt(document.getElementById("combo").value);
  
  //preparing and filtering the data we want to show
  var paises = gpopulation.filter(gdata => gdata.Year === year)
  .map(gdata => ([gdata["Country Code"], gdata.Value]));
  paises.forEach(function (d) { populationById[d[0]] = +d[1]; });
  gdata.features.forEach(function (d) { d.population = populationById[d.id] });

  //Adding the svg map with its colours
  svg.append("g")
    .attr("class", "countries")
    .selectAll("path")
    .data(gdata.features)
    .enter().append("path")
    .attr("d", path)
    .style("fill", function (d) { return color(populationById[d.id]); })
    .style('stroke', 'white')
    .style('stroke-width', 1.5)
    .style("opacity", 0.8)
    // tooltips
    .style("stroke", "white")
    .style('stroke-width', 0.3)
    .on('mouseover', function (d) {
      tip.show(d);

      d3.select(this)
        .style("opacity", 1)
        .style("stroke", "white")
        .style("stroke-width", 3);
    })
    .on('mouseout', function (d) {
      tip.hide(d);

      d3.select(this)
        .style("opacity", 0.8)
        .style("stroke", "white")
        .style("stroke-width", 0.3);
    })
    ;
}


