import * as data from "./data.js";
import * as yearSlider from "./components/year-slider.js";
import { drawMap } from "./components/map.js";
import * as players from "./components/players.js";
import { drawEvents } from "./components/events.js";
import { drawClubData } from "./components/clubdata.js";

let playerData = [];
let transferData = [];
let mapData = [];
let clubData = [];
let eventsData = [];

let selectedPlayer = null;
let hoveredPlayer = null;

let selectedClub = null;
let hoveredClub = null;

let selectedYear = null;

let selectedEvents = new Set();

const setSelectedPlayer = (player) => {
  selectedPlayer = selectedPlayer != player ? player : null;
  // Set or reset year range
  if (selectedPlayer != null) {
    let range = transferData[selectedPlayer.name].metadata;
    yearSlider.limitYear(range.start, range.end);
  } else {
    yearSlider.limitYear(null, null);
  }

  redraw();
};

const setHoveredPlayer = (player) => {
  hoveredPlayer = player;
  redraw();
};

const setSelectedClub = (club) => {
  selectedClub = selectedClub != club ? club : null;

  if (selectedClub != null) {
    if (selectedPlayer != null) {
      let year = transferData[selectedPlayer.name].data.find(
        (transfer) => transfer.club_name == selectedClub
      ).year;
      yearSlider.setSelectedYear(year);
    }
  }

  redraw();
};

const setHoveredClub = (club) => {
  hoveredClub = club;
  redraw();
};

const setSelectedYear = (year) => {
  selectedYear = year;
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
  drawMap(
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
  );
};

window.onload = async () => {
  // Get data
  mapData = await data.getMapData();
  playerData = await data.getPlayerData();
  transferData = await data.getTransferData();
  clubData = await data.getClubData();
  eventsData = Promise.all(
    playerData.map((player) => data.getEventsData(player.name))
  );

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

  // Draw
  window.onresize = redraw;
  redraw();
};
