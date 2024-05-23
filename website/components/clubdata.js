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

const MARGIN = { top: 30, right: 30, bottom: 50, left: 30 };

const DOT_SIZE = 500;

let prevSelectedPlayer = null;
let prevSelectedClub = null;

export const draw = (clubData, transferData, selectedPlayer, selectedClub) => {
  console.log("Drawing club data");
  const description = d3
    .select("#club-data-description")
    .style("font-style", "italic");
  const svg = d3.select("#scatter");

  const FULL_WIDTH = svg.node().getBoundingClientRect().width;
  const FULL_HEIGHT = svg.node().getBoundingClientRect().height;
  const width = FULL_WIDTH - MARGIN.left - MARGIN.right;
  const height = FULL_HEIGHT - MARGIN.top - MARGIN.bottom;

  const svgStyle = getComputedStyle(svg.node());
  const fontSize = parseFloat(svgStyle.fontSize);

  if (!selectedClub || !selectedPlayer) {
    description.text(
      "Select a player and a club to see the player's impact on the clubs performance."
    );
    // Clear all elements
    svg.select("#x").selectAll("g, path").remove();
    svg.select("#x").selectAll("text").text("");
    svg.select("#y").selectAll("g, path").remove();
    svg.select("#y").selectAll("text").text("");
    svg.select("#line").selectAll("*").remove();
    svg.select("#dots").selectAll("*").remove();
    svg.select("#plot-title").text("");
    return;
  }

  const transfer = transferData[selectedPlayer.name];

  const transferIndices = transfer.data
    .map((transfer, i) => [transfer, i])
    .filter((transfer) => transfer[0].club_name == selectedClub)
    .map((transfer) => transfer[1]);

  const ranges = transferIndices.map((index) => {
    const start = Number(transfer.data[index].season.slice(0, 4));
    const end =
      index == transfer.data.length - 1
        ? transfer.metadata.end
        : Number(transfer.data[index + 1].season.slice(0, 4));
    return [start, end];
  });

  const negativeRanges = [[2001, ranges[0][0]]].concat(
    utils
      .zip2(ranges, utils.tail(ranges))
      .map((rangePair) => [rangePair[0][1], rangePair[1][0]]),
    [[utils.last(ranges)[1], 2023]]
  );
  const allRanges = utils.zip2(
    utils.interleave(negativeRanges, ranges),
    utils.repeat([false, true], negativeRanges.length)
  );

  description.text(
    `${selectedPlayer.name} ${
      ranges.length > 1
        ? `had ${utils.numberWord(
            ranges.length
          )} spells at ${selectedClub}; from `
        : `played at ${selectedClub} from `
    } ${utils.enumerationString(
      ranges.map((range) => range[0] + " to " + range[1])
    )}`
  );

  svg
    .select("#trans")
    .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");

  const x = d3
    .scaleLinear()
    .domain([0.8, 2.5])
    .range([MARGIN.left, MARGIN.left + width]);

  svg
    .select("#x")
    .attr("transform", "translate(" + 0 + "," + (MARGIN.top + height) + ")")
    .call(d3.axisBottom(x));

  svg
    .select("#labelX")
    .text("Goals scored per game")
    .attr("y", MARGIN.top)
    .attr("x", width / 2 + MARGIN.left)
    .style("text-anchor", "middle")
    .style("fill", "black")
    .style("font-size", fontSize * 1.3)
    .style("font-weight", "bold");

  const y = d3
    .scaleLinear()
    .domain([1.5, 0.5])
    .range([MARGIN.top, MARGIN.top + height]);
  svg
    .select("#y")
    .attr("transform", "translate(" + MARGIN.left + "," + 0 + ")")
    .call(d3.axisLeft(y));
  svg
    .select("#labelY")
    .text("Goals conceded per game")
    .attr("x", MARGIN.left * 5.1)
    .attr("y", MARGIN.top / 2)
    .style("fill", "black")
    .style("font-size", fontSize * 1.2)
    .style("font-weight", "bold");

  const color = d3
    .scaleSequential()
    .domain(d3.extent(DUMMY_SPELLS, (d) => d.ppg))
    .interpolator(d3.interpolateRgb("#d1c2bd", "#880000"));
  svg
    .select("#dots")
    .selectAll("path")
    .data(utils.zip2(DUMMY_SPELLS, allRanges))
    .join("path")
    .attr(
      "d",
      d3.symbol((d) => (d[1][1] ? d3.symbolCircle : d3.symbolSquare), DOT_SIZE)
    )
    .attr(
      "transform",
      (d) => "translate(" + x(d[0].scored) + "," + y(d[0].conceded) + ")"
    )
    .style("fill", (d) => color(d[0].ppg));

  const spells = utils.zip2(DUMMY_SPELLS, allRanges);

  svg
    .select("#dots")
    .selectAll("text")
    .data(spells)
    .join("text")
    .attr("x", (d) => x(d[0].scored) + 20)
    .attr("y", (d) => y(d[0].conceded) + (fontSize * 0.8) / 2)
    .classed("scatter-label", true)
    .text((d) => d[1][0][0] + " to " + d[1][0][1]);

  const line = d3
    .line()
    .curve(d3.curveCatmullRom)
    .x((d) => x(d[0].scored))
    .y((d) => y(d[0].conceded));

  const l = d3
    .create("svg:path")
    .attr("d", line(spells))
    .node()
    .getTotalLength();

  svg.select("#line").selectAll("path").remove();
  const timeline = svg
    .select("#line")
    .append("path")
    .datum(spells)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line);

  if (
    prevSelectedPlayer != selectedPlayer ||
    prevSelectedClub != selectedClub
  ) {
    timeline
      .attr("stroke-dasharray", `0,${l}`)
      .transition()
      .duration(800)
      .ease(d3.easeLinear)
      .attr("stroke-dasharray", `${l},${l}`);
  } else {
    timeline.attr("stroke-dasharray", `${l},${l}`);
  }

  svg
    .select("#plot-title")
    .text(
      `${selectedClub}'s performance with and without ${selectedPlayer.name}`
    )
    .attr("y", MARGIN.top)
    .attr("x", width / 2 + MARGIN.left)
    .style("text-anchor", "middle")
    .style("fill", "black");

  prevSelectedPlayer = selectedPlayer;
  prevSelectedClub = selectedClub;
};
