var margin_chart_global = {top: 20, right: 60, bottom: 50, left: 70},
    width_chart_global = 600 - margin_chart_global.left - margin_chart_global.right,
    height_chart_global = 300 - margin_chart_global.top - margin_chart_global.bottom;

// Parse the date / time
var parseDate = d3.timeParse("%Y");

var x = d3.scaleLinear().range([0, width_chart_global]);
var y0 = d3.scaleLinear().range([height_chart_global, 0]);

var xScale_chart_global = d3.scaleBand()
    .rangeRound([0, width_chart_global])
    .padding(0.1);

var x = d3.scaleTime().range([0, width_chart_global]);


var valueline = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y0(d.civilians); })
    .curve(d3.curveMonotoneX); // apply smoothing to the line;

var valueline_2 = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y0(d.total); })
    .curve(d3.curveMonotoneX); // apply smoothing to the line;


var svg_chart_global = d3.select("#global-chart").append("svg")
    .attr("class","centered")
    .attr("width", width_chart_global + margin_chart_global.left + margin_chart_global.right)
    .attr("height", height_chart_global + margin_chart_global.top + margin_chart_global.bottom)
    .append("g")
    .attr("transform", "translate(" + margin_chart_global.left + "," + margin_chart_global.top + ")");


d3.csv("./data/deaths_time_series.csv", function (error, data_bar_global) {
    if (error) throw error;
    //parse and format data_bar_global
    data_bar_global.forEach(function (d) {
        d.year = parseDate(d['year']);
        d.total = parseInt(d['total']);
        d.civilians = parseInt(d['civilians']);
    });

    // Scale the range of the data_bar_global
    x.domain(d3.extent(data_bar_global, function (d) {
        return d.year;
    }));
    y0.domain([0, d3.max(data_bar_global, function (d) {
        return Math.max(d.civilians);
    })]);
    y0.domain([0, d3.max(data_bar_global, function (d) {
        return Math.max(d.total);
    })]);


    svg_chart_global.append("path")        // Add the valueline path.
        .data([data_bar_global])
        .attr('fill','none')
        .attr("data-legend",'total')
        .attr("class","lines")
        .style("stroke", "rgb(0, 122, 255)")
        .attr("d", valueline);

    // Add the valueline2 path.
    svg_chart_global.append("path")
        .data([data_bar_global])
        .attr("data-legend",'civil')
        .attr('fill','none')
        .attr("class","lines")
        .style("stroke", "rgb(215, 48, 31)")
        .attr("d", valueline_2);

    // Add the X Axis
    svg_chart_global.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height_chart_global + ")")
        .call(d3.axisBottom(x));

    // left y axis
    svg_chart_global.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y0));


    var y_legend = (width_chart_global-margin_chart_global.right);
    var y_legend_dash = (width_chart_global-margin_chart_global.right-30);
    svg_chart_global.append("rect")
        .attr("transform", "translate("+y_legend_dash+",0)")
        .attr("width", 20)
        .attr("height", 2)
        .attr("class","right-aligned")
        .style("fill", "rgb(215, 48, 31)");
    svg_chart_global.append("text")
        .attr("transform", "translate("+y_legend+",7)")
        .style("text-decoration","1px solid underlined")
        .text("Total Deaths");

    svg_chart_global.append("rect")
        .attr("transform", "translate("+y_legend_dash+",20)")
        .attr("width", 20)
        .attr("height", 2)
        .attr("class","right-aligned")
        .style("fill", "rgb(0, 122, 255)");
    svg_chart_global.append("text")
        .attr("transform", "translate("+y_legend+",27)")
        .text("Civilian Deaths");


});