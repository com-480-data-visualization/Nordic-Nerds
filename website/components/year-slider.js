import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as utils from "../utils.js";

export const setupYearSlider = (firstYear, lastYear, onChange) => {
  d3.select("#year-slider-labels")
    .selectAll("span")
    .data(utils.range(firstYear, lastYear + 1).reverse())
    .enter()
    .append("span")
    .text((d) => d);

  const setSelectedLabel = (year) => {
    d3.select("#year-slider-labels")
      .selectAll("span")
      .classed("selected-label", (d) => d == year);
  };

  d3.select("#year-slider")
    .attr("min", firstYear)
    .attr("max", lastYear)
    // Default value
    .attr("value", firstYear)
    .on("input", () => {
      let year = d3.select("#year-slider").property("value");
      setSelectedLabel(year);
      onChange(year);
    });

  setSelectedLabel(firstYear);
};
