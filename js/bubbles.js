var width = window.innerWidth;
var height = window.innerHeight;

var svg = d3.select("#bubbles")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var domain = [];
for(var i=0;i<50000000;i=i+800){
    domain.push(i)
}

var radius = [];

for (var i = 0; i < domain.length; i++) {
    radius.push(i + 3);
}

var radiusScale = d3.scaleQuantile()
    .domain(domain)
    .range(radius);

//determine how the strong the force is applied to a bubble


var forceXCombine = d3.forceX(function () {
    return (width / 2)
}).strength(.07);

var forceYCombine = d3.forceY(function () {
    return (height / 2);
}).strength(.07);

var it = 20;
var activeCol = 'total_deaths';

//every circle will get applied a force
var simulation = d3.forceSimulation()
    .force("x", forceXCombine)  //pushes all the circles to a position
    .force("y", forceYCombine)
    //allows each circle to have different collision force
    .force("collide", d3.forceCollide(function (d) { //we don't want the circles to collide
        return radiusScale(d[activeCol]) + 3;


    }).iterations(it));


//parameters to chang to alter force effect on circles
var increaseby = 2.5;
var reduceSize = 0.95;
var shiftPercentageX = 0.9;
var shiftPercentageY = 0.25;
var strength = .09;

//country tooltip
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.select("#fake-news")
    .on("mousemove", function () {
        console.log("mouseover!");
        // Show tooltip
        tooltip.transition(.2)
            .duration(200)
            .style("opacity", .95);

        // Place the tooltip
        tooltip.style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY + "px");

        // Write stuff on tooltip
        tooltip.html("<img src='imgs/easter-egg.gif'></img>");
    })
    .on("mouseout", function () {
        // Hide tooltip
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);
    });

function seperateBy(elem) {

    var seperatedX = width / 2;
    var remainingX = width * shiftPercentageX;

    //This applies a force X to every circle satisfying a constraint
    var forceX = d3.forceX(function (d) {

        if (elem.id === "total_actors") {
            return width / 2;

        } else if (elem.id === 'govs') {
            //combine govs and republics
            if (d[elem.id] === "1" || d['republics'] === "1") {
                return seperatedX;
            } else {
                //push the circle far right
                return remainingX;
            }

        } else if (elem.id === 'liberation_movements') {
            // combine with insurgents
            if (d[elem.id] === "1" || d['insurgents'] === "1") {
                return seperatedX;
            } else {
                //push the circle far right
                return remainingX;
            }

        } else if (elem.id === 'left_wing') {


            //combine with left_wing
            if (d[elem.id] === "1" || d['communists'] === "1") {
                return seperatedX;
            } else {
                //push the circle far right
                return remainingX;
            }

        } else {
            if (d[elem.id] === "1") {
                return seperatedX
            } else {
                //push the circle far right
                return remainingX;
            }
        }
    }).strength(strength);


    //This applies a force X to every circle satisfying a constraint
    //Basically for now push everything in y direction to center

    var separatedY = height / 2;
    var remainingY = height * shiftPercentageY;

    var forceY_ = d3.forceY(function (d) {

        if (elem.id === "total_actors") {
            return height / 2;

        } else if (elem.id === 'govs') {
            //combine govs and republics
            if (d[elem.id] === "1" || d['republics'] === "1") {
                return separatedY;
            } else {
                return remainingY;
            }

        } else if (elem.id === 'liberation_movements') {
            // combine with insurgents
            if (d[elem.id] === "1" || d['insurgents'] === "1") {
                return separatedY;
            } else {
                return remainingY;
            }

        } else if (elem.id === 'left_wing') {

            //combine with left_wing
            if (d[elem.id] === "1" || d['communists'] === "1") {
                return separatedY;
            } else {
                //push the circle far right
                return remainingY;
            }

        } else {
            if (d[elem.id] === "1") {
                return separatedY
            } else {
                //push the circle far right
                return remainingY;
            }
        }
    }).strength(strength);


    //Set the sizes of the bubbles based on actor type
    if (elem.id === 'left_wing') {
        setSizeBubbles(elem.id, 'communists')

    } else if (elem.id === 'liberation_movements') {
        setSizeBubbles(elem.id, 'insurgents');

    } else if (elem.id === 'govs') {
        setSizeBubbles(elem.id, 'republics');

    } else if (elem.id === 'total_actors') {
        d3.selectAll(".actors")
            .transition()
            .duration(1000)
            .attr("r", function (d) {
                return radiusScale(d[activeCol])
            })
    } else {
        setSizeBubbles(elem.id);
    }

    var forceCollide_ = d3.forceCollide(function (d) {

        var force = setForceCollideBubbles(elem, d, increaseby);
        return force.force
    }).iterations(it);

    simulation.force("x", forceX)
        .force("y", forceY_)
        .force("collide", forceCollide_)
        .alphaTarget(0.9)
        .restart()
}

function setForceCollideBubbles(elem, d, increase) {
    var collide = 1.0;
    var f = .00004;

    if (elem.id === 'left_wing') {
        if (d[elem.id] === "1" || d['communists'] === "1") {

            return {force: radiusScale(d[activeCol]) * increase + collide, fight: it};

        } else {
            return {force: radiusScale(d[activeCol]) * reduceSize + collide, fight: f};
        }

    } else if (elem.id === 'liberation_movements') {
        if (d[elem.id] === "1" || d['insurgents'] === "1") {
            return {force: radiusScale(d[activeCol]) * increase + collide, fight: it};

        } else {
            return {force: radiusScale(d[activeCol]) * reduceSize + collide, fight: f};
        }

    } else if (elem.id === 'govs') {
        if (d[elem.id] === "1" || d['republics'] === "1") {
            return {force: radiusScale(d[activeCol]) * increase + collide, fight: it};

        } else {
            return {force: radiusScale(d[activeCol]) * reduceSize + collide, fight: f};
        }

    } else if (elem.id === 'total_actors') {
        return {force: radiusScale(d[activeCol]) + collide, fight: it};

    } else {
        if (d[elem.id] === "1") {
            return {force: radiusScale(d[activeCol]) * increase + collide, fight: it};
        } else {
            return {force: radiusScale(d[activeCol]) * reduceSize + collide, fight: 40};
        }
    }
}

function setSizeBubbles(group1, group2) {

    d3.selectAll(".actors")
        .transition()
        .duration(1000)
        .attr("r", function (d) {

            if (group2 === '') {
                if (d[group1] === "1") {
                    return radiusScale(d[activeCol]) * increaseby
                } else {
                    return radiusScale(d.total_deaths) * reduceSize
                }

            } else {
                if (d[group1] === "1" || d[group2] === "1") {
                    return radiusScale(d.total_deaths) * increaseby

                } else {
                    return radiusScale(d.total_deaths) * reduceSize
                }
            }
        });
}

d3.csv("./data/actors.csv", function (error, data) {


    if (error) throw error;

    //parse and transform types of data
    data.forEach(function (element) {
        element.civilian_deaths = +element.civilian_deaths;
        element.total_deaths = +element.total_deaths;
        element.begin = +element.begin;
        element.end = +element.end;
    });


    //update the simulation based on the data
    simulation
        .nodes(data)
        //every tick of the clock the simulation looks at all the forces we have applied and asks where should all the circles be
        .on("tick", function () {
            node
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                })
        });

    //creating of the bubbles and svg
    var node = svg.append("g")
        .selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("class", "actors")
        .attr("r", function (d) {
            return radiusScale(d.total_deaths);
        })
        .attr("fill", function (d) {
                return getColor(d);
            }
        )
        //details div generation

        .on("click", function (d) {
            d3.select("#actorDetails").remove();

            //details of actor that we will construct
            var actorName = "Actor : " + d.name + "\n";
            var totalDeaths = "Total deaths caused : " + d.total_deaths;
            var civilianDeaths = "Civilian deaths caused : " + d.civilian_deaths;
            var year_activity = "Years of activity: " + d.begin + " - " + d.end;
            var dataArray = [actorName, totalDeaths, civilianDeaths, year_activity];

            d3.select("#bubbles")
                .append("div")
                .attr("id", "actorDetails")
                .append("h3")
                .html("<i class=\"material-icons clear-icon-left\">clear</i>"+d.name);

            d3.select(".clear-icon-left").on("click",function(){
                d3.select('#actorDetails').remove();
            });

            //append the details the div element
            for (var i = 1; i < dataArray.length; i++) {
                var node = document.createElement("p");
                var textNode = document.createTextNode(dataArray[i]);
                node.appendChild(textNode);

                document.getElementById("actorDetails").appendChild(node);
            }
            var element = document.createElement("p");
            element.innerHTML = "<br><i class=\"material-icons\" id='info-tooltip'>info_outline</i>";

            document.getElementById("actorDetails").appendChild(element);
            var element = document.createElement("a");
            element.setAttribute("href", d.url);
            element.setAttribute("rel", "noopener noreferrer");
            element.setAttribute("target", "_blank");
            element.innerHTML = "<button class='btn btn-default'><i class=\"fa fa-wikipedia-w\" aria-hidden=\"true\"></i> More info</button>";

            document.getElementById("actorDetails").appendChild(element);

            d3.select("#info-tooltip")
                .on("mousemove", function () {
                    console.log("mouseover!");
                    // Show tooltip
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .95);

                    // Place the tooltip
                    tooltip.style("left", d3.event.pageX - 390 + "px")
                        .style("top", d3.event.pageY - 90 + "px");

                    // Write stuff on tooltip
                    tooltip.html("<strong>Total deaths caused</strong>: " +
                        "the number of adversary casualties caused by <br> the actor's side excluding collateral deaths.<br>" +
                        "<strong>Civil deaths</strong>: the number of targeted or collateral civilians killed in <br> conflicts in which the actor was involved.");
                })
                .on("mouseout", function () {
                    // Hide tooltip
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                });
        })
        .on("mousemove", function (d) {
            d3.select(this).transition()
                .duration(750)
                .style("fill", "darkgrey")
                .style("fill-opacity", "0.6");
            // Show tooltip
            tooltip.transition()
                .duration(200)
                .style("opacity", .95);
            // Place the tooltip
            tooltip.style("left", (d3.mouse(this)[0]) + "px")
                .style("top", d3.event.pageY + "px");
            // Write stuff on tooltip
            tooltip.html(d.name);
        })
        .on("mouseout", function () {
            // revert color
            d3.select(this).transition()
                .duration(750)
                .style("fill", function (d) {
                    return getColor(d);
                })
                .style("fill-opacity", "1.0");
            // Hide tooltip
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
});


//gets data point and returns a distinct color
function getColor(d) {
    if (d['guerilla'] === "1") {
        return "lightblue";
    } else if (d['left_wing'] === "1" || d['communists'] === "1") {
        return "red";
    } else if (d['designated_terrorist'] === "1") {
        return "darkblue";
    } else if (d['rebel']) {
        return "yellow";
    } else if (d['govs'] === "1" || d['republics'] === "1") {
        return "purple";
    } else if (d['liberation_movements'] === "1" || d['insurgents'] === "1") {
        return "black";
    } else if (d['islamists'] === "1") {
        return "brown";
    } else if (d['factions']) {
        return "orange";
    } else if (d['cartels'] === "1") {
        return "pink";
    } else if (d['muslims'] === "1") {
        return "darkblue";
    } else if (d['christians'] === "1") {
        return "green";
    } else {
        return "gray;"
    }
}


//Deals with the dragging of the bubbles.
function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.5).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

