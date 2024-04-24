import * as data from "./data.js";
import { drawMap } from "./components/map.js";
import { drawPlayers } from "./components/players.js";
import { setupYearSlider } from "./components/year-slider.js";
import {drawEvents} from "./components/events.js";
import {drawClubData} from "./components/clubdata.js";

let playerData = [];
let transferData = [];
let mapData = [];
let clubData = [];
let eventsData = [];

let selectedPlayer = null;
let hoveredPlayer = null;

let selectedClub = null;
let hoveredClub = null;

let selectedEvents = new Set();

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

const setSelectedEvents = (eventType) => {
  if (selectedEvents.delete(eventType)) {
    console.log(`${eventType} unselected.`);
  } else {
    selectedEvents.add(eventType);
    console.log(`${eventType} selected.`);
  }
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
    transferData,
    selectedClub,
    hoveredClub,
    selectedPlayer,
    hoveredPlayer,
    setSelectedClub,
    setHoveredClub
  );
  drawEvents(
    selectedPlayer,
    selectedClub,
    selectedEvents,
    eventsData,
    setSelectedEvents
  );
  drawClubData(
    clubData,
    transferData,
    selectedPlayer,
    selectedClub,
    setSelectedEvents
  )
};

window.onload = async () => {
  console.log("hei");
  // Get data
  mapData = await data.getMapData();
  playerData = await data.getPlayerData();
  transferData = await data.getTransferData();
  clubData = await data.getClubData();
  eventsData = Promise.all(
    playerData.map((player) => data.getEventsData(player.name))
  );

  // Setup components
  setupYearSlider(2009, 2021, 2009, 2021, (year) =>
    console.log(`${year} selected`)
  );

  // Draw
  window.onresize = redraw;

  redraw();
};
