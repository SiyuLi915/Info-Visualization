window.onload = start;

function start() {
    var graph = document.getElementById('graph');
    var margin = {top: 10, right: 20, bottom: 20, left: 25} //25
    var width = 700 - margin.left - margin.right;
    var height = 600 - margin.top - margin.bottom;

    var svg = d3.select(graph)
        .append('svg')
        .attr('width', (width+margin.left+margin.right)*2)
        .attr('height', height+margin.top+margin.bottom)
        .attr("transform", "translate(" + margin.left+ "," + margin.top+ ")");
    svg.append('text')
            .text("Injuries count")
            .attr("font-size", '1.5em')
            .attr('transform','translate(910,20)');
    svg.append('text')
            .text("Incidents count")
            .attr("font-size", '1.5em')
            .attr('transform','translate(260,20)');

    var bars = svg.append('g');
    var bars1 = svg.append('g');
    var bars2 = svg.append('g');
    var bars3 = svg.append('g');

    var yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    d3.csv('data.csv', function(d) {
        // Formating Date
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
        var month_order = ['January', "February", 'March', 'April', 'May',
            'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var delay_v = 25;

        // Build bar chart for injuries
        var injuries_build = function(injuries){
            var xScale = d3.scaleBand().range([width + margin.right+ margin.left, 2*(width - margin.right)]).padding(0.1);
            bars1.selectAll("*").remove();
            bars2.selectAll("*").remove();
            bars3.selectAll("*").remove();
        
            xScale.domain(injuries.map(function(d) {
                return d.key;
            }));
            yScale.domain([0, d3.max(injuries, function(d) {
                return d.value.count_Safe;
            })]).nice();

            var format = d3.format(",");
            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return "<strong>Uninjured Injuries: </strong><span class='details'>" + format(d.value.count_Safe) +"</span>";
                })
            svg.call(tip);
            // Total_Safe
            
            bars1.append('g')
                .selectAll(".bar1")
                .data(injuries)
                .enter()
                .append('rect')
                .attr("class", "bar1")
                .attr("x", function(d) { return xScale(d.key); })
                .attr("y", function(d) { return yScale(d.value.count_Safe); })
                .on("mouseover", function(d){tip.show(d)})
                .on("mouseout", function(d){tip.hide(d);})
                .on("click", function (d) {
                    if(month_order.indexOf(d.key)==-1) {
                        tip.hide(d);
                        delay_v = 50;
                        injuries_build(getTargetYear(d.key));
                        count_build(getTargetYear(d.key));
                    } else {
                        tip.hide(d);
                        delay_v = 25;
                        injuries_build(year_count);
                        count_build(year_count);
                    }
                });
            // Animation for bar1
            bars1.selectAll(".bar1")
                .attr("height", function(d) { return height - margin.bottom - yScale(d.value.count_Safe); })
                .transition().delay(function (d, i) { return i * delay_v; })
                .duration(500)
                .attr("width", xScale.bandwidth());
            // Draw x axis
            bars1.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(xScale));
            // Draw y axis
            bars1.append("g")
                .attr("transform", `translate(${width + margin.right+ margin.left},0)`)
                .call(d3.axisLeft(yScale))
                .call(g => g.select(".domain").remove());
            //.....................................................................................................................
            // Total serious
            var tip2 = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return "<strong>Serious Injuries: </strong><span class='details'>" + format(d.value.count_Serious) +"</span>";
                })
            svg.call(tip2);

            bars2.append('g')
                .selectAll(".bar2")
                .data(injuries)
                .enter()
                .append('rect')
                .attr("class", "bar2")
                .attr("x", function(d) { return xScale(d.key); })
                .attr("y", function(d) { return yScale(d.value.count_Serious)-(height-margin.bottom+2-yScale(d.value.count_Safe)); })
                .on("mouseover", function(d){tip2.show(d)})
                .on("mouseout", function(d){tip2.hide(d);})
                .on("click", function (d) {
                    if(month_order.indexOf(d.key)==-1) {
                        tip2.hide(d);
                        delay_v = 50;
                        injuries_build(getTargetYear(d.key));
                        count_build(getTargetYear(d.key));
                    } else {
                        tip2.hide(d);
                        delay_v = 25;
                        injuries_build(year_count);
                        count_build(year_count);
                    }
                });
            // Animation for bar2
            bars2.selectAll(".bar2")
                .attr("height", function(d) { return height - margin.bottom - yScale(d.value.count_Serious); })
                .transition().delay(function (d, i) { return i * delay_v; })
                .duration(500)
                .attr("width", xScale.bandwidth());

            //..........................................................................................................
            // Total Fatal
            var tip3 = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return "<strong>Fatal Injuries: </strong><span class='details'>" + format(d.value.count_Fatal) +"</span>";
                })
            svg.call(tip3);

            bars3.append('g')
                .selectAll(".bar3")
                .data(injuries)
                .enter()
                .append('rect')
                .attr("class", "bar3")
                .attr("x", function(d) { return xScale(d.key); })
                .attr("y", function(d) { return yScale(d.value.count_Fatal)+yScale(d.value.count_Serious)+yScale(d.value.count_Safe)-2*(height-margin.bottom+2); })
                .on("mouseover", function(d){tip3.show(d);})
                .on("mouseout", function(d){tip3.hide(d);})
                .on("click", function (d) {
                    if(month_order.indexOf(d.key)==-1) {
                        tip3.hide(d);
                        delay_v = 50;
                        injuries_build(getTargetYear(d.key));
                        count_build(getTargetYear(d.key));
                    } else {
                        tip3.hide(d);
                        delay_v = 25;
                        injuries_build(year_count);
                        count_build(year_count);
                    }
                });
            // Animation for bar3
            bars3.selectAll(".bar3")
                .attr("height", function(d) { return height - margin.bottom - yScale(d.value.count_Fatal); })
                .transition().delay(function (d, i) { return i * delay_v; })
                .duration(500)
                .attr("width", xScale.bandwidth());
        }
        // Build bar chart for accident count
        var count_build = function(count){
            var xScale = d3.scaleBand().range([margin.left, width - margin.right]).padding(0.1);
            bars.selectAll("*").remove();

            xScale.domain(count.map(function(d) {
                return d.key;
            }));

            yScale.domain([0, d3.max(count, function(d) {
                return d.value.count_incidents;
            })]).nice();

            var format = d3.format(",");
            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return "<strong>Incidents Count: </strong><span class='details'>" + format(d.value.count_incidents) +"</span>";
                })
            svg.call(tip);

            bars.append('g')
                .selectAll(".bar")
                .data(count)
                .enter()
                .append('rect')
                .attr("class", "bar")
                .attr("x", function(d) { return xScale(d.key); })
                .attr("y", function(d) { return yScale(d.value.count_incidents); })
                .on("mouseover", function(d){tip.show(d)})
                .on("mouseout", function(d){tip.hide(d);})
                .on("click", function (d) {
                    if(month_order.indexOf(d.key)==-1) {
                        tip.hide(d);
                        delay_v = 50;

                        count_build(getTargetYear(d.key));
                        injuries_build(getTargetYear(d.key));
                    } else {
                        tip.hide(d);
                        delay_v = 25;
                        count_build(year_count);
                        injuries_build(year_count);

                    }
                });
            // Animation for bars
            bars.selectAll(".bar")
                .attr("height", function(d) { return height - margin.bottom - yScale(d.value.count_incidents); })
                .transition().delay(function (d, i) { return i * delay_v; })
                .duration(500)
                .attr("width", xScale.bandwidth());
            // Draw x axis
            bars.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(xScale));
            // Draw y axis
            bars.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(yScale))
                .call(g => g.select(".domain").remove());
        }

        // Return monthly data for target year
        function getTargetYear(target_year) {
            var year = d3.nest().key(function(d) {if(d.Year == target_year) return d.Month;})
                .sortKeys(function(a,b) {return month_order.indexOf(a) - month_order.indexOf(b);})
                .rollup(function(v) {
                    var count_Fatal = d3.sum(v, function(d){
                        return d.Total_Fatal_Injuries;
                    })
                    var count_Serious = d3.sum(v, function(d){
                        return d.Total_Serious_Injuries;
                    })
                    var count_Safe = d3.sum(v, function(d){
                        return d.Total_Uninjured;
                    })
                    return {
                        count_incidents : v.length,
                        count_Fatal : count_Fatal,
                        count_Serious : count_Serious,
                        count_Safe : count_Safe
                }; })
                .entries(data);
            year.shift();
            return year;
        }

        // Yearly nested data
        var year_count = d3.nest().key(function(d) {return d.Year;})
            .sortKeys(d3.ascending)
            .rollup(function(v) {
                var count_Fatal = d3.sum(v, function(d){
                    return d.Total_Fatal_Injuries;
                })
                var count_Serious = d3.sum(v, function(d){
                    return d.Total_Serious_Injuries;
                })
                var count_Safe = d3.sum(v, function(d){
                    return d.Total_Uninjured;
                })
                return {
                    count_incidents : v.length,
                    count_Fatal : count_Fatal,
                    count_Serious : count_Serious,
                    count_Safe : count_Safe
            }; })
            .entries(data);
        // UNUSED Monthly nested data
        // var month_count = d3.nest().key(function(d) {return d.Month;})
        //     .sortKeys(function(a,b) {return month_order.indexOf(a) - month_order.indexOf(b);})
        //     .rollup(function(v) {
        //         var count_Fatal = d3.sum(v, function(d){
        //             return d.Total_Fatal_Injuries;
        //         })
        //         var count_Serious = d3.sum(v, function(d){
        //             return d.Total_Serious_Injuries;
        //         })
        //         var count_Safe = d3.sum(v, function(d){
        //             return d.Total_Uninjured;
        //         })
        //         return {
        //             count_incidents : v.length,
        //             count_Fatal : count_Fatal,
        //             count_Serious : count_Serious,
        //             count_Safe : count_Safe
        //     }; })
        //     .entries(data);

        // Draw bar chart
        injuries_build(year_count);
        count_build(year_count);
    });
}
