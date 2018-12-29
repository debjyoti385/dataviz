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


var colors = [ "#a01317" ,"#045d95"];

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



// Add property to the element for sorting
var table_header = d3.select("thead").select("tr");
table_header.select("th")
    .attr("asc",1);
table_header.selectAll("td")
    .attr("asc",1);





function sort_update(column, order){

    console.log(column);
    collapseList();

    switch(column) {
        case "team":
            teamData.sort(function (a, b) {
                if (order == 0) {
                    return d3.ascending(a.key, b.key);
                }
                else {
                    return d3.descending(a.key, b.key);
                }
            });
            teamData.forEach(function(f){
                f.value.games.sort(function (a, b) {
                    if (order == 0) {
                        return d3.descending(a.key, b.key);
                    }
                    else{
                        return d3.ascending(a.key, b.key);

                    }
                });
            });



            break;

        case "goals":
            console.log("Sorting " + order);
            teamData.sort(function (a, b) {
                if (order == 1) {
                    return d3.ascending(a.value[deltaGoalsHeader], b.value[deltaGoalsHeader]);
                }
                else{
                    return d3.descending(a.value[deltaGoalsHeader], b.value[deltaGoalsHeader]);
                }
            });

            teamData.forEach(function(f){
                f.value.games.sort(function (a, b) {
                    if (order == 1) {
                        return d3.ascending(a.value[deltaGoalsHeader], b.value[deltaGoalsHeader]);
                    }
                    else{
                        return d3.descending(a.value[deltaGoalsHeader], b.value[deltaGoalsHeader]);
                    }
                });
            });

            break;

        case "round/result":
            teamData.sort(function (a, b) {
                if (order == 1) {
                    return d3.ascending(a.value[resultHeader][resultRankingHeader], b.value[resultHeader][resultRankingHeader]);
                }
                else {
                    return d3.descending(a.value[resultHeader][resultRankingHeader], b.value[resultHeader][resultRankingHeader]);
                }
            });

            teamData.forEach(function(f){
                f.value.games.sort(function (a, b) {
                    if (order == 1) {
                        return d3.descending(a.value[resultHeader][resultRankingHeader], b.value[resultHeader][resultRankingHeader]);
                    }
                    else{
                        return d3.ascending(a.value[resultHeader][resultRankingHeader], b.value[resultHeader][resultRankingHeader]);
                    }
                });
            });

            break;

        case "wins":
            teamData.sort(function (a, b) {
                if (order == 1) {
                    return d3.ascending(a.value[winHeader], b.value[winHeader]);
                }
                else {
                    return d3.descending(a.value[winHeader], b.value[winHeader]);
                }
            });


            break;

        case "losses":
            teamData.sort(function (a, b) {
                if (order == 1) {
                    return d3.ascending(a.value[lossHeader], b.value[lossHeader]);
                }
                else {
                    return d3.descending(a.value[lossHeader], b.value[lossHeader]);
                }
            });


            break;
        case "total":
            teamData.sort(function (a, b) {
                if (order == 1) {
                    return d3.ascending(a.value[totalGamesHeader], b.value[totalGamesHeader]);
                }
                else {
                    return d3.descending(a.value[totalGamesHeader], b.value[totalGamesHeader]);
                }
            });

            break;
    }

            updateTable();
}




//For the HACKER version, comment out this call to d3.json and implement the commented out
// d3.csv call below.

d3.json('data/fifa-matches.json',function(error,data){
    teamData = data;


    teamData.map(function(d){
        d.value.selected = false;
    })

    createTable();
    updateTable();

});


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
        .attr("transform","translate(0,"+ (cellHeight - heightMargin) +")")
        .call(d3.axisTop(goalScale));

// ******* TODO: PART V *******


    var table_header = d3.select("thead").select("tr");
    table_header.select("th")
        .on("click",function(){
            console.log(d3.select(this).html().trim().split(" ")[0].trim() + d3.select(this).attr("asc") );

            var order = d3.select(this).attr("asc");
            d3.select(this).attr("asc", order == 0? 1:0);
            d3.select(this).attr("asc");
            sort_update(d3.select(this).html().trim().split(" ")[0].trim().toLowerCase() , d3.select(this).attr("asc") );
        });
    table_header.selectAll("td")
        .on("click",function(){
            console.log(d3.select(this).html().trim().split(" ")[0].trim() + d3.select(this).attr("asc") );
            var order = d3.select(this).attr("asc");
            console.log(order);
            d3.select(this).attr("asc", order == 0? 1:0);
            console.log(d3.select(this).attr("asc"));
            sort_update(d3.select(this).html().trim().split(" ")[0].trim().toLowerCase() , d3.select(this).attr("asc") );
        });

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

    tr.on("mouseover",function(d){
            updateTree(d);
        })
        .on("mouseout",function(d){
            clearTree();
        });

    // PASS DATA ELEMENTS TO EACH td ELEMENT ACCORDING TO THE VIZ
    var td = tr.selectAll('td').data(function(d){
           return [
                {'type': d.value.type, 'vis': 'text', 'value': d.key, 'title': true},
                {
                    'type': d.value.type,
                    'vis': 'goals',
                    'value':  [d.value[goalsMadeHeader], d.value[goalsConcededHeader], d.value.type == "aggregate" ? d.value[deltaGoalsHeader]: d.value[goalsMadeHeader] - d.value[goalsConcededHeader]]
                },
                {'type': d.value.type, 'vis': 'text', 'value': [d.value[resultHeader][resultLabelHeader]]},
                {'type': d.value.type, 'vis': 'bar', 'value': [d.value[winHeader]]},
                {'type': d.value.type, 'vis': 'bar', 'value': [d.value[lossHeader]]},
                {'type': d.value.type, 'vis': 'bar', 'value': [d.value[totalGamesHeader]]}
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
            if (d.type== "game" && d.title == true)
                return "x" + d.value;
            return d.value;
        });

    var td_names  = td_text.filter(function(d){
        return d.title == true;
        })
        .attr("class", function(d){
           return d.type;
        })
        .classed("right-align",function(d){
            if (d.title == true){
                return true;
            }
            return false;
        })
        .on("click", function(d){
            var position = 0;
            for (var l = 0; l < teamData.length; l++) {
                if (teamData[l].key == d.value && teamData[l].value.type == "aggregate") {
                    position = l;
                    break;
                }
            }

            // ******* TODO: PART IV *******

            if (d.type == "aggregate" && teamData[position].value.selected  != true ) {
                teamData[position].value.selected = true;
                teamData[position].value.games.forEach(function (f) {
                    teamData.splice(position + 1, 0, f);
                });
            }
            else if (d.type == "aggregate" && teamData[position].value.selected  == true ) {
                teamData[position].value.selected = false;
                teamData.splice(position + 1,teamData[position].value[gameHeader].length);
            }
            updateTable();
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

    var rects = td_bars
        .selectAll("rect").data(function (d) {
        return [d];
    });

    var rects_enter = rects.enter()
        .append("rect")
        .attr("height",barHeight);

    rects.exit().remove();

    rects = rects_enter.merge(rects);

    rects.attr("width", function(d){
            if (d.type == "aggregate") {
                return gameScale(d.value);
            }
        })
        .attr("fill", function(d){
            if (d.type == "aggregate") {
                return aggregateColorScale(d.value);
            }
        });

    var rects_text = td_bars
        .selectAll("text").data(function(d){
        return [d];
    });

    var rects_text_enter = rects_text.enter()
        .append("text")
        .attr("y",barHeight/2)
        .attr("dy", ".35em")
        .attr("class","label");

    rects_text.exit().remove();

    rects_text = rects_text_enter.merge(rects_text);

    rects_text.attr("x", function(d) {
                if (d.type == "aggregate") {
                    return  gameScale(d.value) - textMargin ;
                }
            })
            .text(function(d) {
                if (d.type == "aggregate") {
                    return d.value;
                }
                console.log("here");
                return "";
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
            min_val  = d.value[1]  < d.value[0] ? d.value[1] : d.value[0];
            return goalScale(min_val);
        })
        .attr("y",function(d) {
            return (cellHeight/4);
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
            min_val  = d.value[1]  < d.value[0] ? d.value[1] : d.value[0];
            return goalScale(min_val);
        })
        .attr("y",function(d) {
            return (cellHeight/2.75);
        })
        .attr("height",function(d) {
            return (barHeight/4);
        })
        .attr("fill",function(d) {
            return goalColorScale(d.value[0]-d.value[1]);
        });

    // CREATE THE CIRCLES

    var td_goals_circle = td_goals_svg.selectAll("circle").data(function(d){
            return [
                {"type": d.type, "value": [d.value[0], d.value[2]]},
                {"type": d.type, "value": [d.value[1], d.value[2]]}
            ];
    });

    var td_goals_circle_enter = td_goals_circle.enter()
        .append("circle")
        .attr("cy",cellHeight/2)
        .attr("class", "goalCircle");

    td_goals_circle.exit().remove();

    td_goals_circle = td_goals_circle_enter.merge(td_goals_circle);


    td_goals_circle
        .attr("cx",function(d){
                return goalScale(d.value[0]);
        })
        //.attr("height",function(d) {
        //    if (d.type == "aggregate")
        //        return (cellHeight/2);
        //})
        .attr("fill",function(d, i) {
            if (d.type == "aggregate") {
                return colors[i];
            }
            else{
                return "white";
            }
        })
        .attr("stroke",function(d,i) {
            if (d.type == "aggregate") {
                if (d.value[1] == 0) {
                    return "grey";
                }
            }else {
                colors = ["#045d95", "#a01317"]
                return colors[i];
            }

        });


};


/**
 * Collapses all expanded countries, leaving only rows for aggregate values per country.
 *
 */
function collapseList() {

    // ******* TODO: PART IV *******
    teamData.map(function(d){
        d.value.selected = false;
    });
    for(var i=0; i < teamData.length -1; i++){
        if(teamData[i].value.type == "aggregate" && teamData[i+1].value.type == "game"){
            teamData.splice(i+1,teamData[i].value[gameHeader].length);
        }
    }



}

/**
 * Updates the global tableElements variable, with a row for each row to be rendered in the table.
 *
 */
function updateList(position) {

    // ******* TODO: PART IV *******
    // ADDED THIS PART IN CLICK FUNCTION

}

/**
 * Creates a node/edge structure and renders a tree layout based on the input data
 *
 * @param treeData an array of objects that contain parent/child information.
 */
function createTree(treeData) {

    // ******* TODO: PART VI *******
    var root = d3.stratify()
        .id(function(d) { return d.id; })
        .parentId(function(d) {
            if(d.ParentGame) {

                return treeData[d.ParentGame].id;
            }
        })
        (treeData);

    var tree_svg_height = d3.select("#tree_svg").node().getBoundingClientRect().height * 0.65;
    var tree_svg_width = d3.select("#tree_svg").node().getBoundingClientRect().width  *.65;

    d3.select("#tree_svg").select("g").attr("transform","translate(70,30)");
    var tree_layout = d3.tree()
        .size([tree_svg_height, tree_svg_width]);

    var nodes = tree_layout(root);


    var paths = d3.select("#tree").selectAll("path").data(nodes.descendants().slice(1))
        .enter().append("path")
        .attr("class","link");


    paths.attr("d", function(d) {
        return "M" + d.y + "," + d.x
            + "C" + (d.y + d.parent.y) / 2 + "," + d.x
            + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
            + " " + d.parent.y + "," + d.parent.x;

    });

    console.log(nodes.descendants());

    var tree_nodes = d3.select("#tree").selectAll("g")
        .data(nodes.descendants());
    tree_nodes = tree_nodes
        .enter()
        .append("g")
        .attr("class","node");

    tree_nodes.append("circle")
        .attr("r",8)
        .attr("cx",function(d){
                return d.y;
        })
        .attr("cy",function(d){
            return d.x;
        })
        .style("fill", function(d){

            if (d.data.Wins == 1){
                return colors[1];
            }
            else{
                return colors[0];
            }
        });

    tree_nodes
        .append("text")
        .attr("x", function(d) {
            return d.y;
        })
        .attr("y", function(d) {
            return d.x;
        })
        .attr("dy",5)
        .attr("dx",function(d){
            return d.children ? -10 : 10;
        })
        .style("text-anchor", function(d) {
            return d.children ? "end" : "start";
        })
        .text(function(d) {
            return d.data.Team;
        });


};

/**
 * Updates the highlighting in the tree based on the selected team.
 * Highlights the appropriate team nodes and labels.
 *
 * @param team a string specifying which team was selected in the table.
 */

function updateTree(row) {

    // ******* TODO: PART VII ****

    d3.select("#tree")
        .selectAll("text")
        .filter(function(d){
            if(row.value.type == 'game') {
                var label = false;
                if ((d.id.match(row.key+"*") && row.value.Opponent.match(d.data.Opponent)) || (row.key.match(d.data.Opponent) && row.value.Opponent.match(d.data.Team)))
                    label = true;
                return label;
            }else
                return row.key == d.data.Team;
        })
        .classed("selectedLabel",true);

    d3.selectAll(".link")
        .filter(function(d){
            var link = false;
            if(row.value.type == 'game') {
                if ((d.id.match(row.key+"*") && row.value.Opponent.match(d.data.Opponent)) || (row.key.match(d.data.Opponent) && row.value.Opponent.match(d.data.Team)))
                    link = true;
                return link;
            }else{
                if(row.key == d.data.Team  && d.data.Wins == 1)
                    link = true;
                return link;
            }

        })
        .classed("selected",true);
}





/**
 * Removes all highlighting from the tree.
 */
function clearTree() {
    // ******* TODO: PART VII *******
    d3.selectAll(".selected").classed("selected",false);
    d3.selectAll(".selectedLabel").classed("selectedLabel",false);
    

}

