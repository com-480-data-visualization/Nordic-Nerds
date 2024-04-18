import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as utils from "./utils.js";
import * as data from "./data.js";

let playerData = [];
let selectedPlayer = null;

let mapData = [];
let clubData = [];

let selectedTeam = null;

const MAP_BADGE_WIDTH = 40;

const setSelectedPlayer = (player) => {
  selectedPlayer = selectedPlayer != player ? player : null;
  redraw();
};

const drawMap = (mapData, clubData) => {
  let svg = d3.select("#map");
  const size = svg.node().getBoundingClientRect().width;

  const projection = d3
    .geoMercator()
    .center([6.566957, 43.518059])
    .translate([size / 2, size / 2])
    .scale(size / 1.2);

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
  // Draw the clubs
  svg
    .select("#clubs")
    .selectAll("image")
    .data(clubData)
    .join("image")
    .attr("href", (d) => d.image.src)
    .attr("x", (d) => projection([d.long, d.lat])[0] - MAP_BADGE_WIDTH / 2)
    .attr("y", (d) => projection([d.long, d.lat])[1] - MAP_BADGE_WIDTH / 2)
    .attr("width", (d) =>
      d.image.width >= d.image.height ? MAP_BADGE_WIDTH : null
    )
    .attr("height", (d) =>
      d.image.width < d.image.height ? MAP_BADGE_WIDTH : null
    );
};

const drawPlayers = (players) => {
  d3.select("#players-container")
    .selectAll("img")
    .data(players)
    .join("img")
    .attr("src", (player) => player.portrait_src)
    .classed("player-portrait", true)
    .classed("selected", (player) => player == selectedPlayer)
    .on("click", (_, d) => setSelectedPlayer(d));
};

const redraw = () => {
  drawPlayers(playerData);
  drawMap(mapData, clubData);
};

window.onload = async () => {
  mapData = await data.getMapData();
  playerData = await data.getPlayerData();
  clubData = await data.getClubData();

  redraw();
};
window.onresize = redraw;
