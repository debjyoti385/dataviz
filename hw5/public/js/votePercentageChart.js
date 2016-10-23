/**
 * Constructor for the Vote Percentage Chart
 */
function VotePercentageChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
VotePercentageChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};
    var divvotesPercentage = d3.select("#votes-percentage").classed("content", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divvotesPercentage.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 200;

    //creates svg element within the div
    self.svg = divvotesPercentage.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
VotePercentageChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party == "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Renders the HTML content for tool tip
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for toop tip
 */
VotePercentageChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<ul>";
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });

    return text;
}

/**
 * Creates the stacked bar chart, text content and tool tips for Vote Percentage chart
 *
 * @param electionResult election data for the year selected
 */
VotePercentageChart.prototype.update = function(electionResult){
    var self = this;

    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart
    tip = d3.tip().attr('class', 'd3-tip')
        .direction('s')
        .offset(function() {
            return [0,0];
        })
        .html(function(d) {
            // populate data in the following format
              tooltip_data = {
              "result":[
              {"nominee": d["all_data"]["D_Nominee_prop"],"votecount": d["all_data"]["D_Votes_Total"],"percentage": d["all_data"]["D_PopularPercentage"],"party":"D"} ,
              {"nominee": d["all_data"]["R_Nominee_prop"],"votecount": d["all_data"]["R_Votes_Total"],"percentage": d["all_data"]["R_PopularPercentage"],"party":"R"}
              ]
              };

            if (d["all_data"]["I_Nominee_prop"].length > 1)
                tooltip_data.result.push({"nominee": d["all_data"]["I_Nominee_prop"],"votecount": d["all_data"]["I_Votes_Total"],"percentage": d["all_data"]["I_PopularPercentage"],"party":"I"});
             // pass this as an argument to the tooltip_render function then,
             // return the HTML content returned from that method.

            return self.tooltip_render(tooltip_data);
        });




    var data  =   [];

    if (electionResult[0]["I_Nominee_prop"].length > 1)
        data.push({"party":"I", "value":parseFloat( electionResult[0]["I_PopularPercentage"] == "" ? 0 :electionResult[0]["I_PopularPercentage"]), "all_data": electionResult[0]})


    data.push({"party":"D", "value":parseFloat(electionResult[0]["D_PopularPercentage"]), "all_data": electionResult [0]});
    data.push({"party":"R", "value":parseFloat(electionResult[0]["R_PopularPercentage"]), "all_data": electionResult[0]});


    var total =  d3.sum(electionResult,function(d){return parseInt(d["Total_EV"]);});

    var xScale  = d3.scaleLinear()
        .domain([0,100])
        .range([0 ,self.svgWidth ]);

    var current_percentage = 0.0;

    var bars = self.svg.selectAll("rect")
        .data(data);

    var current_EV = 0;

    bars.exit().remove();

    var barsEnter  = bars.enter()
        .append("rect").merge(bars);

    barsEnter.attr("y",105)
        .classed("votesPercentage",true)
        .attr("x",function(d){
            old_precentage = current_percentage;
            current_percentage = current_percentage + d.value;
            return xScale(old_precentage);
        })
        .attr("class",function(d){
            return self.chooseClass(d["party"])
        })
        .attr("width", function(d){return xScale(d.value)})
        .attr("height",30)
        .call(tip)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);



    var barstext= self.svg.selectAll(".votesPercentageText").data(data);


    var barstextEnter  = barstext.enter()
        .append("text")
        .attr("class","votesPercentageText");

    barstext.exit().remove();
    barstext.selectAll("tspan").remove();

    barstext = barstextEnter.merge(barstext);

    barstext.selectAll("text").remove();

    current_percentage = 0.0;

    barstext
        .append("tspan")
        .attr("x",function(d,i){
            old_precentage = current_percentage;
            current_percentage = current_percentage + d.value;
            if (current_percentage >90)
                return xScale(current_percentage);

            return xScale(old_precentage + d.value/2 *i);
        })
        .attr("y",function(d){
            return 50;
        })
        .attr("dy",-10)
        .text(function (d) {
            return d["all_data"][ d["party"] + "_Nominee_prop"];
        })
        .attr("class",function(d){
            return self.chooseClass(d["party"])
        })
        ;

    current_percentage = 0.0;
    barstext
        .append("tspan")
        .attr("x",function(d,i){
            old_precentage = current_percentage;
            current_percentage = current_percentage + d.value;
            console.log(current_percentage);
            if (current_percentage >90)
                return xScale(current_percentage);
            return xScale(old_precentage + d.value/2 *i);
        })
        .attr("y",function(d){
            return 50;
        })
        .attr("dy",25)
        .text(function (d) {
            return d["value"]+"%";
        })
        .attr("class",function(d){
            return self.chooseClass(d["party"])
        });




    self.svg.append("rect")
        .attr("x",xScale(100/2.0))
        .attr("y",100)
        .attr("width",3)
        .attr("height",40)
        .classed("middlePoint",true);

    self.svg.select("textlegend").remove();

    self.svg.append("text")
        .classed("textlegend",true)
        .attr("x",xScale(100/2.0))
        .attr("y",100)
        .attr("dy",-25)
        .attr("fill","black")
        .style("text-anchor","middle")
        .text("Popular Vote (50%)");


    // ******* TODO: PART III *******

    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .votesPercentage class to style your bars.

    //Display the total percentage of votes won by each party
    //on top of the corresponding groups of bars.
    //HINT: Use the .votesPercentageText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary

    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.

    //Just above this, display the text mentioning details about this mark on top of this bar
    //HINT: Use .votesPercentageNote class to style this text element

    //Call the tool tip on hover over the bars to display stateName, count of electoral votes.
    //then, vote percentage and number of votes won by each party.

    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.

};
