import * as data from "./data.js";
import { drawMap } from "./components/map.js";
import { drawPlayers } from "./components/players.js";
import { setupYearSlider } from "./components/year-slider.js";

let playerData = [];
let mapData = [];
let clubData = [];

let selectedPlayer = null;
let hoveredPlayer = null;

let selectedClub = null;
let hoveredClub = null;

const setSelectedPlayer = (player) => {
  selectedPlayer = selectedPlayer != player ? player : null;
  redraw();
};

const setHoveredPlayer = (player) => {
  hoveredPlayer = player;
  redraw();
};

const setSelectedClub = (club) => {
  selectedClub = selectedClub != club ? club : null;
  redraw();
};

const setHoveredClub = (club) => {
  hoveredClub = club;
  redraw();
};

const redraw = () => {
  drawPlayers(
    playerData,
    selectedPlayer,
    hoveredPlayer,
    setSelectedPlayer,
    setHoveredPlayer
  );
  drawMap(
    mapData,
    clubData,
    selectedClub,
    hoveredClub,
    setSelectedClub,
    setHoveredClub
  );
};

window.onload = async () => {
  // Get data
  mapData = await data.getMapData();
  playerData = await data.getPlayerData();
  clubData = await data.getClubData();

  // Setup components
  setupYearSlider(2009, 2021, (year) => {
    console.log(`${year} selected`);
  });

  // Draw
  window.onresize = redraw;
  redraw();
};
