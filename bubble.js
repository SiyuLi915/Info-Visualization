
var graph = document.getElementById('graph');
var margin1 = {top: 10, right: 0, bottom: 20, left: 130}
var width1 = 1000 - margin1.left - margin1.right;
var height1 = 600 - margin1.top - margin1.bottom;
var format = d3.format(",");
var injuries = {};
var tip1 = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              if (injuries[d.key] !== undefined ){
              return "<strong>Boarding Phase: </strong><span class='details'>" + d.key + "<br></span>" + "<strong>Count: </strong><span class='details'>" + format(injuries[d.key]) +"</span>";
            }
            })
var svg1 = d3.select(bubble)
    .append('svg')
    .attr('width', (width1+margin1.left+margin1.right)*2)
    .attr('height', height1+margin1.top+margin1.bottom)
    .attr("transform", "translate(" + margin1.left + "," + margin1.top+ ")");

    var pack = d3.pack()
        .size([width1-150, height1])
        .padding(1.5);


svg1.call(tip1);
d3.csv("data.csv", function(d){
  var parse1 = d3.timeParse("%m/%d/%y");
  var parse2 = d3.timeParse("%Y/%m/%d");
  var format_month =  d3.timeFormat("%B");
  var format_day =  d3.timeFormat("%A");
  if(d.Event_Date[1] == '/' || d.Event_Date[2] == '/') {
      d.Date_test = parse1(d.Event_Date);
  } else {
      d.Date_test = parse2(d.Event_Date);
  }
  // Read data from csv
  return {
      Accident_Number : d.Accident_Number,
      Event_Date : d.Event_Date,
      Year : d.Date_test.getFullYear(),
      Month : format_month(d.Date_test),
      Day : format_day(d.Date_test),
      Month_num : d.Date_test.getMonth(),
      Day_num : d.Date_test.getDay(),
      Location : d.Location,
      Country : d.Country,
      Latitude : +d.Latitude,
      Longitude : +d.Longitude,
      Airport_Code : d.Airport_Code,
      Airport_Name : d.Airport_Name,
      Injury_Severity : d.Injury_Severity,
      Aircraft_Damage : d.Aircraft_Damage,
      Registration_Number : d.Registration_Number,
      Make : d.Make,
      Model : d.Model,
      Schedule : d.Schedule,
      Air_Carrier : d.Air_Carrier,
      Total_Fatal_Injuries : +d.Total_Fatal_Injuries,
      Total_Serious_Injuries : +d.Total_Serious_Injuries,
      Total_Uninjured : +d.Total_Uninjured,
      Weather_Condition : d.Weather_Condition,
      Broad_Phase_of_Flight : d.Broad_Phase_of_Flight
    };
}, function(error, data) {
  var injuries_count1 = d3.nest()
                        .key(function(d){

                          return d.Broad_Phase_of_Flight;

                        })
                        .rollup(function(v){
                          return v.length;
                        })
                        .entries(data);

  var injuries_count = injuries_count1.filter(function(d){
    return d.key != "";
  })

  injuries_count.forEach(function(d) {injuries[d.key] = d.value});
console.log(injuries_count);
  var color = d3.scaleOrdinal(d3.schemeCategory20)
  var root = d3.hierarchy({children: injuries_count})
    .sum(function(d) { return d.value; })

    var node = svg1.selectAll(".node")
      .data(pack(root).descendants())
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x  + "," + d.y + ")"; });
        console.log(node);
    // var node = nodes.filter(function(d) {
    //   return d.data.key!=undefined;
    // })
    node.append("circle")
    .attr("id", function(d) { return d.id; })
      .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return d.data.key === undefined ? "#AAAAAA" :color(d.data.key); })
        .on("mouseover", function(d) {
          if(d.data.key !== undefined){
        tip1.show(d.data);
        d3.select(this)
          .style("opacity", 0.8)
          .style("stroke","white")
          .style("stroke-width",3);
      }

})
.on("mouseout", function(d) {
      tip1.hide(d.data);
      d3.select(this)
        .style("opacity", 1)
        .style("stroke","white")
        .style("stroke-width",0.3);
  }) ;

  node.append("text")
  .attr("text-anchor","middle")
  .attr("font-family", "sans-serif")
  .attr("transform", function(d) { return "translate(" + 0  + "," + 5 + ")"; })
     .text(function(d) {
    if (d.data.value > 90){
      return d.data.key;
    }
    return "";});


  var legend = svg1.selectAll(".legend")
  .data(injuries_count).enter()
  .append("g")
  .attr("class","legend")
  .attr("transform", "translate(" + 780 + "," + 120+ ")");


   legend.append("rect")
     .attr("x", 0)
     .attr("y", function(d, i) { return 20 * i; })
     .attr("width", 15)
     .attr("height", 15)
		.style("fill", function(d) { return color(d.key)});


    legend.append("text")
     .attr("x", 25)
    	.attr("text-anchor", "start")
     .attr("dy", "1em")
     .attr("y", function(d, i) { return 20 * i; })
     .text(function(d) {return d.key;})
    .attr("font-size", "12px");


    legend.append("text")
     .attr("x",31)
     .attr("dy", "-.2em")
     .attr("y",-10)
     .attr("font-family", "sans-serif")
     .attr("fill","#001f3f")
     .attr("transform", "translate(" + -33 + "," + 0+ ")")
     .text("Board Phase")
  	.attr("font-size", "17px");
})
