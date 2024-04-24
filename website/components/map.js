import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

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

  // const player_transfers = transferData.map((transfer))

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
    .attr("opacity", (d) =>
      selectedClub == null || selectedClub == d || hoveredClub == d ? 1 : 0.7
    )
    .classed(
      "club-badge-selected",
      (d) => selectedClub == d || hoveredClub == d
    )
    // These are mutually exclusive
    .attr("width", (d) =>
      d.image.width >= d.image.height ? MAP_BADGE_WIDTH : null
    )
    .attr("height", (d) =>
      d.image.width < d.image.height ? MAP_BADGE_WIDTH : null
    )
    .on("click", (_, d) => setSelectedClub(d))
    .on("mouseenter", (_, d) => setHoveredClub(d))
    .on("mouseleave", (_) => setHoveredClub(null));
};
