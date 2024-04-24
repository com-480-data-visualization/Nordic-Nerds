import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as utils from "../utils.js";

const MAP_BADGE_WIDTH = 40;

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

  const player_transfers = transferData[selectedPlayer?.name || hoveredPlayer?.name] || {data:[], metadata: {}};
  const links = utils.range(0, player_transfers.data.length - 1).map((i) => {
    const fromClub = clubData[player_transfers.data[i].club_name];
    const toClub = clubData[player_transfers.data[i + 1].club_name];
    return {
      type: "LineString",
      coordinates: [
        [fromClub.long, fromClub.lat],
        [toClub.long, toClub.lat],
      ],
    };
  });
  console.log(links);

  const projection = d3
    .geoMercator()
    .center([6.566957, 43.518059])
    .translate([size / 2, size / 2])
    .scale(size / 1.2);

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

  // Draw the links
  svg.select("#links")
    .selectAll("path")
    .data(links)
    .join("path")
      .attr("d", function(d){ return path(d)})
      .style("fill", "none")
      .style("stroke", "#69b3a2")
      .style("stroke-width", 2)

  // Draw the clubs
  svg
    .select("#clubs")
    .selectAll("image")
    .data(Object.entries(clubData))
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
