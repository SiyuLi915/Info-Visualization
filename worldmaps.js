

// Set tooltips
var format = d3.format(",");
var populationById ={};
var statepopById = {};
var usa;
var states;
var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return populationById[d.properties.name] === undefined ?
              "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Count: </strong><span class='details'>" + "0" +"</span>" :
              "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Count: </strong><span class='details'>" + format(populationById[d.properties.name]) +"</span>";
            })
var tip2 = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return statepopById[d.properties.name] === undefined ?
              "<strong>State: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Count: </strong><span class='details'>" + "0" +"</span>" :
              "<strong>State: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Count: </strong><span class='details'>" + format(statepopById[d.properties.name]) +"</span>";
            })
active = d3.select(null);

tip.direction(function(d) {
  if (d.properties.name === 'Antarctica') return 'n';
  // Americas
  if (d.properties.name === 'Greenland') return 's';
  if (d.properties.name === 'Canada') return 'e';
  if (d.properties.name === 'USA') return 'e';
  if (d.properties.name === 'Mexico') return 'e';
  // Europe
  if (d.properties.name === 'Iceland') return 's';
  if (d.properties.name === 'Norway') return 'w';
  if (d.properties.name === 'Sweden') return 's';
  if (d.properties.name === 'Finland') return 's';
  if (d.properties.name === 'Russia') return 's';
  // Asia
  if (d.properties.name === 'China') return 'w';
  if (d.properties.name === 'Japan') return 's';
  // Oceania
  if (d.properties.name === 'Indonesia') return 'w';
  if (d.properties.name === 'Papua New Guinea') return 'w';
  if (d.properties.name === 'Australia') return 'w';
  if (d.properties.name === 'New Zealand') return 'w';
  // otherwise if not specified
  return 'n';
})

var margin = {top: 20, right: 20, bottom: 20, left: 30},
            width = 1200 - margin.left - margin.right,
            height = 750 - margin.top - margin.bottom;

var color = d3.scaleThreshold()
    .domain([0,2,6,12,25,40,50,70,150,1000])
    .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);
var color2 = d3.scaleLinear().domain([1,90])
          .range(["#7FDBFF", "#001f3f"]);
console.log(color2);

var path = d3.geoPath();

var svg = d3
            .select(worldmap)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append('g')
            .attr('class', 'map');



var projection = d3.geoMercator()
                   .scale(150)
                  .translate( [width / 2, height / 1.5]);

var path = d3.geoPath().projection(projection);

svg.call(tip);
svg.call(tip2);

queue()
    .defer(d3.json, "combined2.json")
    .defer(d3.csv, "data.csv")
    .await(ready);

function ready(error, data, countries_data) {

  var country_data = d3.nest()
                      .key(function(d) {

                        return d.Country;
                      })
                      .rollup(function(v){
                        return v.length;
                      })
                      .entries(countries_data);
  var location_data = d3.nest()
                      .key(function(d) {
                        return d.Country;
                      })
                      .key(function(d){
                        return d.Location.substr((d.Location.length - 2));
                      })
                      .rollup(function(v){
                        return v.length;
                      })
                      .entries(countries_data);

 country_data.forEach(function(d){populationById[d.key] = +d.value});
 console.log(location_data[0].values)
 var state_data = location_data[0].values;
 //topojson.feature(data, data.objects.countries).features.forEach(function(d){populationById[d.properties.name] === undefined ? d.population = 0 : d.population = populationById[d.properties.name] });
state_data.forEach(function(d){statepopById[(d.key).substr((d.key).length - 2)] = +d.value});
console.log(statepopById);
 svg.append("rect")
                 .attr("class", "background")
                 .attr("width", width)
                 .attr("height", height)
                 .on("click", reset);

 svg.append("g")
     .attr("class", "countries")
   .selectAll("path")
     .data(topojson.feature(data, data.objects.countries).features)
   .enter().append("path")
     .attr("d", path)
     .attr("id", function(d) { return d.id;})
     .style("fill", function(d) {
       // console.log(d.properties.name + ": " + populationById[d.properties.name])
       return populationById[d.properties.name] === undefined ? "rgb(247,251,255)" : color(populationById[d.properties.name]); })
     .style('stroke', 'white')
     .style('stroke-width', 1.5)
     .style("opacity",0.8)
     // tooltips
       .style("stroke","white")
       .style('stroke-width', 0.3)
       .on('mouseover',function(d){
         tip.show(d);

         d3.select(this)
           .style("opacity", 1)
           .style("stroke","white")
           .style("stroke-width",3);
       })
       .on('mouseout', function(d){
         tip.hide(d);

         d3.select(this)
           .style("opacity", 0.8)
           .style("stroke","white")
           .style("stroke-width",0.3);
       })
       .on('click',clicked);

  usa = d3.select('#USA');
  var worlds = svg.selectAll('path');
  console.log(worlds);
     svg.append("g")
       .attr("class", "state")
     .selectAll("path")
       .data(topojson.feature(data, data.objects.states).features)
     .enter().append("path")
       .attr("d", path)
       .attr("name", function(d) { return d.properties.name;})
      .attr("id", function(d) { return d.id;})
       .style("fill", function(d) {
         // console.log(d.properties.name + ": " + populationById[d.properties.name])
         return statepopById[d.properties.name] === undefined ? "rgb(247,251,255)" : color2(statepopById[d.properties.name]); })
       .style('stroke', 'white')
       .style('stroke-width', 1.5)
       .style("opacity",0.8)
       // tooltips
         .style("stroke","white")
         .style('stroke-width', 0.3)
         .on('mouseover',function(d){
          tip2.show(d);
           d3.select(this)
             .style("opacity", 1)
             .style("stroke","white")
             .style("stroke-width",3);
         })
         .on('mouseout', function(d){
          tip2.hide(d);

           d3.select(this)
             .style("opacity", 0.8)
             .style("stroke","white")
             .style("stroke-width",0.3);
         })
  var s = 1;
  states = d3.selectAll('.state')
          .classed('hidden',true);
  function clicked(d) {
       if (active.node() === this) return reset();

       if (d.properties.name === "United States") {

         active = d3.select(this).classed("active", true);

         var bounds = path.bounds(d),
             dx = bounds[1][0] - bounds[0][0],
             dy = bounds[1][1] - bounds[0][1],
             x = (bounds[0][0] + bounds[1][0]) / 2.0,
             y = (bounds[0][1] + bounds[1][1]) / 1.75,
             scale = 1.9 / Math.max(dx / width, dy / height),
             translate = [width / 2 - scale * x, height / 2 - scale * y];

             worlds.classed('hidden',true);
             usa.classed('hidden',true);
             states.classed('hidden',false);
             active.classed("active", false);

        d3.select('#worlddescription')
        .transition()
            .duration(300)
          .style("opacity","0");

        d3.select('#worlddescription')
          .transition()
          .delay(300)
          .text("Since, it overwhelmingly outnumbered the other countries, we can breakdown the accidents into states region in the U.S. According to the US map, we can see that California have the most accidents and then Florida, Texas, New York, Illinois are coming after. Most states in the center U.S did not have many accidents happened with only several cases. ");
        d3.select('#worlddescription')
          .transition()
          .delay(300)
              .duration(300)
            .style("opacity","1")

         svg.transition()
             .duration(750)
             .style("stroke-width", 1.5 / scale + "px")
             .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

           }



     }

     function reset() {
       active.classed("active", false);
       active = d3.select(null);
       d3.select('#worlddescription')
       .transition()
           .duration(300)
         .style("opacity","0");
       d3.select('#worlddescription')
       .transition()
       .delay(300)
         .text("The map above represents the amount of total aircraft incident happened and how they are distributed around the world. The deeper the color, the more incidents happened in a certain country. From this graph, we can see that the U.S. contributes the most to the flight accidents in the world with a total number of 1036 cases. ");
       d3.select('#worlddescription')
         .transition()
             .delay(300)
           .style("opacity","1")
       svg.transition()
           .duration(750)
           .style("stroke-width", "1.5px")
           .attr("transform", "");
      usa
         .classed('hidden',false);
      states
         .classed('hidden',true);
      worlds
         .classed('hidden',false);

     }

  svg.append("path")
      .datum(topojson.mesh(data, data.objects.countries, function(a, b) { return a.id!== b.id; }))
       // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
      .attr("class", "names")
      .attr("d", path);
}
