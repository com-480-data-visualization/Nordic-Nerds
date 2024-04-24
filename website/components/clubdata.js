import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as utils from "../utils.js";

const DUMMY_SPELLS = [
  { scored: 1.2, conceded: 0.8, ppg: 1.7 },
  { scored: 2, conceded: 0.7, ppg: 2 },
  { scored: 1.7, conceded: 1.2, ppg: 1.4 },
  { scored: 0.9, conceded: 1.3, ppg: 1 },
  { scored: 1.2, conceded: 1.3, ppg: 1.2 },
  { scored: 2.2, conceded: 1, ppg: 2.3 },
];

export const drawClubData = (clubData, transferData, selectedPlayer, selectedClub) => {
  const textElem = document.getElementById("club-data-description");
  if (!selectedClub || !selectedPlayer) {
    textElem.innerHTML = "Select a player and a club to see the player's impact on the clubs performance.";
    return;
  }

  const transferRecord = transferData[selectedPlayer.name];
  const transferIndices = transferRecord.data
    .map((transfer, i) => [transfer, i])
    .filter((transfer) => transfer[0].club_name == selectedClub)
    .map((transfer) => transfer[1]);
  const ranges = transferIndices.map((index) => {
    const start = Number(transferRecord.data[index].season.slice(0, 4));
    const end = index == transferRecord.data.length - 1 ? transferRecord.metadata.end : Number(transferRecord.data[index + 1].season.slice(0, 4));
    return [start, end];
  });

  textElem.innerHTML = `${selectedPlayer.name} ${
    ranges.length > 1 ? `had ${utils.numberWord(ranges.length)} spells at ${selectedClub}; from ` : `played at ${selectedClub} from `
  } ${utils.enumerationString(ranges.map((range) => range[0] + " to " + range[1]))}`;

  const svg = d3.select("#scatter");
  const width = 460;
  const height = 400;

  const x = d3.scaleLinear().domain([0.5, 2.5]).range([0, width]);
  svg
    .select("#x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  const y = d3.scaleLinear().domain([2.5, 0.5]).range([height, 0]);
  svg
    .select("#x")
    .call(d3.axisLeft(y));

  const color = d3.scaleSequential()
    .domain(d3.extent(DUMMY_SPELLS, d => d.ppg))
    .interpolator(d3.interpolateReds);


  svg
    .select("#dots")
    .selectAll("dot")
    .data(DUMMY_SPELLS)
    .join("circle")
    .attr("cx", (d) => x(d.scored))
    .attr("cy", (d) => y(d.conceded))
    .attr("r", 10)
    .style("fill", d => color(d.ppg));
};
