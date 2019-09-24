// dummy button for toggle
$(function () {
    $('.toggle-dummy')
        .bootstrapToggle({
            on: 'Civil Deaths',
            off: 'Total Deaths',
            style: 'dummy-toggle'
        })
});

// year slider
var map_column = 'deaths_civilians_sum';
var map_data = 'deaths_civilians_';
var descriptor_data = 'Civilian Deaths';
var descriptor_year = 'sum';
var year_column = 1989;

var width = screen.width *.8,
    height = screen.height * .65,
    centered;

var projection = d3.geoEquirectangular()
    .scale(height / Math.PI)
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

var svg_map = d3.select("#map-container").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("id","map-svg");

var g = svg_map
    .append("g");

// country tooltip_map
var tooltip_map = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.json("./data/world-countries.json", function (error, json) {
    if (error) throw error;

    // bind csv data to TopoJson
    d3.csv("./data/countries.csv", function (data_map) {
        for (var k = 0; k < data_map.length; k++) {// for each row in CSV
            var dataCountry = data_map[k].country;
            var dataCivilians = parseFloat(data_map[k].deaths_civilians_sum);
            var dataTotal = parseFloat(data_map[k].deaths_total_sum);

            for (var j = 0; j < json.features.length; j++) {
                var jsonCountry = json.features[j].properties.name;
                if (dataCountry === jsonCountry) {
                    //Copy the data value into the JSON
                    json.features[j].properties['deaths_civilians_sum'] = dataCivilians;
                    json.features[j].properties['deaths_total_sum'] = dataTotal;
                    json.features[j].properties.data = data_map[k];

                    for (var l = 1989; l < 2017; l++) {
                        json.features[j].properties['deaths_civilians_' + l] = data_map[k]['deaths_civilians_' + l];
                        json.features[j].properties['deaths_total_' + l] = data_map[k]['deaths_total_' + l];
                    }
                    //Stop looking through the JSON
                    break;
                }
            }
        }

        // natural sorting in D3 (e.g., [1, 2, 100, 200] instead of [1, 100, 2, 200] which is default in JavaScript)
        function sortNumber(a, b) {
            return a - b;
        }

        var DataArray = Array.from(new Set(data_map.map(function (d) {
            return +d['deaths_civilians_sum']
        }).sort(sortNumber))); // get the min/max values from the current year's range of data values

        var coloring = d3.scaleQuantile()
            .domain(DataArray)
            .range(d3.schemeOrRd[8]);

        // get color for a country (sum over all years)
        function getColor(valueIn) {
            // get data array for quantile colors
            var color = coloring(valueIn);
            if (color != null)
                return color;
        }

        $(document).ready(function () {
            // checkbox
            var sum_button = document.getElementById('type-data');
            sum_button.onclick = function () {
                descriptor_year = 'sum';
                d3.select("#dataset-title").html('<h2>' + descriptor_data + " (" + descriptor_year + ")</h2>");
                sequenceMap(map_data, descriptor_year)
            };


            // slider
            var slider = document.getElementById("slider");
            var title = document.getElementById("dataset-title");
            var year = slider.value;


            $("#slider").slider({
                value: 1989,
                min: 1989,
                max: 2016,
                step: 1,
                slide: function (event, ui) {
                    $('#year').fadeIn();

                    // set year variable
                    year_column = ui.value;
                    descriptor_year = ui.value;
                    console.log("Changed year to " + ui.value);

                    //update HTML
                    year = ui.value;
                    title.innerHTML = '<h2>' + descriptor_data + " (" + year_column + ")</h2>";

                    //update map
                    sequenceMap(map_data, year_column);
                }
            });
        });


        /* functions for updatig the colors of the map */
        function sequenceMap(data_type, suffix) {
            map_column = data_type + suffix;
            console.log(data_type);
            d3.selectAll('.country').transition()  //select all the countries and prepare for a transition to new values
                .duration(500)  // give it a smooth time period for the transition
                .style('fill', function (d) {
                    return getColor(d.properties[map_column]);  // the end color value
                })
        }

        $(function () {
            $('#toggle-two')
                .bootstrapToggle({
                    on: 'Civil Deaths',
                    off: 'Total Deaths',
                    size: 'large',
                    style: 'main-toggle',
                    width: 125,
                    height: 36
                })
                .change(function () {
                    if (descriptor_data === 'Total Deaths') {
                        descriptor_data = 'Civil Deaths';
                        map_data = 'deaths_civilians_';
                    }
                    else {
                        descriptor_data = 'Total Deaths';
                        map_data = 'deaths_total_';
                    }
                    d3.select("#dataset-title").html('<h2>' + descriptor_data + " (" + descriptor_year + ")</h2>");
                    sequenceMap(map_data, descriptor_year)
                })
        });


        // animated map (play button)
        var playing = false;

        function animateMap() {
            var timer;  // create timer object
            d3.select('#play')
                .on('click', function () {  // when user clicks the play button
                    if (!playing) {  // if the map is currently playing
                        console.log("playing");
                        descriptor_year = year_column;
                        $("#type-data").attr("disabled", true);
                        d3.select("#dataset-title").html('<h2>' + descriptor_data + " (" + year_column + ")</h2>");
                        sequenceMap(map_data, year_column);  // update the representation of the map
                        timer = setInterval(function () {   // set a JS interval
                            console.log("updating: " + year_column);
                            if (year_column < 2016) {
                                year_column += 1;  // increment the current attribute counter
                                descriptor_year = year_column;
                            } else {
                                year_column = 1989;  // or reset it to zero
                                descriptor_year = year_column;
                            }
                            console.log(year_column);
                            //setter
                            $("#slider").slider("option", "value", year_column);
                            d3.select("#dataset-title").html('<h2>' + descriptor_data + " (" + year_column + ')</h2>');
                            sequenceMap(map_data, year_column);  // update the representation of the map
                        }, 2000);
                        d3.select(this).html('Pause');  // change the button label to stop
                        playing = true;   // change the status of the animation
                    } else {    // else if is currently playing
                        console.log("stopping");
                        $("#type-data").attr("disabled", false);
                        clearInterval(timer);   // stop the animation by clearing the interval
                        d3.select(this).html('Play');   // change the button label to play
                        playing = false;   // change the status again
                    }
                });
        }

        animateMap();

        color_legend("Color Map (Quantiles)", coloring);

        function color_legend(title, scale) {
            var legend = d3.legendColor()
                .labelFormat(d3.format(",.0f"))
                .cells(10)
                .scale(scale);

            var div = d3.select("#color-legend").append("div")
                .attr("class", "column");

            div.append("h4").text(title);

            var svg_map = div.append("svg");

            svg_map.append("g")
                .attr("class", "legendQuant")
                .attr("transform", "translate(20,10)");

            svg_map.select(".legendQuant")
                .call(legend);
        }

        // create map
        g.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("class", "country") // give them a class for styling and access later
            .attr("d", path)
            .style("stroke", "white")
            .style('fill', function (d) {
                if(d.properties.name!=="Syria"&&d.properties.name!=="North Korea")
                    return getColor(d.properties[map_column]);  // the end color value
                else
                    return 'lightgray'
            })

            /* hover tooltip_map */
            .on("mouseover", function () {
                d3.select(this).transition()
                    .duration("100")
                    .style("fill-opacity", ".1");

                // Show tooltip_map
                tooltip_map.transition()
                    .duration(200)
                    .style("opacity", .9);

            })
            .on("mousemove", function (d) {
                // Place the tooltip_map
                tooltip_map.style("left", (d3.mouse(this)[0]) + "px")
                    .style("top", d3.event.pageY + "px");

                // Write stuff on tooltip_map
                if(d.properties.name!=="Syria" && d.properties.name!=="North Korea"){
                    tooltip_map.html("<h4>" + d.properties.name + "</h4>" +
                        "Deaths civilians (" + descriptor_year + "): " + parseInt(d.properties["deaths_civilians_" + descriptor_year]) +
                        "<br>Total deaths in conflicts (" + descriptor_year + "): " + parseInt(d.properties["deaths_total_" + descriptor_year]));
                }
                else {
                    tooltip_map.html("No data available for " + d.properties.name);
                }
            })
            .on("mouseout", function () {
                tooltip_map.transition()
                    .duration(200)
                    .style("opacity", 0);
                d3.select(this)
                    .transition()
                    .duration("100")
                    .style("fill-opacity", "1")
            })
            .on("click", countryClicked)
    });
});

/* country details */


function countryClicked(d) {
    var posX, posY, zoomScale;

    // we click inside the country
    if (d && centered !== d && d.properties.name!== "Syria" && d.properties.name!=="North Korea") {
        var centroid = path.centroid(d);
        //we retrieve the x and y coordination of where we clicked
        posX = centroid[0]-20;
        posY = centroid[1]+100;
        //determines how much we will zoom
        zoomScale = 1.3;
        centered = d;

    } else {
        // test if we double click twice
        //reposition to center of the screen and update zoom scale
        posX = width / 2;
        posY = height / 2;
        zoomScale = 1;
        centered = null;
    }


    g.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + zoomScale + ")translate(" + -posX + "," + -posY + ")")
        .on("start", function () {

            if (centered === d) {
                d3.select("#details").remove();
                var country = d.properties.name;
                if(country!=="North Korea"&&country!=="Syria"){
                    generateChart(country);
                }
            } else {
                d3.select("#details").remove();

            }
        });
}



/* country details chart */
function generateChart(country) {
    var widthDiv = 0.4 * parseInt(window.width);
    var heightDiv = parseInt(window.height)*.8;

    d3.select("body").append("div")
        .attr("id", "details")
        .attr("class", "sidebar");


    d3.select("#details")
        .style("width", "40%")
        .style("height", "100%")
        .style("padding", "14px");

    var barChartColor = "rgb(0,122,255)";

    var margin = {top: 20, right: 40, bottom: 30, left: 20},
        width = widthDiv - margin.left - margin.right,
        height = heightDiv / 3 - margin.top - margin.bottom;

    var parseDate = d3.timeParse("%Y");

    //we only specify the range so far. the domain will be specified later on
    //  .range([0, width])
    var xScale = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1);

    //xAxis
    var xAxis = d3.axisBottom()
        .scale(xScale)
        .tickFormat(d3.timeFormat("%Y"));

    add_title();


    charts("civilians",'Civilian Deaths', 'Deaths');
    charts("total",'Total Deaths', 'Deaths');
    charts("events",'Event Count', 'Events');
    charts("gdp",'GDP','billions $');
    function add_title() {
        d3.select("#details").html('<h2>'+country+'<i class="material-icons clear-icon">clear</i></h2>')
    }

    function charts(field, ylabel, appendix) {
        var yScale = d3.scaleLinear().range([height, 0]);
        var chart_height = height + margin.top + margin.bottom;

        d3.select("#details")
            .append("h3")
            .attr("id","title"+field)
            .html(ylabel);

        var svg_map = d3.select("#details")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", chart_height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.csv("./data/country-details/" + country + ".csv", function (error, data) {
            if (error) throw error;

            data.forEach(function (d) {
                d.year = parseDate(d.year);
                d.civilians = parseInt(d.civilians);
                d.total = parseInt(d.total);
                d.events = parseInt(d.events);
                d.gdp = parseFloat(parseFloat(d.gdp/1e+9).toFixed(2));
            });
            xScale.domain(data.map(function (d) {
                return d.year;
            }));

            yScale.domain([0, d3.max(data, function (d) {
                return d[field] ;
            })]);

            //X axis with its values
            svg_map.append("g")
                .attr("id", "Xaxis")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", "-.55em")
                .attr("transform", "translate(6,4),rotate(-45)");


            svg_map.selectAll("bar")
                .data(data) //bound data
                .enter()
                .append("rect")
                .style("fill", barChartColor)
                .attr("x", function (d) {
                    return xScale(d.year);
                })
                .attr("width", xScale.bandwidth())
                .attr("y", function (d) {
                    return yScale(d[field]);
                })
                .attr("height", function (d) {
                    return height - yScale(d[field]);// we want the bar charts to grow  bottom up
                })

                .on("mouseover", function (d) {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .style("fill", "#5bc0de");

                    d3.select("#title"+field)
                        .append("text")
                        .attr("id", "info_display")
                        .attr("class", "right-aligned")
                        .text(d[field]+" "+appendix)

                })
                .on("mouseout", function () {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .style("fill", barChartColor);

                    d3.select("#title"+field).select("#info_display")
                        .remove()
                })
        });

    }
    // function to get back to main view on close
    d3.select(".clear-icon").on("click",function(){
        var posX = width / 2;
        var posY = height / 2;
        var zoomScale = 1;

        g.transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + zoomScale + ")translate(" + -posX + "," + -posY + ")");
        d3.select("#details").remove();
    });
}