import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export const draw = (
  playersData,
  selectedPlayer,
  clubData,
  selectedClub,
  hoveredPlayer,
  setSelectedPlayer,
  setHoveredPlayer
) => {
  d3.select("#player-portraits")
    .selectAll("img")
    .data(playersData)
    .join("img")
    .attr("src", (player) => player.portrait_src)
    .classed("player-portrait", true)
    .classed(
      "player-portrait-selected",
      (d) => d == selectedPlayer || d == hoveredPlayer
    )
    .on("click", (_, d) => setSelectedPlayer(d))
    .on("mouseenter", (_, d) => setHoveredPlayer(d))
    .on("mouseleave", (_) => setHoveredPlayer(null));

  d3.select("#sidebar-club-image").attr(
    "src",
    clubData[selectedClub]?.image?.src
  );
};
