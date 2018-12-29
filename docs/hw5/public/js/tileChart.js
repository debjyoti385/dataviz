/**
 * Constructor for the TileChart
 */
function TileChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required to lay the tiles
 * and to populate the legend.
 */
TileChart.prototype.init = function(){
    var self = this;

    //Gets access to the div element created for this chart and legend element from HTML
    var divTileChart = d3.select("#tiles").classed("content", true);
    var legend = d3.select("#legend").classed("content",true);
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    var svgBounds = divTileChart.node().getBoundingClientRect();
    self.svgWidth = svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = self.svgWidth/2;
    var legendHeight = 150;

    //creates svg elements within the div
    self.legendSvg = legend.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",legendHeight)
        .attr("transform", "translate(" + self.margin.left + ",0)")

    self.svg = divTileChart.append("svg")
                        .attr("width",self.svgWidth)
                        .attr("height",self.svgHeight)
                        .attr("transform", "translate(" + self.margin.left + ",0)")
                        .style("bgcolor","green")

};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
TileChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party== "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Renders the HTML content for tool tip.
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for tool tip
 */
TileChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<h2 class ="  + self.chooseClass(tooltip_data.winner) + " >" + tooltip_data.state + "</h2>";
    text +=  "Electoral Votes: " + tooltip_data.electoralVotes;
    text += "<ul>"
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });
    text += "</ul>";
    return text;
}

/**
 * Creates tiles and tool tip for each state, legend for encoding the color scale information.
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */
TileChart.prototype.update = function(electionResult, colorScale){
    var self = this;

    //Calculates the maximum number of columns to be laid out on the svg
    self.maxColumns = d3.max(electionResult,function(d){
                                return parseInt(d["Space"]);
                            });

    //Calculates the maximum number of rows to be laid out on the svg
    self.maxRows = d3.max(electionResult,function(d){
                                return parseInt(d["Row"]);
                        });
    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart
    tip = d3.tip().attr('class', 'd3-tip')
        .direction(function(d){
            if (parseInt(d["Row"]) >= 6)
                return 'ne';
            return 'se';
        }
        )
        .offset(function() {
            return [0,0];
        })
        .html(function(d) {
            // populate data in the following format
            // pass this as an argument to the tooltip_render function then,
            // return the HTML content returned from that method.
            result=[];
            result.push({"nominee": d["D_Nominee_prop"],"votecount": d["D_Votes"],"percentage": d["D_Percentage"],"party":"D"})
            result.push({"nominee": d["R_Nominee_prop"],"votecount": d["R_Votes"],"percentage": d["R_Percentage"],"party":"R"})

            if (d["I_Nominee_prop"].length > 1)
                result.push({"nominee": d["I_Nominee_prop"],"votecount": d["I_Votes"],"percentage": d["I_Percentage"],"party":"I"});

              tooltip_data = {
              "state": d["State"],
              "winner":d["State_Winner"],
              "electoralVotes" : d["Total_EV"]
              };

                tooltip_data["result"] = result;

            return self.tooltip_render(tooltip_data);
        });

    //Creates a legend element and assigns a scale that needs to be visualized
    self.legendSvg.append("g")
        .attr("class", "legendQuantile");

    var legendQuantile = d3.legendColor()
        .shapeWidth(120)
        .cells(10)
        .orient('horizontal')
        .scale(colorScale);

    // ******* TODO: PART IV *******


    var tile_width = self.svgWidth / 12;
    var tile_height = self.svgHeight / 8;

    var tiles = self.svg.selectAll(".tile").data(electionResult);

    tiles.exit().remove();
    var tilesEnter  = tiles.enter()
        .append("rect")
        .attr("class","tile");
    tiles = tilesEnter.merge(tiles);

    tiles
        .attr("height",tile_height)
        .attr("width",tile_width)
        .attr("x", function (d) {
            //console.log("space " + d["Space"]);
            return parseInt(d["Space"]) * tile_width;
        })
        .attr("y",function(d){
            //console.log("Row " + d["Row"]);
            return parseInt(d["Row"]) * tile_height;
        })
        .style("fill",function(d){
            if (d["State_Winner"] == "I")
                return "#45AD6A";
            return colorScale(d["RD_Difference"])
        })
        .call(tip)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    var tilestext= self.svg.selectAll(".tilestext").data(electionResult);


    var tilestextEnter  = tilestext.enter()
        .append("text")
        .attr("class","tilestext");

    tilestext.exit().remove();

    tilestext = tilestextEnter.merge(tilestext);

    tilestext.selectAll("tspan").remove();

    tilestext
        .append("tspan")
        .attr("x",function(d){
            return parseInt(d["Space"]) * tile_width + tile_width/2;
        })
        .attr("y",function(d){
            return parseInt(d["Row"]) * tile_height + tile_height/2;
        })
        .attr("dy",-10)
        .text(function (d) {
            return d["Abbreviation"];
        })
        .attr("text-anchor","middle");

    tilestext
        .append("tspan")
        .attr("x",function(d){
            return parseInt(d["Space"]) * tile_width + tile_width/2;
        })
        .attr("y",function(d){
            return parseInt(d["Row"]) * tile_height + tile_height/2;
        })
        .attr("dy",25)
        .text(function (d) {
            return d["Total_EV"];
        })
        .attr("text-anchor","middle");


    //Tansform the legend element to appear in the center and make a call to this element for it to display.

    //Lay rectangles corresponding to each state according to the 'row' and 'column' information in the data.

    //Display the state abbreviation and number of electoral votes on each of these rectangles

    //Use global color scale to color code the tiles.

    //HINT: Use .tile class to style your tiles;
    // .tilestext to style the text corresponding to tiles

    //Call the tool tip on hover over the tiles to display stateName, count of electoral votes
    //then, vote percentage and number of votes won by each party.
    //HINT: Use the .republican, .democrat and .independent classes to style your elements.
};