import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as utils from "../utils.js";

const MAP_BADGE_WIDTH = 40;
const ARROW_COLORS = ["#b3e0de", "#81cdc6", "#4fb9af", "#28a99e", "#05998c", "#048c7f", "#037c6e", "#036c5f", "#025043"]

export const drawMap = (
  mapData,
  clubData,
  transferData,
  selectedClub,
  hoveredClub,
  selectedPlayer,
  hoveredPlayer,
  setSelectedClub,
  setHoveredClub
) => {
  let svg = d3.select("#map");
  const size = svg.node().getBoundingClientRect().width;
  console.log(size);


  const playerTransfers = transferData[selectedPlayer?.name || hoveredPlayer?.name] || {data:[], metadata: {}};
  const playerClubs = selectedPlayer || hoveredPlayer ? playerTransfers.data.map(transfer => transfer.club_name) : [];
  const filteredClubData = selectedPlayer || hoveredPlayer ? Object.keys(clubData)
  .filter( key => playerClubs.includes(key) )
  .reduce( (res, key) => (res[key] = clubData[key], res), {} ) : clubData;
  const links = utils.range(0, playerTransfers.data.length - 1).map((i) => {
    const fromClub = filteredClubData[playerTransfers.data[i].club_name];
    const toClub = filteredClubData[playerTransfers.data[i + 1].club_name];
    return {
      type: "LineString",
      color: ARROW_COLORS[i],
      coordinates: [
        [fromClub.long, fromClub.lat],
        [toClub.long, toClub.lat],
      ],
    };
  });

  const projection = d3
    .geoMercator()
    .center([6.566957, 41.018059])
    .translate([size / 2, size / 2])
    .scale(size*1.2);

  const path = d3.geoPath()
    .projection(projection)

  // Draw the map
  svg
    .select("#countries")
    .selectAll("path")
    .data(mapData)
    .join("path")
    .attr("fill", getComputedStyle(document.documentElement).getPropertyValue("--bg"))
    .attr("d", d3.geoPath().projection(projection));

  svg.select("defs")
    .selectAll("marker")
    .data(ARROW_COLORS)
    .join("marker")
    .attr("id", d => `arrow-${d}`)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 25)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("fill", d => d)
    .attr("d", 'M0,-5L10,0L0,5');

  // Draw the links
  svg.select("#links")
    .selectAll("path")
    .data(links)
    .join("path")
      .attr("d", function(d){ return path(d)})
      .style("fill", "none")
      .style("stroke", d => d.color)
      .style("stroke-width", 2)
      .attr("marker-end", d => `url(#arrow-${d.color})`);

    
  // Draw the clubs
  svg
    .select("#clubs")
    .selectAll("image")
    .data(Object.entries(filteredClubData))
    .join("image")
    .attr("href", (d) => d[1].image.src)
    .attr("x", (d) => projection([d[1].long, d[1].lat])[0] - MAP_BADGE_WIDTH / 2)
    .attr("y", (d) => projection([d[1].long, d[1].lat])[1] - MAP_BADGE_WIDTH / 2)
    .attr("opacity", (d) => (selectedClub == null || selectedClub == d[0] || hoveredClub == d[0] ? 1 : 0.7))
    .classed("club-badge-selected", (d) => selectedClub == d[0] || hoveredClub == d[0])
    // These are mutually exclusive
    .attr("width", (d) => (d[1].image.width >= d[1].image.height ? MAP_BADGE_WIDTH : null))
    .attr("height", (d) => (d[1].image.width < d[1].image.height ? MAP_BADGE_WIDTH : null))
    .on("click", (_, d) => setSelectedClub(d[0]))
    .on("mouseenter", (_, d) => setHoveredClub(d[0]))
    .on("mouseleave", (_) => setHoveredClub(null));

};
