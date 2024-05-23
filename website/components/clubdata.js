import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as utils from "../utils.js";

const CLUB_PERF_START_YEAR = 2000;

const MARGIN = { top: 30, right: 30, bottom: 50, left: 30 };

const DOT_SIZE = 500;

let prevSelectedPlayer = null;
let prevSelectedClub = null;

export const draw = (transferData, clubPerformanceData, selectedPlayer, selectedClub) => {
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

  const negativeRanges = [[2000, ranges[0][0]]].concat(
    utils
      .zip2(ranges, utils.tail(ranges))
      .map((rangePair) => [rangePair[0][1], rangePair[1][0]]),
    utils.last(ranges)[1]!=2023 ? [[utils.last(ranges)[1], 2023]] : []
  );
  const allRanges = utils.zip2(
    utils.interleave(negativeRanges, ranges),
    utils.repeat([false, true], negativeRanges.length)
  );

  console.log(allRanges);
  const clubPerformance = clubPerformanceData[selectedClub];
  console.log(clubPerformance);
  const spellPerformance = allRanges.map(range => {
    const start = range[0][0] - CLUB_PERF_START_YEAR;
    const end = range[0][1] - CLUB_PERF_START_YEAR;
    const years = clubPerformance.slice(start, end);
    const scored = years.reduce((old, n) => old + n.scored, 0);
    const conceded = years.reduce((old, n) => old + n.conceded, 0);
    const played = years.reduce((old, n) => old + n.played, 0);
    const wins = years.reduce((old, n) => old + n.won, 0);
    const draws = years.reduce((old, n) => old + n.draw, 0);
    console.log(start, end, scored, conceded, played, wins, draws);
    return {
       scored: scored / played , conceded: conceded / played, ppg: (3 * wins + draws)/ played
    };
  });
  const spells = utils.zip2(spellPerformance, allRanges);
  const gpg = spellPerformance.map(rec => rec.scored);
  const cpg = spellPerformance.map(rec => rec.conceded);
  const ppg = spellPerformance.map(rec => rec.ppg);


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

  const gpgMin = Math.min(...gpg);
  const gpgMax = Math.max(...gpg);
  const x = d3
    .scaleLinear()
    .domain([gpgMin - (gpgMax - gpgMin)*0.05, gpgMax + (gpgMax-gpgMin)*0.15])
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

  const cpgMin = Math.min(...cpg);
  const cpgMax = Math.max(...cpg);
  const y = d3
    .scaleLinear()
    .domain([cpgMin - (cpgMax - cpgMin)*0.20, cpgMax + (cpgMax-cpgMin)*0.15])
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
    .domain(d3.extent(spellPerformance, (d) => d.ppg))
    .interpolator(d3.interpolateRgb("#d1c2bd", "#880000"));
  svg
    .select("#dots")
    .selectAll("path")
    .data(spells)
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
