
/**
 * Constructor for the ElectoralVoteChart
 *
 * @param shiftChart an instance of the ShiftChart class
 */
function ElectoralVoteChart(shiftChart){

    var self = this;
    self.shiftChart = shiftChart;

    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
ElectoralVoteChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divelectoralVotes = d3.select("#electoral-vote").classed("content", true);
    self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 150;

    //creates svg element within the div
    self.svg = divelectoralVotes.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
ElectoralVoteChart.prototype.chooseClass = function (party) {
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
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */

ElectoralVoteChart.prototype.update = function(electionResult, colorScale){
    var self = this;

    // ******* TODO: PART II *******




    electionResult.sort(function (a, b) {
        if (parseFloat(a["RD_Difference"]) == 0)
            a["RD_Difference"] = -10000;
        if (parseFloat(b["RD_Difference"]) == 0)
            b["RD_Difference"] = -10000;
            return d3.ascending(parseFloat(a["RD_Difference"]), parseFloat(b["RD_Difference"]));
    });
    var total =  d3.sum(electionResult,function(d){return parseInt(d["Total_EV"]);});

    var xScale  = d3.scaleLinear()
        .domain([0,total])
        .range([0 ,self.svgWidth ]);




    var bars = self.svg.selectAll("rect")
        .data(electionResult);

    var current_EV = 0;

    bars.exit().remove();

    var barsEnter  = bars.enter()
        .append("rect").merge(bars);

    barsEnter.attr("y",60)
        .classed("electoralVotes",true)
        .attr("x",function(d){
            old_ev= current_EV;
            current_EV = current_EV + parseInt(d["Total_EV"]) ;
            d["x"] = xScale(old_ev);
            d["x_end"] = xScale(current_EV);
            return d["x"];
        })
        .style("fill",function(d){
            if (d["State_Winner"] == "I")
                return "#45AD6A";
            return colorScale(parseFloat(d["RD_Difference"]))
        })
        .attr("width", function(d){
            return  xScale( parseInt(d["Total_EV"]) ) })
        .attr("height",30)
        ;


    var data = [];
    var i_vote = d3.sum(electionResult, function (d) {
        if (d["State_Winner"] == "I")
            return d["Total_EV"];
    });
    if (i_vote > 0)
        data.push({"party":"I","value":i_vote});

    data.push({"party":"D","value":d3.sum(electionResult, function (d) {
        if (d["State_Winner"] == "D")
            return d["Total_EV"];
    })});
    data.push({"party":"R","value":d3.sum(electionResult, function (d) {
        if (d["State_Winner"] == "R")
            return d["Total_EV"];
    })});

    var barstext= self.svg.selectAll(".electoralVoteText").data(data);


    var barstextEnter  = barstext.enter()
        .append("text")
        .attr("class","electoralVoteText");

    barstext.exit().remove();
    barstext.selectAll("tspan").remove();

    barstext = barstextEnter.merge(barstext);

    barstext.selectAll("text").remove();

    current_EV = 0.0;


    barstext
        .append("tspan")
        .attr("x",function(d,i){
            old_ev= current_EV;
            current_EV = current_EV + d.value ;
            if (current_EV > total*0.90)
                return xScale(total);

            return xScale(old_ev);
        })
        .attr("y",function(d){
            return 50;
        })
        //.attr("dy",-10)
        .text(function (d) {
            return d.value;
        })
        .attr("class",function(d){
            return self.chooseClass(d["party"])
        })
    ;



    self.svg.append("rect")
        .attr("x",xScale(total/2.0))
        .attr("y",50)
        .attr("width",3)
        .attr("height",50)
        .classed("middlePoint",true);


    self.svg.select(".textlegend").remove()

    self.svg.append("text")
        .classed("textlegend",true)
        .append("tspan")
        .attr("x",xScale(total/2.0))
        .attr("y",100)
        .attr("dy",25)
        .attr("fill","black")
        .style("text-anchor","middle")
        .text("Electoral Vote ("+  Math.ceil((total) /2.0 +1)  +" needed to win)");


    self.svg.append("g")
        .attr("class", "brush")
        .call(d3.brushX()
            .extent([[0,50],[self.svgWidth,100]])
            .on("end", brushed));


    function brushed() {
        var selection = d3.event.selection;
        var selectedObject = electionResult;
        selectedObject=[];
        console.log(selection);
        electionResult.forEach(function (d, i) {
            if ( (selection[0] >= d["x"] && selection[0] < d["x_end"]) || (selection[0] <= d["x"] && selection[1] > d["x_end"]) || (selection[1] < d["x_end"] && selection[1] >= d["x"])){
                //var index = selectedObject.indexOf(d);
                //if (index > -1) {
                //    selectedObject.splice(index, 1);
                //}
                selectedObject.push(d);
            }
        });
        self.shiftChart.update(selectedObject);
    }

    //Group the states based on the winning party for the state;
    //then sort them based on the margin of victory

    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .electoralVotes class to style your bars.

    //Display total count of electoral votes won by the Democrat and Republican party
    //on top of the corresponding groups of bars.
    //HINT: Use the .electoralVoteText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary

    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.

    //Just above this, display the text mentioning the total number of electoral votes required
    // to win the elections throughout the country
    //HINT: Use .electoralVotesNote class to style this text element

    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.

    //******* TODO: PART V *******
    //Implement brush on the bar chart created above.
    //Implement a call back method to handle the brush end event.
    //Call the update method of shiftChart and pass the data corresponding to brush selection.
    //HINT: Use the .brush class to style the brush.

};
