import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as utils from "../utils.js";

export const setupYearSlider = (
  firstYear,
  lastYear,
  minYear,
  maxYear,
  onChange
) => {
  let slider = d3.select("#year-slider");
  let container = d3.select("#year-slider-container");
  let sliderAndLabels = d3.select("#slider-and-labels");
  let toggle = d3.select("#year-slider-toggle");
  let labels = d3.select("#year-slider-labels");

  const setSelectedLabel = (year) => {
    labels.selectAll("span").classed("selected-label", (d) => d == year);
  };

  slider
    .attr("min", firstYear)
    .attr("max", lastYear)
    // Default value
    .attr("value", () => {
      let oldVal = slider.property("data-prev-value");
      if (!oldVal) return Math.max(firstYear, minYear);
      if (oldVal < minYear) return minYear;
      if (oldVal > maxYear) return maxYear;
      return oldVal;
    })
    .on("input", (e) => {
      let year = slider.property("value");
      if (year < minYear || year > maxYear) {
        slider.property("value", slider.property("data-prev-value"));
        return;
      }
      slider.property("data-prev-value", year);
      toggle.property("checked", true);
      container.classed("inactive", false);
      onChange(year);
      setSelectedLabel(year);
    });

  labels
    .selectAll("span")
    .data(utils.range(firstYear, lastYear + 1).reverse())
    .enter()
    .append("span")
    .classed("inactive", (d) => d < minYear || d > maxYear)
    .text((d) => d);

  toggle.on("change", () => {
    if (toggle.property("checked")) {
      container.classed("inactive", false);
      onChange(slider.property("value"));
    } else {
      container.classed("inactive", true);
      onChange(null);
    }
  });

  container.classed("inactive", true);

  setSelectedLabel(firstYear);
};
