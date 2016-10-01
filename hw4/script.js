/** Global var to store all match data for the 2014 Fifa cup */
var teamData;

/** Global var for list of all elements that will populate the table.*/
var tableElements;


/** Variables to be used when sizing the svgs in the table cells.*/
var cellWidth = 70,
    cellHeight = 20,
    cellBuffer = 15,
    barHeight = 20,
    heightMargin = 2,
    textMargin = 9;

/**Set variables for commonly accessed data columns*/
var goalsMadeHeader = 'Goals Made',
    goalsConcededHeader = 'Goals Conceded',
    winHeader = 'Wins',
    lossHeader = 'Losses',
    resultHeader = 'Result',
    totalGamesHeader = 'TotalGames',
    resultLabelHeader = 'label',
    resultRankingHeader = 'ranking',
    deltaGoalsHeader = 'Delta Goals',
    gameHeader = 'games';

/** Setup the scales*/
var goalScale = d3.scaleLinear()
    .range([cellBuffer, 2 * cellWidth - cellBuffer]);

/**Used for games/wins/losses*/
var gameScale = d3.scaleLinear()
    .range([0, cellWidth - cellBuffer]);

/**Color scales*/
/**For aggregate columns*/
var aggregateColorScale = d3.scaleLinear()
    .range(['#ece2f0', '#016450']);

/**For goal Column*/
var goalColorScale = d3.scaleQuantize()
    .domain([-1, 1])
    .range(['#cb181d', '#034e7b']);

/**json Object to convert between rounds/results and ranking value*/
var rank = {
    "Winner": 7,
    "Runner-Up": 6,
    'Third Place': 5,
    'Fourth Place': 4,
    'Semi Finals': 3,
    'Quarter Finals': 2,
    'Round of Sixteen': 1,
    'Group': 0
};



//For the HACKER version, comment out this call to d3.json and implement the commented out
// d3.csv call below.

d3.json('data/fifa-matches.json',function(error,data){
    teamData = data;
    createTable();
    updateTable();
})


// // ********************** HACKER VERSION ***************************
// /**
//  * Loads in fifa-matches.csv file, aggregates the data into the correct format,
//  * then calls the appropriate functions to create and populate the table.
//  *
//  */
// d3.csv("data/fifa-matches.csv", function (error, csvData) {
//
//    // ******* TODO: PART I *******
//
//
// });
// // ********************** END HACKER VERSION ***************************

/**
 * Loads in the tree information from fifa-tree.csv and calls createTree(csvData) to render the tree.
 *
 */
d3.csv("data/fifa-tree.csv", function (error, csvData) {

    //Create a unique "id" field for each game
    csvData.forEach(function (d, i) {
        d.id = d.Team + d.Opponent + i;
    });

    createTree(csvData);
});

/**
 * Creates a table skeleton including headers that when clicked allow you to sort the table by the chosen attribute.
 * Also calculates aggregate values of goals, wins, losses and total games as a function of country.
 *
 */
function createTable() {

// ******* TODO: PART II *******
    // SETTING THE DOMAINS FOR EACH SCALE
    // GOALSCALE DOMAIN
    goalScale.domain([0,d3.max(teamData, function(d){
        return d.value[goalsMadeHeader] > d.value[goalsConcededHeader] ? d.value[goalsMadeHeader] : d.value[goalsConcededHeader];
    })]);

    // GAMESCALE DOMAIN
    gameScale.domain([0,d3.max(teamData,function(d){
        return d.value[totalGamesHeader];
    })]);

    aggregateColorScale.domain([0, d3.max(teamData,function(d){
        return d.value[totalGamesHeader];
    })]);

    // CREATING XAXIS AND SCALING IT WITH GOALSCALE
    var x_axis = d3.select("#goalHeader")
        .append("svg")
        .style("width", 2*cellWidth)
        .style("height", cellHeight)
        .append("g")
        //.attr("id","x_axis")
        .attr("transform","translate(0,"+ (cellHeight - heightMargin) +")")
        .call(d3.axisTop(goalScale));

// ******* TODO: PART V *******

}

/**
 * Updates the table contents with a row for each element in the global variable tableElements.
 *
 */
function updateTable() {

// ******* TODO: PART III *******
    //  SELECT, ENTER, EXIT AND MERGE tr ELEMENT
    var tr = d3.select("tbody").selectAll("tr").data(teamData);

    var tr_enter = tr.enter().append("tr");
    tr.exit().remove();
    tr = tr_enter.merge(tr);

    // PASS DATA ELEMENTS TO EACH td ELEMENT ACCORDING TO THE VIZ
    var td = tr.selectAll('td').data(function(d){
        return [
            {'type': d.value.type, 'vis': 'text', 'value': d.key, 'title': true},
            {'type':d.value.type,'vis':'goals','value':[d.value[goalsMadeHeader],d.value[goalsConcededHeader],d.value[deltaGoalsHeader]]},
            {'type':d.value.type,'vis':'text','value':[d.value[resultHeader][resultLabelHeader]] },
            {'type':d.value.type,'vis':'bar','value': [d.value[winHeader]] },
            {'type':d.value.type,'vis':'bar','value': [d.value[lossHeader]] },
            {'type':d.value.type,'vis':'bar','value': [d.value[totalGamesHeader]] }
        ];
    });

    var td_enter = td.enter()
        .append('td');
    td.exit().remove();
    td = td_enter.merge(td);

    var td_text = td.filter(function (d){
            return d.vis == "text";
        })
        .text(function(d){
            return d.value;
        });

    var td_names  = td_text.filter(function(d){
        return d.title == true;
        })
        .attr("class", function(d){
           return d.type;
        })
        .on("click", function(d){
            console.log(d );

        });

    var td_bars = td.filter(function (d){
            return d.vis == 'bar';
        })
        .selectAll("svg").data(function(d){
            return [d];
        });

    var td_bars_enter = td_bars.enter()
        .append("svg")
        .attr("width",cellWidth)
        .attr("height",cellHeight);

    td_bars.exit().remove();

    td_bars = td_bars_enter.merge(td_bars);

    var rects = td_bars.filter(function (d) {
            return d.type == "aggregate";
        })
        .selectAll("rect").data(function (d) {
        return [d];
    });

    var rects_enter = rects.enter()
        .append("rect")
        .attr("height",barHeight);

    rects.exit().remove();

    rects = rects_enter.merge(rects);

    rects.attr("width", function(d){
                return gameScale(d.value);
        })
        .attr("fill", function(d){
                return aggregateColorScale(d.value);
        });

    var rects_text = td_bars.filter(function (d) {
            return d.type == "aggregate";
        })
        .selectAll("text").data(function(d){
        return [d];
    });

    var rects_text_enter = rects_text.enter()
        .append("text")
        .attr("y",barHeight/2)
        .attr("dy", ".35em")
        .attr("class","label");

    rects_text.exit().remove();

    rects_text = rects_text_enter.merge(rects_enter);

    rects_text.attr("x", function(d) {
                return  gameScale(d.value) - textMargin ;
            })
            .text(function(d) {
                    return d.value;
            });


    var td_goals = td.filter(function(d){
            return d.vis == "goals";
        });
    var td_goals_svg  = td_goals.selectAll("svg").data(function(d){
        return [d];
    });

    var td_goals_svg_enter = td_goals_svg.enter()
        .append("svg")
        .attr("width",2*cellWidth)
        .attr("height",cellHeight);

    td_goals_svg.exit().remove();
    td_goals_svg = td_goals_svg_enter.merge(td_goals_svg);

    // CREATE THE RECTANGLES
    var td_goals_rect = td_goals_svg.selectAll("rect").data(function(d){

        return [d];
    });

    var td_goals_rect_enter = td_goals_rect.enter()
                    .append("rect")
                    .attr("class", "goalBar");

    td_goals_rect.exit().remove();

    td_goals_rect = td_goals_rect_enter.merge(td_goals_rect);

    var td_goals_rect_aggregate = td_goals_rect.filter(function(d){
        return d.type == "aggregate";
    });

    var td_goals_rect_games = td_goals_rect.filter(function(d){
        return d.type == "game";
    });

    td_goals_rect_aggregate
        .attr("width",function(d){
            max_val  = d.value[0] > d.value[1] ? d.value[0] : d.value[1];
            min_val  = d.value[1]  < d.value[0] ? d.value[1] : d.value[0];
            return goalScale(max_val) - goalScale(min_val);
        })
        .attr("x", function(d){
            max_val  = d.value[0] > d.value[1] ? d.value[0] : d.value[1];
            return goalScale(max_val);
        })
        .attr("y",function(d) {
            return (cellHeight/2);
        })
        .attr("height",function(d) {
            return (cellHeight/2);
        })
        .attr("fill",function(d) {
            return goalColorScale(d.value[2]);
        });

    td_goals_rect_games
        .attr("width",function(d){
            max_val  = d.value[0] > d.value[1] ? d.value[0] : d.value[1];
            min_val  = d.value[1]  < d.value[0] ? d.value[1] : d.value[0];
            return goalScale(max_val) - goalScale(min_val);
        })
        .attr("x", function(d){
            max_val  = d.value[0] > d.value[1] ? d.value[0] : d.value[1];
            return goalScale(max_val);
        })
        .attr("y",function(d) {
            return (cellHeight/2);
        })
        .attr("height",function(d) {
            return (barHeight/4);
        })
        .attr("fill",function(d) {
            return goalColorScale(d.value[0]-d.value[1]);
        });

    // CREATE THE CIRCLES

    //var td_goals_circle = td_goals_svg.selectAll("circle").data(function(d){
    //    console.log(d);
    //    return [d];
    //});
    //
    //var td_goals_circle_enter = td_goals_circle.enter()
    //    .append("circle")
    //    .attr("cy",cellHeight/2)
    //    .attr("class", "goalCircle");
    //
    //td_goals_circle.exit().remove();
    //
    //td_goals_circle = td_goals_circle_enter.merge(td_goals_circle);
    //
    //var td_goals_circle_aggregate = td_goals_circle.filter(function(d){
    //    return d.type == "aggregate";
    //}).data(function(d){
    //    return [
    //        {"value": [d.value[0], d.value[2]]},
    //        {"value": [d.value[1], d.value[2]]}
    //        ];
    //});
    //
    //var td_goals_circle_games = td_goals_circle.filter(function(d){
    //    return d.type == "game";
    //}).data(function(d){
    //    return [
    //        {"value": [d.value[0], d.value[0] - d.value[1] ]},
    //        {"value": [d.value[1], d.value[0] - d.value[1] ]}
    //    ];
    //});
    //
    //
    //td_goals_circle_aggregate = td_goals_circle_aggregate.enter()
    //    .append("circle")
    //    .attr("cy",cellHeight/2)
    //    .attr("class","goalCircleAgg")
    //    .merge(td_goals_circle_aggregate);
    //
    //td_goals_circle_aggregate
    //    .attr("cx",function(d){
    //        return goalScale(d.value[0]);
    //    })
    //    .attr("height",function(d) {
    //        return (cellHeight/2);
    //    })
    //    .attr("fill",function(d, i) {
    //        colors = ["#045d95", "#a01317"]
    //        return colors[i];
    //    })
    //    .attr("stroke",function(d,i) {
    //
    //    });
    //
    //
    //td_goals_circle_games = td_goals_circle_games.enter()
    //    .append("circle")
    //    .attr("cy",cellHeight/2)
    //    .attr("class","goalCircle")
    //    .merge(td_goals_circle_games);
    //
    ////td_goals_circle_games
    ////    .attr("cx",function(d){
    ////        return goalScale(d.value[0]);
    ////    })
    //    //.attr("x", function(d){
    //    //    max_val  = d.value[0] > d.value[1] ? d.value[0] : d.value[1];
    //    //    return goalScale(max_val);
    //    //})
    //    //.attr("y",function(d) {
    //    //    return (cellHeight/2);
    //    //})
    //    //.attr("height",function(d) {
    //    //    return (barHeight/4);
    //    //})
    //    //.attr("fill",function(d) {
    //    //    return goalColorScale(d.value[0]-d.value[1]);
    //    //})
    //    //;
    //







};


/**
 * Collapses all expanded countries, leaving only rows for aggregate values per country.
 *
 */
function collapseList() {

    // ******* TODO: PART IV *******


}

/**
 * Updates the global tableElements variable, with a row for each row to be rendered in the table.
 *
 */
function updateList(i) {

    // ******* TODO: PART IV *******


}

/**
 * Creates a node/edge structure and renders a tree layout based on the input data
 *
 * @param treeData an array of objects that contain parent/child information.
 */
function createTree(treeData) {

    // ******* TODO: PART VI *******


};

/**
 * Updates the highlighting in the tree based on the selected team.
 * Highlights the appropriate team nodes and labels.
 *
 * @param team a string specifying which team was selected in the table.
 */
function updateTree(row) {

    // ******* TODO: PART VII *******


}

/**
 * Removes all highlighting from the tree.
 */
function clearTree() {

    // ******* TODO: PART VII *******
    

}



