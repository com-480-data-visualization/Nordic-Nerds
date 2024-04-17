import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as utils from "./utils.js";
import * as data from "./data.js";

const players = ["zlatan", "messi", "ronaldo", "haaland"];
let selectedPlayer = null;

const teams = [];
let selectedTeam = null;

const setSelectedPlayer = (player) => {
  selectedPlayer = selectedPlayer != player ? player : null;
  redraw();
};

const drawMap = (mapData) => {
  let svg = d3.select("#map");
  const size = Math.min(window.innerWidth, window.innerHeight) - 50;
  svg.attr("width", size);
  svg.attr("height", size);

  const projection = d3
    .geoMercator()
    .center([8.666764481935557, 58.1008393986825])
    .scale(size);
  // Draw the map
  svg
    .select("#countries")
    .selectAll("path")
    .data(mapData)
    .join("path")
    .attr(
      "fill",
      getComputedStyle(document.documentElement).getPropertyValue("--bg")
    )
    .attr("d", d3.geoPath().projection(projection));

  svg
    .select("#clubs")
    .selectAll("image")
    .data(data.getClubData())
    .join("image")
    .attr("xlink:href", (d) => d.img)
    .attr("x", (d) => projection([d.long, d.lat])[0])
    .attr("y", (d) => projection([d.long, d.lat])[1])
    .attr("width", 20)
    .attr("height", 24);
};

const drawPlayers = () => {
  d3.select("#players-container")
    .selectAll("img")
    .data(players)
    .join("img")
    .attr("src", (player) => `images/${player}.png`)
    .classed("player-portrait", true)
    .classed("selected", (player) => player == selectedPlayer)
    .on("click", (_, d) => setSelectedPlayer(d));
};

const redraw = () => {
  drawPlayers();

  d3.json(
    "https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson"
  ).then((d) => drawMap(d.features));
};

redraw();

window.onload = redraw;
window.onresize = redraw;
