import * as data from "./data.js";
import * as yearSlider from "./components/year-slider.js";
import * as map from "./components/map.js";
import * as players from "./components/players.js";
import * as events from "./components/events.js";
import { drawClubData } from "./components/clubdata.js";
import * as utils from "./utils.js";

let playerData = [];
let transferData = [];
let mapData = [];
let clubData = [];
let eventsData = [];

let selectedPlayer = null;
let hoveredPlayer = null;

let selectedClub = null;

let selectedYear = null;

let selectedEvents = new Set();

const setSelectedPlayer = (player) => {
  selectedPlayer = selectedPlayer != player ? player : null;
  // Set or reset year range
  if (selectedPlayer != null) {
    let range = transferData[selectedPlayer.name].metadata;
    selectedYear = yearSlider.limitYear(range.start, range.end);
    yearSlider.setIntervals(
      transferData[selectedPlayer.name].data.map((d) => d.year)
    );
    selectedClub = utils.findPlayerClub(
      selectedPlayer,
      transferData,
      selectedYear
    );
  } else {
    yearSlider.setIntervals(null);
    yearSlider.limitYear(null, null);
    selectedClub = null;
  }

  redraw();
};

const setHoveredPlayer = (player) => {
  hoveredPlayer = player;
  redraw();
};

const setSelectedYear = (year) => {
  selectedYear = year;

  if (selectedPlayer != null) {
    selectedClub = utils.findPlayerClub(
      selectedPlayer,
      transferData,
      selectedYear
    );
  }

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
  players.draw(
    playerData,
    selectedPlayer,
    hoveredPlayer,
    setSelectedPlayer,
    setHoveredPlayer
  );
  map.draw(
    mapData,
    clubData,
    playerData,
    transferData,
    selectedClub,
    selectedPlayer,
    hoveredPlayer,
    selectedYear,
    setSelectedPlayer
  );
  events.draw(
    selectedYear,
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
  );
};

window.onload = async () => {
  // Get data
  mapData = await data.getMapData();
  playerData = await data.getPlayerData();
  transferData = await data.getTransferData();
  clubData = await data.getClubData();
  eventsData = await data.getEventsData();

  // Setup components
  yearSlider.setup(
    ...Object.values(transferData)
      .map((d) => d.metadata)
      .reduce(
        (acc, d) => [Math.min(acc[0], d.start), Math.max(acc[1], d.end)],
        [Infinity, -Infinity]
      ),
    setSelectedYear
  );

  map.setup();
  events.setup();

  // Draw
  window.onresize = redraw;
  redraw();
};
