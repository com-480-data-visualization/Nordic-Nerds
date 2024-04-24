import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export const drawEvents = (selectedPlayer, selectedClub, selectedEvents, eventsData, setSelectedEvents) => {
    drawEventButtons(selectedEvents, setSelectedEvents);
    drawEventHeatmap(selectedEvents, eventsData);
}

const drawEventButtons = (selectedEvents, setSelectedEvents) => {
    d3.selectAll(".event-button")
        .on("click", (event) => {
            let buttonId = event.target.id;
            let button = d3.select("#" + buttonId);
            if (selectedEvents.has(buttonId)) {
                button.classed("event-button-selected", false);
            } else {
                button.classed("event-button-selected", true);
            }
            setSelectedEvents(buttonId);
        });
}

const drawEventHeatmap = (selectedEvents, eventsData) => {
    let svg = d3.select("#field-map");
    const size = svg.node().getBoundingClientRect();

    const margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = size.width - margin.left - margin.right,
        height = size.height - margin.top - margin.bottom;

    let fieldLines = d3.select("#field-lines");
    fieldLines.append("image")
        .attr("href", "images/soccer_field.svg")
        .attr("width", width)
        .style("transform", `translate(1.5%, 1.5%)`)

    if (selectedEvents.size != 0) {
        d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_for_density2d.csv")
            .then(data => {

                // Add X axis
                const x = d3.scaleLinear()
                    .domain([5, 20])
                    .range([margin.left, width - margin.right]);

                const y = d3.scaleLinear()
                    .domain([5, 25])
                    .range([height - margin.bottom, margin.top]);

                // Prepare a color palette
                const color = d3.scaleLinear()
                    .domain([0, 1]) // Points per square pixel.
                    .range(["white", "#69b3a2"])

                // compute the density data
                const densityData = d3.contourDensity()
                    .x(function (d) {
                        return x(d.x);
                    })
                    .y(function (d) {
                        return y(d.y);
                    })
                    .size([width, height])
                    .bandwidth(20)
                    (data)

                d3.select("#heatmap")
                    .selectAll("path")
                    .data(densityData)
                    .join("path")
                    .attr("d", d3.geoPath())
                    .attr("fill", function (d) {
                        return color(d.value);
                    })
                    .attr("opacity", 0.4);
            })
    } else {
        d3.select("#heatmap")
            .selectAll("path")
            .remove();
    }
}