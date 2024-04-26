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
  fieldLines
    .attr("width", width)
    .attr("height", height)
    .attr("x", MARGIN.horizontal)
    .attr("y", MARGIN.vertical);
};

export const draw = (
  selectedPlayer,
  selectedClub,
  selectedEvents,
  eventsData,
  setSelectedEvents
) => {
  resizeFieldLines();
  drawEventButtons(selectedEvents, setSelectedEvents);
  drawEventHeatmap(selectedEvents, eventsData);
};

const drawEventButtons = (selectedEvents, setSelectedEvents) => {
  buttons.on("click", (event) => {
    let buttonId = event.target.id;
    let button = d3.select("#" + buttonId);
    if (selectedEvents.has(buttonId)) {
      button.classed("event-button-selected", false);
    } else {
      button.classed("event-button-selected", true);
    }
    setSelectedEvents(buttonId);
  });
};

const drawEventHeatmap = (selectedEvents, eventsData) => {
  const { width, height } = getSize();
  if (selectedEvents.size != 0) {
    d3.csv(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_for_density2d.csv"
    ).then((data) => {
      // Add X axis
      const x = d3
        .scaleLinear()
        .domain([5, 20])
        .range([MARGIN.horizontal, width - MARGIN.horizontal]);

      const y = d3
        .scaleLinear()
        .domain([5, 25])
        .range([height - MARGIN.vertical, MARGIN.vertical]);

      // Prepare a color palette
      const color = d3
        .scaleLinear()
        .domain([0, 1]) // Points per square pixel.
        .range(["white", "#69b3a2"]);

      // compute the density data
      const densityData = d3
        .contourDensity()
        .x((d) => x(d.x))
        .y((d) => y(d.y))
        .size([width, height])
        .bandwidth(20)(data);

      d3.select("#heatmap")
        .selectAll("path")
        .data(densityData)
        .join("path")
        .attr("d", d3.geoPath())
        .attr("fill", function (d) {
          return color(d.value);
        })
        .attr("opacity", 0.4);
    });
  } else {
    d3.select("#heatmap").selectAll("path").remove();
  }
};
