import { json } from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export const getMapData = () =>
  json("./data/world_map.json").then((res) => res.features);

export const getClubData = () => getJsonData("club_data");

export const getPlayerData = () => getJsonData("player_data");

export const getTransferData = () => getJsonData("transfers")

export const getEventsData = (player) => getJsonData(`events/${player}`)

const getJsonData = (fileName) =>
  fetch(`./data/${fileName}.json`).then((res) => res.json());
