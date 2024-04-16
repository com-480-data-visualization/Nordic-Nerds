import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const players = ["zlatan"];
let selectedPlayer = null;

const teams = [];
let selectedTeam = null;

const setSelectedPlayer = (player) => {
  selectedPlayer = selectedPlayer != player ? player : null;
  redraw()
};

const redraw = () => {
    // Draw player images
    d3.select("#playersContainer")
        .selectAll("img")
        .data(players)
        .join("img")
        .attr("src",(player) => `images/${player}.png`)
        .attr("opacity", (player) => player == selectedPlayer ? 1 : 0.5)
        .on("click", (_, d) => setSelectedPlayer(d))

    // Draw selected player name
    d3.select("#playerName") 
        .selectAll("h1")
        .data(selectedPlayer != null ? [selectedPlayer] : [])
        .join("h1")
        .text((player) => player)
}

// Bootstrap the viz
redraw()