/*globals alert, document, d3, console*/
// These keep JSHint quiet if you're using it (highly recommended!)

function staircase() {
    // ****** TODO: PART II ******
    console.log("I am in staircase");
    var svgElement  = document.getElementById("barchart1");
    var rectangles = svgElement.getElementsByTagName("rect");
    rect_width = 10;
    for (var i=0;  i<rectangles.length; i++){
        console.log(rectangles[i]);
        rectangles[i].setAttribute("width", (rect_width)+"px");
        rect_width = rect_width + 10;
    }
}

function colorchange(){

    var svgElement  = document.getElementById("barchart1");
    var rectangles = svgElement.getElementsByTagName("rect");
    for(var i=0; i< rectangles.length;i++){
        console.log("I am changing the color " + rectangles[i]);
        rectangles[i].onmouseover = function(){this.style.fill="black"};
        rectangles[i].onmouseout = function(){this.style.fill="steelblue"};
    }
}

function update(error, data) {
    if (error !== null) {
        alert("Couldn't load the dataset!");
    } else {
        // D3 loads all CSV data as strings;
        // while Javascript is pretty smart
        // about interpreting strings as
        // numbers when you do things like
        // multiplication, it will still
        // treat them as strings where it makes
        // sense (e.g. adding strings will
        // concatenate them, not add the values
        // together, or comparing strings
        // will do string comparison, not
        // numeric comparison).

        // We need to explicitly convert values
        // to numbers so that comparisons work
        // when we call d3.max()
        data.forEach(function (d) {
            d.a = parseInt(d.a);
            d.b = parseFloat(d.b);
        });
    }

    // Set up the scales
    var aScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.a;
        })])
        .range([0, 150]);
    var bScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.b;
        })])
        .range([0, 150]);
    var iScale = d3.scaleLinear()
        .domain([0, data.length])
        .range([0, 110]);

    // ****** TODO: PART III (you will also edit in PART V) ******

    // TODO: Select and update the 'a' bar chart bars
    var svgbarchart1 = d3.select("#barchart1");
    console.log(data);
    var selection1 = svgbarchart1.selectAll("rect").data(data);
        selection1
            .transition()
            .duration(1500)
            .attr("width",function(d,i){return d.a *10});



    // TODO: Select and update the 'b' bar chart bars
    var svgbarchart2 = d3.select("#barchart2");
    console.log(data);
    var  selection2 = svgbarchart2.selectAll("rect").data(data);
        selection2
            .transition()
            .duration(1500)
            .attr("width",function(d,i){return d.b *10});



    // TODO: Select and update the 'a' line chart path using this line generator





    var aLineGenerator = d3.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return aScale(d.a);
        });

    var bLineGenerator = d3.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return bScale(d.b);
        });

    var linechartsvg1 = d3.select("#linechart1");
    console.log(data);
    console.log(linechartsvg1);
    var selection3 = linechartsvg1
        .transition()
        .duration(3000)
        .attr("d", function(d){return aLineGenerator(data);});



    // TODO: Select and update the 'b' line chart path (create your own generator)
    var linechartsvg2 = d3.select("#linechart2");
    console.log(data);
    console.log(linechartsvg2);
    var selection4 = linechartsvg2
        .transition()
        .duration(3000)
        .attr("d", function(d){return bLineGenerator(data);});




    // TODO: Select and update the 'a' area chart path using this line generator
    var aAreaGenerator = d3.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return aScale(d.a);
        });
    var bAreaGenerator = d3.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return bScale(d.b);
        });



    // TODO: Select and update the 'b' area chart path (create your own generator)

    var areachartsvg1 = d3.select("#areachart1");
    console.log(data);
    console.log(areachartsvg1);
    var selection5 = areachartsvg1
        .transition()
        .duration(1500)
        .attr("d", function(d){return aAreaGenerator(data);});

    var areachartsvg2 = d3.select("#areachart2");
    console.log(data);
    console.log(areachartsvg2);
    var selection6 = areachartsvg2
        .transition()
        .duration(1500)
        .attr("d", function(d){return bAreaGenerator(data);});



    // TODO: Select and update the scatterplot points
    // ****** TODO: PART IV ******
    colorchange();


    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var svgscatterplot = d3.select("#scatterplot");
    console.log(data);
    var selection7 = svgscatterplot.selectAll("circle").data(data);
        selection7
            .on("mouseover", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html( "(" + d.a + ",  " + d.b +")" )
                    .style("left", (d3.event.pageX -0) + "px")
                    .style("top", (d3.event.pageY - 5) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .attr("cx",function(d,i){return d.a *10})
            .attr("cy",function(d,i){return d.b *10});






}

function changeData() {
    // // Load the file indicated by the select menu
    console.log("I am inside changedata")
    var dataFile = document.getElementById('dataset').value;
    if (document.getElementById('random').checked) {
        randomSubset();
    }
    else{
        d3.csv('data/' + dataFile + '.csv', update);
    }
}

function randomSubset() {
    // Load the file indicated by the select menu,
    // and then slice out a random chunk before
    // passing the data to update()
    var dataFile = document.getElementById('dataset').value;
    if (document.getElementById('random').checked) {
        d3.csv('data/' + dataFile + '.csv', function (error, data) {
            var subset = [];
            data.forEach(function (d) {
                if (Math.random() > 0.5) {
                    subset.push(d);
                }
            });
            update(error, subset);
        });
    }
    else{
        changeData();
    }
}