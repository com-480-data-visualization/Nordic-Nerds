import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const events = d3.select("#events");
const buttons = events.selectAll(".event-button");
const svg = events.select("#field-map");
const fieldLines = svg.select("#field-lines");

const MARGIN = {horizontal: 20, vertical: 20};

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
    const {width, height} = getSize();
    fieldLines
        .attr("width", width)
        .attr("height", height)
        .attr("x", MARGIN.horizontal)
        .attr("y", MARGIN.vertical);
};

export const draw = (
    selectedYear,
    selectedPlayer,
    selectedClub,
    selectedEvents,
    eventsData,
    setSelectedEvents
) => {
    resizeFieldLines();
    drawEventButtons(selectedEvents, setSelectedEvents);
    drawEventHeatmap(selectedYear, selectedPlayer, selectedClub, selectedEvents, eventsData);
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

function filterData(
    selectedYear,
    selectedPlayer,
    selectedClub,
    selectedEvents,
    eventsData
) {
const data = eventsData
    .filter(d => {return selectedYear == null ? true : d.season == selectedYear})
    .filter(d => {return selectedPlayer == null ? true : d.player == selectedPlayer.name})
    .filter(d => {return selectedClub == null ? true : d.event_team == selectedClub})
    .filter(d => {return selectedEvents.has("goal-button") ? d.is_goal : true})
    .filter(d => {return selectedEvents.has("miss-button") ? !d.is_goal : true});

    if (data.size != 0) {
        return Promise.resolve(data);
    } else {
        return Promise.reject("No data found.");
    }
}

const drawEventHeatmap = (
    selectedYear,
    selectedPlayer,
    selectedClub,
    selectedEvents,
    eventsData
) => {
    const {width, height} = getSize();
    filterData(selectedYear, selectedPlayer, selectedClub, selectedEvents, eventsData)
        .then(
            (data) => {
            // Add X axis
            const x = d3
                .scaleLinear(d3.extent(data, d => d.x))
                .range([MARGIN.horizontal, width - MARGIN.horizontal]);

            const y = d3
                .scaleLinear(d3.extent(data, d => d.y))
                .range([height - MARGIN.vertical, MARGIN.vertical]);

            // Prepare a color palette
            const color = d3
                .scaleLinear([0.1, 1], ["blue", "#69b3a2"]);

            // compute the density data
            const densityData = d3
                .contourDensity()
                .x((d) => x(d.x))
                .y((d) => y(d.y))
                .size([width, height])
                .bandwidth(10)(data);

            d3.select("#heatmap")
                .selectAll("path")
                .data(densityData)
                .join("path")
                .attr("d", d3.geoPath())
                .attr("fill", function (d) {
                    return color(d.value);
                })
                .attr("opacity", 0.2);
        },
            (error) => {
                console.log(error);
                d3.select("#heatmap").selectAll("path").remove();
            }
            )
};
