import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export const drawEvents = (
    selectedPlayer,
    selectedClub,
    selectedEvents,
    eventsData,
    setSelectedEvents
) => {
    drawEventButtons(
        selectedEvents,
        setSelectedEvents
    );
    //TODO Implement heatmap from data
    // drawEventHeatmap(eventsData);
}

const drawEventButtons = (
    selectedEvents,
    setSelectedEvents
) => {
    d3.selectAll(".event-button")
        .on("click", (event) => {
            let buttonId = event.target.id;
            let button = d3.select("#" + buttonId);
            if (selectedEvents.has(buttonId)) {
                button.classed("event-button-selected", false);
                setSelectedEvents(buttonId);
            } else {
                button.classed("event-button-selected", true);
                setSelectedEvents(buttonId);
            }
        });
}

const drawEventHeatmap = (
    selectedEvents,
    eventsData
) => {
    d3.selectAll(".event-button-selected")
        .data(eventsData);
}