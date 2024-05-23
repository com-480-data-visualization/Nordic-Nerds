import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const events = d3.select("#events");
const buttons = events.selectAll(".event-button");
const svg = events.select("#field-map");
const fieldLines = svg.select("#field-lines");

const MARGIN = { horizontal: 20, vertical: 20 };

export const setup = () => {
  fieldLines.attr("href", "images/soccer_field.svg");
  resizeFieldLines();
};

const getSize = () => {
  const size = svg.node().getBoundingClientRect();
  return {
    width: size.width - MARGIN.horizontal * 2,
    height: size.height - MARGIN.vertical * 2,
  };
};

const resizeFieldLines = () => {
  const { width, height } = getSize();
  fieldLines.attr("width", width).attr("height", height).attr("x", MARGIN.horizontal).attr("y", MARGIN.vertical);
};

export const draw = (selectedYear, selectedPlayer, selectedClub, selectedEvents, eventsData, setSelectedEvents) => {
  if (!selectedPlayer) {
    updateText("Select a player to see how his goalscoring ability has evolved over time");
    resizeFieldLines();
    drawEventButtons(selectedEvents, setSelectedEvents, selectedPlayer);
    drawEventHeatmap({ goals: [], misses: [] }, selectedEvents);
    return;
  }
  const data = filterData(selectedYear, selectedPlayer, selectedClub, eventsData);
  const nGoals = data.filter((datum) => datum.is_goal).length;
  updateText(`${selectedPlayer.name} scored ${nGoals} goals in ${data.length + nGoals} attempts for ${selectedClub} in ${selectedYear}!`);
  resizeFieldLines();
  drawEventButtons(selectedEvents, setSelectedEvents, selectedPlayer);
  drawEventHeatmap(partitionEvents(data), selectedEvents);
};

const updateText = (text) => {
  const textElem = document.getElementById("events-description");
  textElem.innerHTML = text;
};

const drawEventButtons = (selectedEvents, setSelectedEvents, selectedPlayer) => {
  buttons.classed("event-button-disabled", !selectedPlayer);
  buttons.on("click", (event) => {
    let buttonId = event.target.id;
    let button = d3.select("#" + buttonId);
    button.classed("event-button-selected", !selectedEvents.has(buttonId));
    setSelectedEvents(buttonId);
  });
};

function filterData(selectedYear, selectedPlayer, selectedClub, eventsData) {
  const data = eventsData
    .filter((d) => {
      return selectedYear == null ? true : d.season == selectedYear;
    })
    .filter((d) => {
      return selectedPlayer == null ? true : d.player == selectedPlayer.name;
    });
  return data;
}

function partitionEvents(eventsData) {
  const partition = { goals: [], misses: [] };
  eventsData.forEach((datum) => {
    if (datum.is_goal) partition["goals"].push(datum);
    else partition["misses"].push(datum);
  });
  return partition;
}

const drawEventHeatmap = (data, selectedEvents) => {
  const { width, height } = getSize();
  const goalData = selectedEvents.has("goal-button") ? data["goals"] : [];
  const missData = selectedEvents.has("miss-button") ? data["misses"] : [];
  const joinedData = goalData.concat(missData);

  // Add X axis
  const x = d3.scaleLinear(d3.extent(joinedData, (d) => d.x)).range([MARGIN.horizontal, width - MARGIN.horizontal]);

  const y = d3.scaleLinear(d3.extent(joinedData, (d) => d.y)).range([height - MARGIN.vertical, MARGIN.vertical]);

  // Prepare a color palette
  const goalColor = d3.scaleLinear([0.1, 1], ["blue", "#69b3a2"]);
  const missColor = d3.scaleLinear([0.1, 1], ["red", "#b369a2"]);

  // compute the density data
  const goalDensityData = d3
    .contourDensity()
    .x((d) => x(d.x))
    .y((d) => y(d.y))
    .size([width, height])
    .bandwidth(10)(goalData);

  // compute the density data
  const missDensityData = d3
    .contourDensity()
    .x((d) => x(d.x))
    .y((d) => y(d.y))
    .size([width, height])
    .bandwidth(10)(missData);

  d3.select("#heatmapgoals")
    .selectAll("path")
    .data(goalDensityData)
    .join("path")
    .attr("d", d3.geoPath())
    .attr("fill", function (d) {
      return goalColor(d.value);
    })
    .attr("opacity", 0.2);

  d3.select("#heatmapmisses")
    .selectAll("path")
    .data(missDensityData)
    .join("path")
    .attr("d", d3.geoPath())
    .attr("fill", function (d) {
      return missColor(d.value);
    })
    .attr("opacity", 0.2);
};
