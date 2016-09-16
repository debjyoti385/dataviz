// Global var for FIFA world cup data
var allWorldCupData;

/**
 * Render and update the bar chart based on the selection of the data type in the drop-down box
 *
 * @param selectedDimension a string specifying which dimension to render in the bar chart
 */


var tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip');

function updateBarChart(selectedDimension) {

    var svgBounds = d3.select("#barChart").node().getBoundingClientRect(),
        xAxisWidth = 100,
        yAxisHeight = 70;

    var padding  = 50;


    // ******* TODO: PART I *******
    // Create the x and y scales; make
    // sure to leave room for the axes

    var xScale = d3.scaleBand().range([svgBounds.width -padding ,0 ]),
        yScale = d3.scaleLinear().range([  svgBounds.height - padding , 0 ]);

    var dataScale =  d3.scaleLinear().range([ 0, svgBounds.height - padding ]);

    xScale.domain(allWorldCupData.map(function(d) { return d.year; })).padding(0.1);
    yScale.domain([0 , d3.max(allWorldCupData, function(d) { return d[selectedDimension]; }) ]);

    //dataScale.domain([0, d3.max(allWorldCupData, function(d) { return d[selectedDimension]; })]);

    // Create colorScale
    var colorScale = d3.scaleLinear()
        .domain([0, d3.max(allWorldCupData, function(d) { return d[selectedDimension]; })])
        .range([ "lightblue","darkblue"]);



    // Create the axes (hint: use #xAxis and #yAxis)
    var xAxis = d3
        .axisBottom().scale(xScale);

    d3.select("#xAxis")
        .attr("height",svgBounds.height)
        .attr("transform", "translate(" + padding + "," + ( svgBounds.height - padding ) + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("y", 0)
        .attr("x", -45)
        .attr("dy", ".35em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "start");

    var yAxis = d3
        .axisLeft().scale(yScale);

    d3.select("#yAxis")
        .attr("transform", "translate(" + padding + "," + 0 + ")")
        .call(yAxis)
        .selectAll("text")
        .attr("y", 0)
        .attr("x", -(padding))
        .attr("dy", ".35em")
        .attr("color",function(d){return colorScale(d[selectedDimension]) })
        .style("text-anchor", "start");


    // Create the bars (hint: use #bars)

    var barchart = d3.select("#bars").selectAll("rect").data(allWorldCupData);


    var enterselection =  barchart
        .enter()
        .append("rect")
        .attr("y", function(d){ return yScale(d[selectedDimension]) - padding})
        .attr("x", function (d) {
            return  xScale(d.year) +padding ;
        })
        .attr("fill", function(d){ return colorScale(d[selectedDimension])})
        .attr("width",xScale.bandwidth());


    barchart.exit()
        .attr("opacity", 1)
        .transition()
        .duration(1500)
        .attr("opacity", 0)
        .remove();

    barchart = enterselection.merge(barchart);

    barchart
        .attr("x", function (d) {
            return svgBounds.width - xScale(d.year) -20 ;
        })
        .attr("x", function (d) {
            return  xScale(d.year) +padding ;
        })
        .attr("width",xScale.bandwidth())
        .transition()
        .duration(1500)
        .attr("class","barChart")
        .attr("height",function(d){return svgBounds.height -  yScale(d[selectedDimension])})
        .attr("fill", function(d){ return colorScale(d[selectedDimension])})
        .attr("y", function(d){ return yScale(d[selectedDimension]) - padding});



    // ******* TODO: PART II *******

    barchart.on("click",function(d){

        d3.select("#bars").selectAll("rect")
            .classed("selected", false );
        d3.select(this)
            .classed("selected", true );

        updateInfo(d);
        updateMap(d);
    })


    // Implement how the bars respond to click events
    // Color the selected bar to indicate is has been selected.
    // Make sure only the selected bar has this new color.

    // Call the necessary update functions for when a user clicks on a bar.
    // Note: think about what you want to update when a different bar is selected.


}

/**
 *  Check the drop-down box for the currently selected data type and update the bar chart accordingly.
 *
 *  There are 4 attributes that can be selected:
 *  goals, matches, attendance and teams.
 */
function chooseData() {

    // ******* TODO: PART I *******
    //Changed the selected data when a user selects a different
    // menu item from the drop down.
    var selectedDimension = document.getElementById('dataset').value;
    updateBarChart(selectedDimension);

}

/**
 * Update the info panel to show info about the currently selected world cup
 *
 * @param oneWorldCup the currently selected world cup
 */
function updateInfo(oneWorldCup) {

    // ******* TODO: PART III *******
    var host = d3.select("#host");
    host.text(oneWorldCup.host);

    var winner = d3.select("#winner");
    winner.text(oneWorldCup.winner);

    var silver = d3.select("#silver");
    silver.text(oneWorldCup.runner_up);

    var team = d3.select("#teams");
    var teams  = team.selectAll("span").data(d3.values(oneWorldCup.teams_names));

    teams.enter().append("span").text(function(d){
            console.log(d)
            return d;
        })
        .append("br");;
    teams.exit().remove();
    teams.text(function(d){
            console.log(d)
          return d;
        })
        .append("br");


    // Update the text elements in the infoBox to reflect:
    // World Cup Title, host, winner, runner_up, and all participating teams that year

    // Hint: For the list of teams, you can create an list element for each team.
    // Hint: Select the appropriate ids to update the text content.


}


function tooltipInfo(country_iso) {

    participated = []
    hosted = []
    winner = []
    runner_up = []
    allWorldCupData.forEach(function (row) {
        if (row.teams_iso.indexOf(country_iso) >= 0) {
            participated.push(row.year);
        }
        if (row.host_country_code == country_iso) {
            hosted.push(row.year);
        }
        if (row.winner.substring(0,3).toUpperCase() == country_iso) {
            winner.push(row.year);
        }
        if (row.runner_up.substring(0,3).toUpperCase() == country_iso) {
            runner_up.push(row.year);
        }
    })


    part_info = "NEVER PARTICIPATED IN WORLD CUP";
    host_info = "NEVER HOSTED A WORLD CUP";
    winner_info="";
    runner_up_info = "";

    if (winner.length > 0){
        winner_info = "<b>WINNER:</b></b><br/> " + runner_up.join("<br/>") + "<br/>" +"<br/>" ;
    }
    if (runner_up.length > 0){
        runner_up_info = "<b>RUNNER UP:</b><br/> " + runner_up.join("<br/>") + "<br/>" + "<br/>" ;
    }

    if (hosted.length > 0) {
        host_info = "<b>HOSTED:</b><br/> " + hosted.join("<br/>") +"<br/>" ;
    }
    if (participated.length > 0) {
        part_info = "<b>PARTICIPATED:</b><br/> " + participated.join(", ");
    }
    return ( winner_info  + runner_up_info +  host_info+ "<br/>" + part_info);
}

/**
 * Renders and updated the map and the highlights on top of it
 *
 * @param the json data with the shape of all countries
 */
function drawMap(world) {

    //(note that projection is global!
    // updateMap() will need it to add the winner/runner_up markers.)
    projection = d3.geoConicConformal().scale(200).translate([500, 450]);

    // ******* TODO: PART IV *******

    // Draw the background (country outlines; hint: use #map)
    // Make sure and add gridlines to the map
    var path = d3.geoPath().projection(projection);


    var tooltip = d3.select(".tooltip")
        .style("opacity", 0);
    console.log(tooltip);

    d3.json('data/world.json', function(error, world) {
        var map = d3.select("#map");
        map.selectAll("path")
            .data(topojson.feature(world, world.objects.countries).features)
            .enter().append("path")
            .attr("class","countries")
            .attr("d", path)
            .attr("id", function(d){
                return d.id;
            })
// this is EXTRA CREDIT PART START
            .on("click", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(  tooltipInfo(d.id) )
                    .style("left", (d3.event.pageX -0) + "px")
                    .style("top", (d3.event.pageY - 5) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(1500)
                    .style("opacity", 0);
            });
// this is EXTRA CREDIT PART ENTER
    });



    // Hint: assign an id to each country path to make it easier to select afterwards
    // we suggest you use the variable in the data element's .id field to set the id
    var runner = d3.select("#points").append("circle").attr("id","runner_up_loc");
    var winner = d3.select("#points").append("circle").attr("id","winner_loc");
    // Make sure and give your paths the appropriate class (see the .css selectors at
    // the top of the provided html file)



}

/**
 * Clears the map
 */
function clearMap() {

    // ******* TODO: PART V*******
    //Clear the map of any colors/markers; You can do this with inline styling or by
    //defining a class style in styles.css
    d3.selectAll("#map").selectAll("path").classed("team",false).classed("host",false);

    //Hint: If you followed our suggestion of using classes to style
    //the colors and markers for hosts/teams/winners, you can use
    //d3 selection and .classed to set these classes on and off here.

}


/**
 * Update Map with info for a specific FIFA World Cup
 * @param the data for one specific world cup
 */
function updateMap(worldcupData) {


    //Clear any previous selections;
    clearMap();

    // ******* TODO: PART V *******
    //Hint: remember we have a conveniently labeled class called .winner
    // as well as a .silver. These have styling attributes for the two
    //markers.

    //Select the host country and change it's color accordingly.
    //Iterate through all participating teams and change their color as well.
    //We strongly suggest using classes to style the selected countries.


    worldcupData.teams_iso.forEach(function(team){
        d3.select("#" + team).classed("team",true);
    })

    d3.select("#" + worldcupData.host_country_code).classed("host",true);

    // Add a marker for the winner and runner up to the map.

    var runner  = d3
        .select("#points")
        .selectAll("#runner_up_loc")
        .data([worldcupData.ru_pos]);
    enterrunner  = runner.enter()
        .append("circle")
        .attr("cx", function (d) {
            console.log(' d is ' , d)
            return projection(d)[0];
        })
        .attr("cy", function (d) {
            return projection(d)[1];
        })
        .attr("r", function (d) {
            return 10;
        })
        .attr("class","silver");

    runner = enterrunner.merge(runner);

    runner.exit().remove();

    runner
        .attr("cx", function (d) {
            console.log("runner circle cx", projection(d)[0] )
            return projection(d)[0];
        })
        .attr("cy", function (d) {
            console.log("runner circle cy", projection(d)[1] )
            return projection(d)[1];
        })
        .attr("r", function (d) {
            return 10;
        })
        .attr("class","silver");


    var winner  = d3.select("#points").selectAll("#winner_loc")
        .data([worldcupData.win_pos]);
    enterwinner  = winner.enter()
        .append("circle")
        .attr("cx", function (d) {
            console.log(' d is ' , d)
            return projection(d)[0];
        })
        .attr("cy", function (d) {
            return projection(d)[1];
        })
        .attr("r", function (d) {
            return 10;
        })
        .attr("class","gold");

    winner = enterwinner.merge(winner);

    winner.exit().remove();

    winner
        .attr("cx", function (d) {
            console.log("runner circle cx", projection(d)[0] )
            return projection(d)[0];
        })
        .attr("cy", function (d) {
            console.log("runner circle cy", projection(d)[1] )
            return projection(d)[1];
        })
        .attr("r", function (d) {
            return 10;
        })
        .attr("class","gold");


}

/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

//Load in json data to make map
d3.json("data/world.json", function (error, world) {
    if (error) throw error;
    drawMap(world);
});

// Load CSV file
d3.csv("data/fifa-world-cup.csv", function (error, csv) {

    csv.forEach(function (d) {

        // Convert numeric values to 'numbers'
        d.year = +d.YEAR;
        d.teams = +d.TEAMS;
        d.matches = +d.MATCHES;
        d.goals = +d.GOALS;
        d.avg_goals = +d.AVERAGE_GOALS;
        d.attendance = +d.AVERAGE_ATTENDANCE;
        //Lat and Lons of gold and silver medals teams
        d.win_pos = [+d.WIN_LON, +d.WIN_LAT];
        d.ru_pos = [+d.RUP_LON, +d.RUP_LAT];

        //Break up lists into javascript arrays
        d.teams_iso = d3.csvParse(d.TEAM_LIST).columns;
        d.teams_names = d3.csvParse(d.TEAM_NAMES).columns;

    });

    // Store csv data in a global variable
    allWorldCupData = csv;
    // Draw the Bar chart for the first time
    updateBarChart('attendance');
});
