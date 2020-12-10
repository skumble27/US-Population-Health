var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Creating an SVG group that can be appended to the HTML document

// Declaring the SVG variable and setting the dimensions for the graphics
var svg = d3
  .select("#scatter") // The ID tag in the HTML documen
  .append("svg")
  .attr("width", svgWidth) // Dimensions of the SVG have been establised 
  .attr("height", svgHeight); // As above

// Appending all the elements together in the SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Establishing the Initial x and y axis
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

/*------------------------------------ FUNCTIONS ------------------------------------ */
function xScale(csvData, chosenXAxis) {
    // Establishing the x axis scales (when different data are selected, the axis will change automatically)
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(csvData, d => d[chosenXAxis]) * 0.9,
        d3.max(csvData, d => d[chosenXAxis]) * 1.1
      ])
      .range([0, width]);
  
    return xLinearScale;
  }
  
  
  function yScale(csvData, chosenYAxis) {
    // As with the previous function, the y axis scales will be set up automatically when a different parameter is selected
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(csvData, d => d[chosenYAxis]) - 1,
        d3.max(csvData, d => d[chosenYAxis]) + 1
      ])
      .range([height, 0]);
  
    return yLinearScale;
  }
  
// Animating the transition of the axis when a new variable is selected
  function renderXAxes(newXScale, xAxis) {
      // assigning the bottom axis labels
    var bottomAxis = d3.axisBottom(newXScale);
 
    
    //Animating the transition
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }
  
  
  function renderYAxes(newYScale, yAxis) {
    // Assigning the left axis labels
    var leftAxis = d3.axisLeft(newYScale);

    // Animating the transition
      yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
  
/*The next function will allow the circles, which represent the scatter plot, to transition when the axes
are changed */

  function renderXCircles(groupedCircles, newXScale, chosenXAxis) {
    
    
    groupedCircles.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return groupedCircles;
  }
  
  function renderYCircles(groupedCircles, newYScale, chosenYAxis) {
  
    groupedCircles.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return groupedCircles;
  }
 
  function renderXText(groupedCircles, newXScale, chosenXAxis) {
  
    groupedCircles.transition()
      .duration(1000)
      .attr("dx", d => newXScale(d[chosenXAxis]));
  
    return groupedCircles;
  }
  
  function renderYText(groupedCircles, newYScale, chosenYaxis) {
  
    groupedCircles.transition()
      .duration(1000)
      .attr("dy", d => newYScale(d[chosenYAxis])+5);
  
    return groupedCircles;
  }
  
  
  // This function will update the circles with new information when the mouse hovers over the datapoints
  function updateToolTip(groupedCircles, chosenXAxis, chosenYAxis) {
  
    var ylabel;
    var xlabel;

    if (chosenXAxis === "poverty") {
      xlabel = "Poverty";
      
    } 
    else if (chosenXAxis === "age"){
      xlabel = "Age";
    } 
    else {
      xlabel = "Income";
    }
  
    if (chosenYAxis === "healthcare") {
      ylabel = "Healthcare";
    } 
    else if (chosenYAxis === "smokes"){
      
      ylabel = "Smokes";
    } 
    else {
      ylabel = "Obesity";
    }
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([50, -75])
      .html(function(d) {

        return (`${d.state}<br>${xlabel}<br>${d[chosenXAxis]}<br>${ylabel}<br>${d[chosenYAxis]}`)


      });
  
    groupedCircles.call(toolTip);
  
   // Event Change when mouse hovers over the data point
    groupedCircles.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
      
      .on("mouseout", function(data) {
          toolTip.hide(data, this);
      });
  
  return groupedCircles;
  }
/* Reading into the CSV data to plot the initial values */

d3.csv("assets/data/data.csv").then(function(USHealthData){

    console.log(USHealthData);

    //Iterating over the datasets
    USHealthData.forEach(function(data) {
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    /* Setting the initial scales for the plot and calling on the previous created xScale 
    and yScale functions */
    
  var xLinearScale = xScale(USHealthData, chosenXAxis); // The original chosenXAxis is poverty
  var yLinearScale = yScale(USHealthData, chosenYAxis); // The original chosenYAxis is healthcare

  // Setting up the initial axis parameters
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Adding the x and y axis to the chartgroup variable created earlier
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis)
    .attr("class", "axisColour");

  var yAxis = chartGroup.append("g")
    .call(leftAxis)
    .attr("class", "axisColour");

  // Creating a scatter plot with the circle shapes
  var groupedCircles = chartGroup.selectAll("g")
    .data(USHealthData)
    .enter()
    .append("g");
  
  var XYCircles = groupedCircles.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .classed("stateCircle", true);

    // Adding the state abbreviations to the text  
  var StateAbbrevText = groupedCircles.append("text")
    .text(d => d.abbr)
    .attr("dx", d => xLinearScale(d[chosenXAxis]))
    .attr("dy", d => yLinearScale(d[chosenYAxis]) + 5)
    .classed("stateText", true);

    // Creating two groups of three x and y axis labels so that user can toggle between the six
  var groupedXLabels = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height})`);

  // Selected groups in the x-axis are poverty, income and age  
  var povertyLabel = groupedXLabels.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "poverty") // <-- This will obtain the value relating to poverty rates
    .text("% Poverty Rates")
    .classed("active", true);

  var ageLabel = groupedXLabels.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "age") // <-- This will obtain the value relating to age
    .text("Median Age")
    .classed("inactive", true);

  var incomeLabel = groupedXLabels.append("text")
    .attr("x", 0)
    .attr("y", 80)
    .attr("value", "income") // <-- This will obtain the value relating to income 
    .text("Median Income per Household")
    .classed("inactive", true);

// Selected Groups for the y-axis are healthcare, obesity and smoking
  var groupedYLabels = chartGroup.append("g");

  var healthcareLabel = groupedYLabels.append("text")
    .attr("transform", "rotate(-90)")// This will rotate the labels and fit along the y axis
    .attr("x", -(height / 2))// The negative sign and dividing by two ensures that the labels are halfway from the top
    .attr("y", -40)
    .attr("value", "healthcare") // <-- Obtain values relating to healthcare access
    .text("Lacks Healthcare (%)")
    .classed("active", true);

  var smokesLabel = groupedYLabels.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -60)
    .attr("value", "smokes") // <-- Obtain values relating to smoking rates
    .text("Smokes (%)")
    .classed("inactive", true);

  var obesityLabel = groupedYLabels.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -80)
    .attr("value", "obesity") // <-- Obtain values relating to obesity rates
    .text("Obese (%)")
    .classed("inactive", true);

  // Setting up the initial tooltips
  groupedCircles = updateToolTip(groupedCircles, chosenXAxis, chosenYAxis);

  // Event changes in a user clicks on age or income on the x axis from the initial data set for poverty
  groupedXLabels.selectAll("text").on("click", function() 
  {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // This will replace the original value of poverty
      chosenXAxis = value;

      // Now all the functions will be called to replace the original set of data
      xLinearScale = xScale(USHealthData, chosenXAxis);

      xAxis = renderXAxes(xLinearScale, xAxis);

      XYCircles = renderXCircles(XYCircles, xLinearScale, chosenXAxis);

      StateAbbrevText = renderXText(StateAbbrevText, xLinearScale, chosenXAxis);

      groupedCircles = updateToolTip(groupedCircles, chosenXAxis, chosenYAxis);

      if (chosenXAxis === "age") {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenXAxis === "income") {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);
      }
      else {
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
    }
  });

  // The same principles apply for changes in the y axis as coded for the x axis
  groupedYLabels.selectAll("text").on("click", function() 
  {
    
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // Retreives the new value that replaces the original healthcare variable as seen when the page loads
      chosenYAxis = value;

      // Now all the functions will be called to replace the original set of data
      yLinearScale = yScale(USHealthData, chosenYAxis);

      yAxis = renderYAxes(yLinearScale, yAxis);

      XYCircles = renderYCircles(XYCircles, yLinearScale, chosenYAxis);

      StateAbbrevText = renderYText(StateAbbrevText, yLinearScale, chosenYAxis);

      groupedCircles = updateToolTip(groupedCircles, chosenXAxis, chosenYAxis);

      if (chosenYAxis === "smokes") {
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "obesity"){
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
      }
      else {
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
      }
    }
  });

})
