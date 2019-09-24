var margin_chart = {top: 20, right: 20, bottom: 30, left: 50},
    width = 600 - margin_chart.left - margin_chart.right,
    height_chart = 300 - margin_chart.top - margin_chart.bottom;

// Parse the date / time
var parseDate = d3.timeParse("%Y");

var xScale_chart = d3.scaleBand()
    .rangeRound([0, width])
    .padding(0.1);

var  yScale_chart = d3.scaleLinear().range([height_chart, 0]);

var xAxis_chart = d3.axisBottom()
    .scale(xScale_chart)
    .tickFormat(d3.timeFormat("%Y"));

var yAxis_chart = d3.axisLeft()
    .scale(yScale_chart)
    .ticks(10);

var svg_chart = d3.select("#interactive-chart").append("svg")
    .attr("width", width + margin_chart.left + margin_chart.right)
    .attr("height", height_chart + margin_chart.top + margin_chart.bottom)
    .append("g")
    .attr("transform", "translate(" + margin_chart.left + "," + margin_chart.top + ")");


var region = 'Europe';

var barColor = "rgb(0,122,255)";
var data_;

d3.csv("./data/Continents/regions_count.csv", function (error, data_bar) {

    if (error) throw error;

    //parse and format data
    data_bar.forEach(function (d) {
        d.date = parseDate(+d['year']);
        d.value = +d[region]
    });

    data_ = data_bar;


    xScale_chart.domain(data_bar.map(function (d) {
        return d.date;
    }));
    yScale_chart.domain([0, d3.max(data_bar, function (d) {
        return d.value;
    })]);

    svg_chart.append("g")
        .attr("class", "x_axis_chart")
        .attr("transform", "translate(0," + height_chart + ")")
        .call(xAxis_chart)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.6em")
        .attr("dy", ".1em")
        .attr("transform", "rotate(-45)");

    svg_chart.append("g")
        .attr("class", "y_axis_chart")
        .call(yAxis_chart)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Value ($)");


    // get color according to whether further information is available
    function getColor(d) {
        return barColor;
    }

    svg_chart.selectAll("bar")
        .data(data_bar)

        .enter().append("rect")
        .attr("class", "rectangle_chart")
        .style("fill", getColor(data_bar))
        .attr("x", function (d) {
            return xScale_chart(d.date);
        })
        .attr("width", xScale_chart.bandwidth())
        .attr("y", function (d) {
            return yScale_chart(d.value);
        })
        .attr("height", function (d) {
            return height_chart - yScale_chart(d.value);
        })

        .on("mouseout", function () {
            d3.select("#show").remove();
            d3.select(this)
                .style("fill", function () {
                    return barColor;
                })
        })

        .on("mouseover", function (d) {


            d3.select(this)
                .style("fill", function(d){

                        return "#5bc0de";


                });

            d3.select("#chart-title")
                .append("h3")
                .style('position','absolute')
                .style('right','25%')
                .attr("id", "show")
                .attr("class", "chart-overlay")
                .html(d[region] + " people killed");


            var rwanda = true;
            if(region==="AfricaWR"){
               region = "Africa";
            }

            d3.csv("./data/Continents/" + region + ".csv", function (error, data) {

                if (error) throw error;

                //parse data
                data.forEach(function (d) {
                    d['year'] = parseDate(+d['year']);
                    d['casualties'] = +d['casualties'];
                });

                var foundData = false;

                var year = [],
                    casualties = [],
                    side_a = [],
                    side_b = [],
                    conflict = [],
                    description = [], url = [];
                //retrieve the correct year and details in "region".csv
                for (var i = 0; i < data.length; i++) {
                    if ((d.date).getFullYear() === (data[i]['year']).getFullYear()) {

                        year.push("<strong>Year</strong>: " + (data[i]['year']).getFullYear());
                        casualties.push("<strong>Casualties in this conflict in " + (data[i]['year']).getFullYear() + ": </strong>" + data[i]['casualties']);
                        side_a.push("<strong>Side A:</strong> " + data[i]['side_a']);
                        side_b.push("<strong>Side B:</strong> " + data[i]['side_b']);
                        conflict.push("<h3>" + data[i]['conflict'] + "</h3>");
                        description.push("<strong>Description:</strong> " + data[i]['description']);
                        url.push(data[i]['url']);

                        foundData = true;
                    }
                }


                //if we found corresponding data display it
                d3.select("#details-chart").remove();
                d3.select("#details-chart-container")
                    .append("div")
                    .attr("id", "details-chart");

                if (foundData) {
                    for (var i = 0; i < url.length; i++) {

                        var dataArray = [conflict[i], year[i], casualties[i], side_a[i], side_b[i], description[i]];

                        for (var j = 0; j < dataArray.length; j++) {
                            var node = document.createElement("div");
                            //var textNode = document.createTextNode(dataArray[j]);
                            node.innerHTML = dataArray[j];

                            document.getElementById("details-chart").appendChild(node);
                        }

                        var element = document.createElement("a");
                        element.setAttribute("href", url[i]);
                        element.setAttribute("rel", "noopener noreferrer");
                        element.setAttribute("target", "_blank");
                        element.innerHTML = "<button class='btn btn-default wikibutton'><i class=\"fa fa-wikipedia-w\" aria-hidden=\"true\"></i> More info</button>";

                        document.getElementById("details-chart").appendChild(element);
                    }

                } else {

                    var node = document.createElement("div");
                    node.style = 'text-align:center';
                    node.innerHTML = "<h3>Casualties not resulting from a major conflict</h3>";
                    document.getElementById("details-chart").appendChild(node);
                }


            });

        })
});


function regionClicked(elem) {
    //update the domain of the y scale
    var elem = elem.id;

    region = elem;

    yScale_chart.domain([0, d3.max(data_, function (d) {
        return +d[elem]
    })]);

    //update the yaxis

    yAxis_chart.scale(yScale_chart);

    //redraw the bar charts
    svg_chart.selectAll(".rectangle_chart")
        .transition()
        .duration(700)
        .ease(d3.easeLinear)
        .attr("height", function (d) {
            return height_chart - yScale_chart(+d[elem]);
        })
        .attr("y", function (d) {
            return yScale_chart(+d[elem]);
        });

    d3.selectAll("g.y_axis_chart")
        .transition()
        .call(yAxis_chart);
}