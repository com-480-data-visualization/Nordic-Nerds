import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as utils from "../utils.js";

const MAP_BADGE_WIDTH = 40;

export const TRANSFER_COLORS = [
  "#4a5079",
  "#961C34",
  "#93A80E",
  "#4992E7",
  "#e03022",
  "#A9A7BC",
  "#000000",
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
  selectedPlayer,
  hoveredPlayer,
  selectedYear,
  setSelectedPlayer
) => {
  let links = [];
  let clubs = [];
  let playersAndClubs = {};
  let clubToPlayers = {};

  if (selectedPlayer || hoveredPlayer) {
    const player = selectedPlayer || hoveredPlayer;
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

    const playersClubs = [
      {
        club: transferData[player.name].data
          .slice()
          .reverse()
          .find((transfer) => transfer.year <= selectedYear)?.club_name,
        player: player,
      },
    ];
    playersAndClubs = playersClubs.filter((pair) => pair.club);
    clubToPlayers = Object.fromEntries(
      Object.keys(clubData)
        .map((club) => [
          club,
          playersClubs
            .filter((player) => player.club == club)
            .map((player) => player.player),
        ])
        .filter((d) => d[1].length > 0)
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
    clubToPlayers = Object.fromEntries(
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
    clubs = Object.entries(clubData).filter((d) => clubToPlayers[d[0]]);
    playersAndClubs = playersClubs.filter((pair) => pair.club);
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
    clubData,
    playersAndClubs,
    clubToPlayers,
    selectedClub,
    setSelectedPlayer,
    projection
  );

  drawLinks(links, projection);
};

const player_x_offset = (index) => {
  switch (index) {
    case 0:
      return -15;
    case 1:
      return -30;
    case 2:
      return 40;
    default:
      return 50;
  }
};

const player_y_offset = (index) => {
  switch (index) {
    case 0:
      return -30;
    case 1:
      return -15;
    case 2:
      return 40;
    default:
      return 50;
  }
};

const drawClubs = (
  clubs,
  clubData,
  playersAndClubs,
  clubToPlayers,
  selectedClub,
  setSelectedPlayer,
  projection
) => {
  svg
    .select("#players")
    .selectAll("image")
    .data(playersAndClubs)
    .join("image")
    .attr("href", (d) => d.player.portrait_src)
    .attr(
      "x",
      (d) =>
        projection([clubData[d.club].long, clubData[d.club].lat])[0] -
        MAP_BADGE_WIDTH / 2 +
        player_x_offset(
          clubToPlayers[d.club].findIndex(
            (player) => d.player.name == player.name
          )
        )
    )
    .attr(
      "y",
      (d) =>
        projection([clubData[d.club].long, clubData[d.club].lat])[1] -
        MAP_BADGE_WIDTH / 2 +
        player_y_offset(
          clubToPlayers[d.club].findIndex(
            (player) => d.player.name == player.name
          )
        )
    )
    .attr("width", 40)
    .attr("height", 40)
    .on("click", (_, d) => setSelectedPlayer(d.player));

  svg
    .select("#clubs")
    .selectAll("image")
    .data(clubs)
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
      selectedClub == null || selectedClub == d[0] ? 1 : 0.7
    )
    .classed("club-badge-selected", (d) => selectedClub == d[0])
    // These are mutually exclusive
    .attr("width", (d) =>
      d[1].image.width >= d[1].image.height ? MAP_BADGE_WIDTH : null
    )
    .attr("height", (d) =>
      d[1].image.width < d[1].image.height ? MAP_BADGE_WIDTH : null
    );
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
