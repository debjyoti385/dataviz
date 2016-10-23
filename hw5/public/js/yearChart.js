/**
 * Constructor for the Year Chart
 *
 * @param electoralVoteChart instance of ElectoralVoteChart
 * @param tileChart instance of TileChart
 * @param votePercentageChart instance of Vote Percentage Chart
 * @param electionInfo instance of ElectionInfo
 * @param electionWinners data corresponding to the winning parties over mutiple election years
 */
function YearChart(electoralVoteChart, tileChart, votePercentageChart, electionWinners) {
    var self = this;

    self.electoralVoteChart = electoralVoteChart;
    self.tileChart = tileChart;
    self.votePercentageChart = votePercentageChart;
    self.electionWinners = electionWinners;
    self.init();


};

/**
 * Initializes the svg elements required for this chart
 */
YearChart.prototype.init = function(){

    var self = this;
    self.margin = {top: 10, right: 20, bottom: 30, left: 50};
    var divyearChart = d3.select("#year-chart").classed("fullView", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divyearChart.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 100;

    //creates svg element within the div
    self.svg = divyearChart.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)

};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
YearChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R") {
        return "yearChart republican";
    }
    else if (party == "D") {
        return "yearChart democrat";
    }
    else if (party == "I") {
        return "yearChart independent";
    }
}


/**
 * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
 */
YearChart.prototype.update = function(){
    var self = this;

    //Domain definition for global color scale
    var domain = [-60,-50,-40,-30,-20,-10,0,10,20,30,40,50,60 ];

    //Color range for global color scale
    var range = ["#0066CC", "#0080FF", "#3399FF", "#66B2FF", "#99ccff", "#CCE5FF", "#ffcccc", "#ff9999", "#ff6666", "#ff3333", "#FF0000", "#CC0000"];

    //Global colorScale to be used consistently by all the charts
    self.colorScale = d3.scaleQuantile()
        .domain(domain).range(range);

    // ******* TODO: PART I *******

    var xScale  = d3.scaleLinear().domain([
        d3.min(
            self.electionWinners,function(d){
            return d.YEAR;
        }),
        d3.max(
            self.electionWinners,function(d){
                return d.YEAR;
            })
    ])
    .range([0 + self.margin.right ,self.svgWidth - self.margin.right ]);

    var circle = self.svg.selectAll("circle")
        .data(self.electionWinners);

    self.svg.append("line")
        .attr("x1",0)
        .attr("y1",self.svgHeight/2)
        .attr("x2",self.svgWidth)
        .attr("y2",self.svgHeight/2)
        .classed("lineChart",true);

    circle.enter()
        .append("circle")
        .attr("r",15)
        .attr("cx",function(d){ return xScale(d.YEAR); })
        .attr("cy",self.svgHeight/2)
        .attr("class",function(d){return self.chooseClass(d.PARTY);})
        .on("click", function(d) {
            console.log("data/year_timeline_"+ d.YEAR+".csv")
            d3.selectAll("circle").classed("highlighted",false);
            d3.select(this).classed("highlighted",true);
            d3.csv("data/year_timeline_"+ d.YEAR+".csv",function (error, electionResult) {
                self.votePercentageChart.update(electionResult,self.colorScale);
                self.tileChart.update(electionResult,self.colorScale);
                self.electoralVoteChart.update(electionResult,self.colorScale);
            });
        });

    var text  = self.svg.selectAll("text")
        .data(self.electionWinners);

    text.enter()
        .append("text")
        .attr("x", function (d) {
            return xScale(d.YEAR);
        })
        .attr("y",self.svgHeight/2 + 30)
        .text(function(d){return d.YEAR})
        .attr("text-anchor","middle")
        .classed("yeartest",true);




    // Create the chart by adding circle elements representing each election year
    //The circles should be colored based on the winning party for that year
    //HINT: Use the .yearChart class to style your circle elements
    //HINT: Use the chooseClass method to choose the color corresponding to the winning party.

    //Append text information of each year right below the corresponding circle
    //HINT: Use .yeartext class to style your text elements

    //Style the chart by adding a dashed line that connects all these years.
    //HINT: Use .lineChart to style this dashed line

    //Clicking on any specific year should highlight that circle and  update the rest of the visualizations
    //HINT: Use .highlighted class to style the highlighted circle

    //Election information corresponding to that year should be loaded and passed to
    // the update methods of other visualizations


    //******* TODO: EXTRA CREDIT *******

    //Implement brush on the year chart created above.
    //Implement a call back method to handle the brush end event.
    //Call the update method of shiftChart and pass the data corresponding to brush selection.
    //HINT: Use the .brush class to style the brush.
};
