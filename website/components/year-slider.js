import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as utils from "../utils.js";

let slider = d3.select("#year-slider");
let labels = d3.select("#year-slider-labels");
let changeYear = null;

const setSelectedLabel = (year) => {
  labels.selectAll("span").classed("selected-label", (d) => d == year);
};

export const setup = (firstYear, lastYear, onChange) => {
  changeYear = (year) => {
    // Filter out values that are out of the valid range, and reset to the previous value
    let min = slider.attr("data-min-year") ?? firstYear;
    let max = slider.attr("data-max-year") ?? lastYear;
    if (year < min || year > max) {
      slider.property("value", slider.attr("data-prev-value"));
      return;
    }
    slider.property("value", year);
    slider.attr("data-prev-value", year);
    onChange(year);
    setSelectedLabel(year);
  };

  slider
    .attr("min", firstYear)
    .attr("max", lastYear)
    .on("input", () => changeYear(slider.property("value")));

  labels
    .selectAll("span")
    .data(utils.range(firstYear, lastYear + 1).reverse())
    .enter()
    .append("span")
    .text((d) => d);

  changeYear(lastYear);
};

export const limitYear = (minYear, maxYear) => {
  let min = minYear ?? slider.attr("min");
  let max = maxYear ?? slider.attr("max");
  slider.attr("data-min-year", min).attr("data-max-year", max);
  labels.selectAll("span").classed("inactive", (d) => d < min || d > max);

  let oldVal = slider.attr("data-prev-value");
  let newVal = utils.clamp(oldVal, min, max);
  if (newVal != oldVal) changeYear(newVal);
};

export const setSelectedYear = (year) => changeYear(year);
