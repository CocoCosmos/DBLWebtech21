let reader = new FileReader();

function loadFile() {
    const file = document.querySelector('input[type=file]').files[0];
    reader.addEventListener("load", parseFile, false);
    if (file) {
        reader.readAsText(file);
    }
}

function parseFile(){
    let doesColumnExist = false;
    const data = d3.csv.parse(reader.result, function(d){
        doesColumnExist = d.hasOwnProperty("area");

        return d;
    });
    fileInfo(data)
    createTable(data);
    createHeatMap(data);
    createAdjacency(data);
    createLineGraph(data);
    //createLineChart(data);
    createPieGraph(data);

    //createNegativity(data);
    //createUniqueGraph(data); unfinished
    
}

function createTable(data) {

    //The columns, say "keys" to display them
    const keys = d3.keys(data[0]);

    //The rows,
    const stats = d3.select("#stats")
        .html("")

    let sortAscending = true;

    stats.append("div")
        .text("Columns: " + keys.length)

    stats.append("div")
        .text("Rows: " + data.length)

    //the making of the table.
    d3.select("#table")
        .html("")
        .append("tr")
        .attr("class","fixed")
        .selectAll("th")
        .data(keys)
        .enter().append("th")
        .text(function(d) { return d; });


    d3.select("#table")
        .selectAll("tr.row")
        .data(data)
        .enter().append("tr")
        .attr("class", "row")
        .selectAll("td")
        .data(function(d) { return keys.map(function(key) { return d[key] }) ; })
        .enter().append("td")
        .text(function(d) { return d; })


    //Sorting the table
    d3.selectAll("#table")
        .selectAll("tr.row")
        .data(data)
        .sort(function(a, b) {
                // CHANGE date TO WHAT YOU WANT TO BE SORTED!!!!!
                //Works both with alphabet and numbers
                return d3.descending(a.date, b.date);
        })
        .enter().append("tr")
        .attr("class", "row")
        .selectAll("td")
        .data(function(d) { return keys.map(function(key) { return d[key] }) ; })
        .enter().append("td")
        .text(function(d) { return d; })
}




function createHeatMap(data) {

    // Using the standard Size thing from JS does anyone know how to convert this to scale to the size of the boxes>?
    var margin = {top: 80, right: 25, bottom: 30, left: 40},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;


    //Printing the field, still using the margin set above.
    var svg = d3.select("#heatMap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "white")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // There is an easier way to do this by using d.fromJobTitle and taking the keys, but then it has to be sorted to make sure they are in the same order.
        // So I believe this is faster.
        var fromTitle = ["Unknown", "Employee", "Trader", "In House Lawyer", "Manager", "Managing Director", "Director", "Vice President", "President", "CEO"]
        var toTitle = ["Unknown", "Employee", "Trader", "In House Lawyer", "Manager", "Managing Director", "Director", "Vice President", "President", "CEO"]

    //This is to make the x- axis and to make the grid layout scalable But does not work
    var xAxis = d3.scaleBand()
        .range([ 0, width ])
        .domain(fromTitle)
        .padding(0.03);

    //This is to make the y- axis and to make the grid layout scalable But does not work
        var yAxis = d3.scaleBand()
            .range([ height, 0 ])
            .domain(toTitle)
            .padding(0.03);


        //To colour in the heatmap, can someb
        var ColourHM = d3.scaleLinear()
            .range(["#0041ff", "#ffffff", "#ffbe00", "#ff0000"])
            .domain([-0.07, -0.03, 0.03, 0.07])

        // For When the mouse goes on a square
        var mouseHover = d3.select("#heatMap")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")

            .style("background-color", "#b6b6b6")
            .style("border", "solid")
            .style("border-width", "3px")
            .style("border-radius", "20px")
            .style("padding", "10px")
            .style("width", "300px")


        //When the mouse is over the square.
        var mouseOnSquare = function(d) {
            mouseHover
                .style("opacity", 1)
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }


        //Putting the text down
        var textDisplay = function(d) {
            mouseHover
                //d3.mean(data.filter(d => d.fromJobtitle === "Employee"), (d => d.toJobtitle === "Employee"),d => d.sentiment)
                .html( "[" + d.fromJobtitle+" : "+ d.toJobtitle + "]  "+"  value: " + d.sentiment +  "  mean: "
                    + d3.mean(data.filter(d => d.fromJobtitle === d.fromJobtitle,
                    d.toJobtitle === d.toJobtitle),
                        d => d.sentiment))
        }


        //Return it to the original form what it was before mouse hover
        var mouseOffSquare = function(d) {
            mouseHover
                .style("opacity", 0)
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
        }

// A title for the visualization, maybe do this for all vis?
    svg.append("text")
        .style("font-size", "24px")
        .style("font-family", "Verdana")
        .text("Sentiment Heatmap");

        //Adding the squares
        svg.selectAll()
            .data(data, function(d) {
                return d.fromJobtitle+':'+d.toJobtitle;
            })
            .enter()

            .append("rect")
            .attr("x", function(d) {
                return xAxis(d.fromJobtitle)
            })
            .attr("y", function(d) {
                return yAxis(d.toJobtitle)
            })

            .attr("rx", 8)
            .attr("ry", 8)

            .style("stroke-width", 3)
            .style("opacity", 0.9)

            .attr("width", xAxis.bandwidth() )
            .attr("height", yAxis.bandwidth() )

            //Using the colour heatmap function made earlier to give the squares "heat"
            .style("fill", function(d) {
                return ColourHM(d.sentiment)
            })

            //d3 built in mouse interactivity stuff
            .on("mouseover", mouseOnSquare)
            .on("mousemove", textDisplay)
            .on("mouseleave", mouseOffSquare);
}

/*
function createLineChart(data) {
    var parsedDates = Date.parse(data[0]);
    console.log(data[0]);

    var parsedDates = Date.parse(data[0]);
    console.log(data[0].match(\b\d{2}\b));

    var parseTime = d3.timeParse("%Y, %B, %d");
    console.log(parseTime);

    var sentimentAvg = d3.mean(data, function(d) { return d.sentiment; });
    console.log(sentimentAvg);

    var meanJan = d3.mean(data.filter(d => d.data === "01"), d => d.sentiment);
    console.log(meanJan);
}
*/


/*
function createUniqueGraph(data) {//https://observablehq.com/@d3/force-directed-graph

    // Using the standard Size thing from JS does anyone know how to convert this to scale to the size of the boxes>?
    var margin = {top: 80, right: 25, bottom: 30, left: 40},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;


    const links = d3.csv("enron-clean.csv", function(data) {

    });

    const nodes;

    //const links = data.links.map(d => Object.create(d));
    /!*
    All examples I found use a json where the "links" is formatted like:
    {"source": "Name", "target": "Name2", "value" : n}
    In our case this would be
    {"fromId": "n", "toId": m, "sentiment": "o"}. Idk how to do the d3.csv.parse stuff tho
    *!/
    //const nodes = data.nodes.map(d => Object.create(d));
    /!*
    Same as above, in this case
    {"id": "Name", "group": n}
    For us
    {"fromId": "n", "jobTitle": "fromJobtitle"}
    The group given here is used for the coloring
    *!/

    const simulation = d3.forceSimulation(nodes)
        /!*.force("link", d3.forceLink(links).id(d => d.id))
        this force pushes linked elements a fixed distance apart, but it requires an *array*
        of links with a source and a target element (see above).

        It is *necessary* for the force-link diagram.
        *!/
        .force("charge", d3.forceManyBody()) //creates a repelling force between nodes
        .force("center", d3.forceCenter(width / 2, height / 2)); //sets the center of the forces to the center of the visualization

    var svg = d3.select("#heatMap")
        .attr("viewBox", [0,0, width, height]);

    const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)//links, see above
        .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value))/!* in the example this value is already set in the json,
                but in our case could be absolute value of sentiment, or freq. of interactions (calculating this
                second one seems complicated)
                *!/

    const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)//romId, see fabove
        .join("circle")
            .attr("r", 5)
            .attr("fill", color)

    node.append("title")
        .text(d => d.fromId);

    simulation.on("tick", () => {//the simulation refreshes every tick, same principle as clock circuits from 2IC30
        link
            .attr("x1", d => d.source.x)//fromId
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)//toId
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    invalidation.then(() => simulation.stop());

    var scale = d3.scaleOrdinal(d3.schemeTableau10);
    var color = scale(d.fromJobtitle);//job title isn't a number tho so this would raise an error


// A title for the visualization, maybe do this for all vis?
    svg.append("text")
        .style("font-size", "24px")
        .style("font-family", "Verdana")
        .text("Sentiment Heatmap");

        //Adding the squares
        svg.selectAll()
            .data(data, function(d) {
                return d.fromJobtitle+':'+d.toJobtitle;
            })
            .enter()

            .append("rect")
            .attr("x", function(d) {
                return xAxis(d.fromJobtitle)
            })
            .attr("y", function(d) {
                return yAxis(d.toJobtitle)
            })

            .attr("rx", 8)
            .attr("ry", 8)

            .style("stroke-width", 3)
            .style("opacity", 0.9)

            .attr("width", xAxis.bandwidth() )
            .attr("height", yAxis.bandwidth() )

            //Using the colour heatmap function made earlier to give the squares "heat"
            .style("fill", function(d) {
                return ColourHM(d.sentiment)
            })

            //d3 built in mouse interactivity stuff
            .on("mouseover", mouseOnSquare)
            .on("mousemove", textDisplay)
            .on("mouseleave", mouseOffSquare);
}
*/

function createAdjacency(data) {


    // Using the standard Size thing from JS does anyone know how to convert this to scale to the size of the boxes>?
    var margin = {top: 80, right: 25, bottom: 30, left: 40},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;


    //Printing the field, still using the margin set above.
    var svg = d3.select("#Uniqueness")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "white")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // There is an easier way to do this by using d.fromJobTitle and taking the keys, but then it has to be sorted to make sure they are in the same order.
    // So I believe this is faster.
    var fromTitle = d3.map(data, function(d){return d.fromEmail;}).keys()
    var toTitle = d3.map(data, function(d){return d.toEmail;}).keys()

    //This is to make the x- axis and to make the grid layout scalable But does not work
    var xAxis = d3.scaleBand()
        .range([ 0, width ])
        .domain(fromTitle)
        .padding(0.03);

    //This is to make the y- axis and to make the grid layout scalable But does not work
    var yAxis = d3.scaleBand()
        .range([ height, 0 ])
        .domain(toTitle)
        .padding(0.03);


    //To colour in the heatmap, can someb
    var ColourHM = d3.scaleLinear()
        .range(["#d2d2d2", "#000aff", "#ff7400", "#ff0000"])
        .domain([0, 4, 5, 8])

    // For When the mouse goes on a square
    var mouseHover = d3.select("#Uniqueness")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")

        .style("background-color", "#b6b6b6")
        .style("border", "solid")
        .style("border-width", "3px")
        .style("border-radius", "20px")
        .style("padding", "10px")
        .style("width", "300px")


    //When the mouse is over the square.
    var mouseOnSquare = function(d) {
        mouseHover
            .style("opacity", 1)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }


    //Putting the text down
    var textDisplay = function(d) {
        mouseHover
            .html( "[" + d.fromEmail+" : "+ d.toEmail + "]  "+"  amount: " + Math.round(d.sentiment*100));
    }


    //Return it to the original form what it was before mouse hover
    var mouseOffSquare = function(d) {
        mouseHover
            .style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

// A title for the visualization, maybe do this for all vis?
    svg.append("text")
        .style("font-size", "24px")
        .style("font-family", "Verdana")
        .text("Emails sent between adresses.");


    //Adding the squares
    svg.selectAll()
        .data(data, function(d) {
            return d.fromEmail+':'+d.toEmail;
        })
        .enter()

        .append("rect")
        .attr("x", function(d) {
            return xAxis(d.fromEmail)
        })
        .attr("y", function(d) {
            return yAxis(d.toEmail)
        })

        .attr("rx", 1)
        .attr("ry", 1)


        .style("stroke-width", 1)
        .style("opacity", 0.9)

        .attr("width", xAxis.bandwidth() )
        .attr("height", yAxis.bandwidth() )

        //Using the colour heatmap function made earlier to give the squares "heat"
        .style("fill", function(d) {
            return ColourHM(Math.abs(Math.round(d.sentiment*100)))
        })



        //d3 built in mouse interactivity stuff
        .on("mouseover", mouseOnSquare)
        .on("mousemove", textDisplay)
        .on("mouseleave", mouseOffSquare);
}

function fileInfo(data){
   //Does not work for some reason?
    if (d3.keys(data[0]) == ["date", "fromId", "fromEmail", "fromJobtitle", "toId", "toEmail", "toJobtitle", "messageType", "sentiment"] ) {

        var svg = d3.select("#box3")
        svg.append("text")
            .text("The file is in the correct format." + d3.keys(data[0]));
    } else {
        console.log(d3.keys(data[0]) )
        console.log(["date", "fromId", "fromEmail", "fromJobtitle", "toId", "toEmail", "toJobtitle", "messageType", "sentiment"])
        var svg = d3.select("#box3")
        svg.append("text")
            .text("ERROR!! The file is not the correct format, this might cause issues!.");
    }

}


function createLineGraph(data) {


    // Using the standard Size thing from JS does anyone know how to convert this to scale to the size of the boxes>?
    var margin = {top: 80, right: 25, bottom: 30, left: 40},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;


    //Printing the field, still using the margin set above.
    var svg = d3.select("#LineGraph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "white")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var parseDate = d3.timeParse("%Y-%m-%d");
    var formatMonth = d3.timeFormat("%B")
    d3.csv("enron-v1.csv") // does NOT work with 'data' only manually filling in the csv file
        .row(function(d) {return {date:parseDate(d.date),sentiment:Number(d.sentiment)};})
        // When changed to 'date:formatMonth(d.date)', the graph shows just a vertical line

        /*
        .sort(function(a, b) {
            return d3.descending(a.date, b.date);
        })
        */
        //This sort function does not work, why?

        .get(function(error,data){
            console.log(data)


            var maxDate = d3.max(data, function(d) { return d.date;});
            var minDate = d3.min(data, function(d) { return d.date;});
            console.log(maxDate, minDate);
            //^ console prints <empty string> <empty string> so probably this does not work. When changed to parseDate(d.date), console prints undefined
            var maxSentiment = d3.max(data, function(d) { return d.sentiment;});


            var y = d3.scaleLinear()
                    .domain([minSentiment,maxSentiment])
                    .range([height,0]);
            var x = d3.scaleTime()
                    .domain([minDate, maxDate])
                    .range([0, width]);
            var yAxis = d3.axisLeft(y);
            var xAxis = d3.axisBottom(x);
            svg.append('svg')
                .attr('height','100%')
                .attr('width','100%');
            var chartGroup = svg.append('g')
                .attr('transform','translate(50%,50%)');
            var line = d3.svg.line()
                .x(function(d){ return x(d.date);})
                .y(function(d){ return y(d.sentiment);});
            chartGroup.append('path').attr('d',line(data));
            chartGroup.append('g').attr('class','x axis').attr('transform','translate(0,'+height+')').call(xAxis);
            chartGroup.append('g').attr('class','y axis').call(yAxis);
            svg.append("text")
                .style("font-size", "24px")
                .style("font-family", "Verdana")
                .text("Line chart");
        });}





function createPieGraph(data) { //https://observablehq.com/@d3/donut-chart
    // dimensions

    var margin = {top: 80, right: 25, bottom: 30, left: 40},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#PieGraph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "white")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var color = d3.scaleOrdinal()
        .domain(data.map(d => d.fromId))
        //using interpolateWarm rather than interpolateSpectral for aesthetic and visibility reasons
        .range(d3.quantize(t => d3.interpolateWarm(t * 0.8 + 0.1), data.length).reverse());

    const radius = Math.min(width, height) / 2;
    const arc =  d3.arc()
        .innerRadius(radius * 0.67)
        .outerRadius(radius - 1);

    var pie = d3.pie()
        .padAngle(0.005) //very slight angle for visibility, perhaps this is an issue when scaling?
        .sort(null)
        .value(d => d.sentiment);//this returns only the first sentiment (i expect), need to figure out how to return the mean

    const arcs = pie(data);
    
    //printing the field
    var svg = d3.select('#PieGraph')
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "white")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.selectAll("path")
    .data(arcs)
    .join("path")
        .attr("fill", d => color(d.data.fromId))//dont think this syntax checks out
        .attr("d", arc)
    .append("title")
        .text(d => `${d.data.fromId}: ${d.data.sentiment.toLocaleString()}`);//dont know how to make this the mean

    svg.append("g")
        .attr("font-family", "Verdana")
        .attr("font-size", "12")
        .attr("text-anchor", "middle")//this makes the text appear in center of arc
    .selectAll("text")
    .data(arcs)
    .join("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text(d => d.data.fromId))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data.sentiment.toLocaleString()));
        
}