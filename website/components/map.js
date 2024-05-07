import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as utils from "../utils.js";

const MAP_BADGE_WIDTH = 40;

export const TRANSFER_COLORS = [
  "#000000",
  "#4a5079",
  "#961C34",
  "#93A80E",
  "#4992E7",
  "#e03022",
  "#A9A7BC",
  "#181B26",
  "#ed6922",
  "#4fa1c2",
];

const svg = d3.select("#map");

export const setup = () => {
  svg
    .select("defs")
    .selectAll("marker")
    .data(TRANSFER_COLORS)
    .join("marker")
    .attr("id", (d) => `arrow-${d}`)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 25)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("fill", (d) => d)
    .attr("d", "M0,-5L10,0L0,5");
};

export const draw = (
  mapData,
  clubData,
  playerData,
  transferData,
  selectedClub,
  hoveredClub,
  selectedPlayer,
  hoveredPlayer,
  selectedYear,
  setSelectedClub,
  setHoveredClub
) => {
  let links = [];
  let clubs = [];

  if (selectedPlayer || hoveredPlayer) {
    const playerTransfers = transferData[
      selectedPlayer?.name || hoveredPlayer?.name
    ].data.filter((transfer) => transfer.year <= selectedYear);

    const filteredClubData = Object.keys(clubData)
      .filter((clubName) =>
        playerTransfers.some((t) => t.club_name == clubName)
      )
      .reduce(
        (res, clubName) => ((res[clubName] = clubData[clubName]), res),
        {}
      );

    links = utils.ints(playerTransfers.length - 1).map((i) => {
      const fromClub = filteredClubData[playerTransfers[i].club_name];
      const toClub = filteredClubData[playerTransfers[i + 1].club_name];
      return {
        type: "LineString",
        color: TRANSFER_COLORS[i + 1],
        coordinates: [
          [fromClub.long, fromClub.lat],
          [toClub.long, toClub.lat],
        ],
      };
    });
    clubs = Object.entries(filteredClubData);
  } else {
    const playersClubs = playerData.map((player) => {
      return {
        club: transferData[player.name].data
          .slice()
          .reverse()
          .find((transfer) => transfer.year <= selectedYear)?.club_name,
        player: player,
      };
    });
    const clubsWithPlayers = Object.fromEntries(
      Object.keys(clubData)
        .map((club) => [
          club,
          playersClubs
            .filter((player) => player.club == club)
            .map((player) => player.player),
        ])
        .filter((d) => d[1].length > 0)
    );
    links = [];
    clubs = Object.entries(clubData).filter((d) => clubsWithPlayers[d[0]]);
  }

  const size = svg.node().getBoundingClientRect().width;
  const projection = d3
    .geoMercator()
    .center([6.566957, 41.018059])
    .translate([size / 2, size / 2])
    .scale(size * 1.2);

  drawCountries(mapData, projection);

  drawClubs(
    clubs,
    selectedClub,
    hoveredClub,
    setSelectedClub,
    setHoveredClub,
    projection
  );

  drawLinks(links, projection);
};

const drawClubs = (
  clubData,
  selectedClub,
  hoveredClub,
  setSelectedClub,
  setHoveredClub,
  projection
) => {
  svg
    .select("#clubs")
    .selectAll("image")
    .data(clubData)
    .join("image")
    .attr("href", (d) => d[1].image.src)
    .attr(
      "x",
      (d) => projection([d[1].long, d[1].lat])[0] - MAP_BADGE_WIDTH / 2
    )
    .attr(
      "y",
      (d) => projection([d[1].long, d[1].lat])[1] - MAP_BADGE_WIDTH / 2
    )
    .attr("opacity", (d) =>
      selectedClub == null || selectedClub == d[0] || hoveredClub == d[0]
        ? 1
        : 0.7
    )
    .classed(
      "club-badge-selected",
      (d) => selectedClub == d[0] || hoveredClub == d[0]
    )
    // These are mutually exclusive
    .attr("width", (d) =>
      d[1].image.width >= d[1].image.height ? MAP_BADGE_WIDTH : null
    )
    .attr("height", (d) =>
      d[1].image.width < d[1].image.height ? MAP_BADGE_WIDTH : null
    )
    .on("click", (_, d) => setSelectedClub(d[0]))
    .on("mouseenter", (_, d) => setHoveredClub(d[0]))
    .on("mouseleave", (_) => setHoveredClub(null));
};

const drawLinks = (links, projection) => {
  svg
    .select("#links")
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("d", (d) => d3.geoPath().projection(projection)(d))
    .style("fill", "none")
    .style("stroke", (d) => d.color)
    .style("stroke-width", 2)
    .attr("marker-end", (d) => `url(#arrow-${d.color})`);
};

const drawCountries = (mapData, projection) => {
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
};
