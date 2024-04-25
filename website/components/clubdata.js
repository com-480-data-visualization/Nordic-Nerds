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

  const negativeRanges = [[2001, ranges[0][0]]].concat(utils.zip2(ranges, utils.tail(ranges)).map(rangePair => [rangePair[0][1], rangePair[1][0]]), [[utils.last(ranges)[1], 2023]]) 
  const allRanges = utils.zip2(utils.interleave(negativeRanges, ranges), utils.repeat([false, true], negativeRanges.length))
  console.log(allRanges)

  textElem.innerHTML = `${selectedPlayer.name} ${
    ranges.length > 1 ? `had ${utils.numberWord(ranges.length)} spells at ${selectedClub}; from ` : `played at ${selectedClub} from `
  } ${utils.enumerationString(ranges.map((range) => range[0] + " to " + range[1]))}`;

  const svg = d3.select("#scatter");
  const margin = {top: 30, right: 30, bottom: 50, left: 30}
  const FULL_WIDTH = svg.node().getBoundingClientRect().width
  const FULL_HEIGHT = svg.node().getBoundingClientRect().height
  const width =  FULL_WIDTH - margin.left - margin.right;
  const height = FULL_HEIGHT - margin.top - margin.bottom;

  const svgStyle = getComputedStyle(svg.node())
  const fontSize = parseFloat(svgStyle.fontSize);

  svg
    .select("#trans")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3.scaleLinear().domain([0.8, 2.5]).range([margin.left, margin.left + width ]);
  svg
    .select("#x")
    .attr("transform", "translate("+ 0 + "," + (margin.top + height) + ")")
    .call(d3.axisBottom(x));
  svg
    .select("#labelX")
    .text("Goals scored per game")
    .attr("y", margin.top )
    .attr("x", width/2 + margin.left)
    .style("text-anchor", "middle")
    .style('fill', 'black')

  const y = d3.scaleLinear().domain([1.5, 0.5]).range([margin.top, margin.top + height]);
  svg
    .select("#y")
    .attr("transform", "translate(" + margin.left + ","+  0 + ")")
    .call(d3.axisLeft(y));
  svg
    .select("#labelY")
    .text("Goals conceded per game")
    .attr("x", margin.left*3)
    .attr("y", margin.top / 2)
    .style('fill', 'black')

  const color = d3.scaleSequential()
    .domain(d3.extent(DUMMY_SPELLS, d => d.ppg))
    .interpolator(d3.interpolateReds);

  svg
    .select("#dots")
    .selectAll("path")
    .data(utils.zip2(DUMMY_SPELLS, allRanges))
    .join("path")
    .attr("d", d3.symbol(d => d[1][1] ? d3.symbolCircle : d3.symbolSquare, 1000))
    .attr('transform', d => "translate("+x(d[0].scored)+","+y(d[0].conceded)+")")
    .style("fill", d => color(d[0].ppg))

  svg
    .select("#dots")
    .selectAll("text")
    .data(utils.zip2(DUMMY_SPELLS, allRanges))
    .join("text")
    .attr("x", (d) => x(d[0].scored) + 20)
    .attr("y", (d) => y(d[0].conceded) + fontSize * 0.80/2 )
    .classed("scatter-label", true)
    .text((d) => d[1][0][0] + " to " + d[1][0][1]);

  const clubImage = clubData[selectedClub].image
  const BADGE_SIZE = 75;
  const BADGE_PADDING = 10;

  svg.select("#badge")
    .attr("href", clubImage.src)
    .attr("x", FULL_WIDTH - BADGE_SIZE - BADGE_PADDING)
    .attr("y", BADGE_PADDING)
    .attr("opacity",0.6)
    .attr("width", clubImage.width >= clubImage.height ? BADGE_SIZE : null)
    .attr("height", clubImage.width < clubImage.height ? BADGE_SIZE : null)

  svg
    .select("#plot-title")
    .text(`${selectedClub}'s performance with and without ${selectedPlayer.name}`)
    .attr("y", margin.top )
    .attr("x", width/2 + margin.left)
    .style("text-anchor", "middle")
    .style('fill', 'black')
};
