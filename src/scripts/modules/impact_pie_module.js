
function create_impact_pie(row_colors) {
        const start_year = 1950;
        const latest_year = 2016;
        const label_height = 30
        const label_width = 30;
        const impact_label_color = 'white';
        const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
        const num_of_layers = latest_year - start_year;
        const margin = 80

        var radius = Math.min(width, height) / 2 - margin

        // append the svg object to the div called 'id_impact_pie'
        var svg = d3.select("#id_industry_pie")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr('id', 'id_g_pie_impact')
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

        var impact_index = {
            "Environment_Energy": 0,
            "Social": 1,
            "Food_Quality": 2
        }
        // Create dummy data
        var data = {
            "Environment_Energy": 25,
            "Social": 25,
            "Food_Quality": 25
        };
        // Compute the position of each group on the pie:
        var pie = d3.pie()
            .sort(null) // Do not sort group by size
            .value(function (d) { return d.value; })
        var data_ready = pie(d3.entries(data))

        var arcLabel = d3.arc().innerRadius(radius * 1.1).outerRadius(radius * 1.1);

        // Another arc that won't be drawn. Just for labels positioning
        var outerArc = d3.arc()
            .innerRadius(radius * 1.1)
            .outerRadius(radius * 1.1)

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        // The arc generator
        for (var i = 0; i < num_of_layers; ++i) {
            if (!(i == 0))
                continue
            var arc = d3.arc()
                .outerRadius(radius * (1.0 - i * 1 / num_of_layers))
                .innerRadius(i == 0 ? radius * (1.0 - (i + 1) * 1 / num_of_layers) : radius * (1.0 - i * 1 / num_of_layers))
            svg
                .selectAll('allSlices1111')
                .data(data_ready)
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('id', 'pie_id')
                .attr('fill', function (d) {
                    return "white"
                    // return i == 0 ? color(d.data.key) : "white";
                })
                .attr("stroke", "white")
                .style("stroke-width", "1px")
                .style("width", "1px")
                .style("opacity", 0.4);
        }

        svg
            .selectAll('allLabels1')
            .data(data_ready)
            .enter()
            .append('text')
            .attr('id', 'id_pie_text')
            .text(function (d) { console.log(d.data.key); return d.data.key })
            .attr('transform', function (d) {
                var pos = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                debugger
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                // return 'translate(' + pos + ')';
                // return 'translate(' + pos[0] + ',' +pos[1]+')';
                return `translate(${arcLabel.centroid(d)})`
            })
            .style('fill', impact_label_color)

            .style('font', "20px Helvetica Neue")
            .style('text-anchor', function (d) {
                // var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                // return (midangle < Math.PI ? 'start' : 'end')

                if(d.startAngle == 0){
                    return 'start'
                } else if (d.endAngle == 2*Math.PI) {
                    return 'end'
                }
                return "middle"
            })


        var memorize_label_count_per_year = {
            "Environment_Energy": {},
            "Social": {},
            "Food_Quality": {}
        }
        var estimating_labels_per_impact_per_year = 9;
        var transform_values = {}
        var tooltip = d3.select("body").append("div")
            .attr("class", "venntooltip")
            .attr("id", "id_tooltip")
        d3.select("#id_g_pie_impact")
        .selectAll("path")
            .data(label_data)
            .enter()
            .append("path")
            .attr("d", function(d) {
                var year = parseInt(d.Year)
                var angles = get_impact_arch_angles_from_pie(data_ready,impact_index, d)
                var label_png_arc = d3.arc()
                    .innerRadius(radius / num_of_layers * (year - start_year))         // This is the size of the donut hole
                    .outerRadius(radius / num_of_layers * (year - start_year))
                    .startAngle(angles[0])
                    .endAngle(angles[1]);
                return label_png_arc()
            })
            .attr("id", function (d) {
                return "id_impact_arch_" + d.Row;
            }).attr("stroke",function (d) {
                debugger
                return row_colors[d.Row][0]
            }  )//"orange")
            .style("stroke-width", "6px")
            // .style("opacity", function (d) {
            //     return d.Row==34 || d.Row==40 ?1:0;
            // })
            .style("opacity", 0.6)
            .on("mouseover", function (d) {
                // sort all the areas relative to the current item
                // Display a tooltip with the current size
                tooltip.transition().duration(400).style("opacity", .9);
                tooltip.text(d.Name);

                d3.select(this)
                    .style("fill-opacity", .4 )
                    .style("stroke-opacity", 0.6);
            })

            .on("mousemove", function () {
                tooltip.style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })

            .on("mouseout", function (d) {
                tooltip.transition().duration(400).style("opacity", 0);
                var selection = d3.select(this).transition("tooltip").duration(400);
                d3.select(this)
                    .style("fill-opacity",  1)
                    .style("stroke-opacity", 1);
            });

           // var myimage = svg
            // .append('svg:image').raise()
            // .attr('xlink:href', '../data/images/labels/' + label.Row + '.png')
            // .attr('width', label_width)
            // .attr('height', label_height)
            // .attr('id', 'id_label_' + label.Row)
            // .attr('class', 'label_class')
            // .attr('transform',

        return transform_values
}


function get_impact_arch_angles_from_pie(data_ready,impact_index,d) {
    var all_measurement = d.Impact.split(',')
    if(all_measurement.length ==1) {
        var impact = name_dict[all_measurement[0].trim()];
        var impact_pie_params = data_ready[impact_index[impact]]
        return [impact_pie_params.startAngle, impact_pie_params.endAngle]
    }
    if(all_measurement.length ==3) {
        return [0, 2* Math.PI]
    } else {
        if(impact_index[name_dict[all_measurement[0].trim()]] + impact_index[name_dict[all_measurement[1].trim()]] == 2) {
            return [data_ready[2].startAngle - 2* Math.PI,data_ready[0].endAngle]
        } else if(impact_index[name_dict[all_measurement[0].trim()]] + impact_index[name_dict[all_measurement[1].trim()]] == 1) {
            return [data_ready[0].startAngle,data_ready[1].endAngle]
        }
        else {
            return [data_ready[1].startAngle,data_ready[2].endAngle]
        }
    }

}
function show_impact_pie(opacity, transition_time) {
    var svg = d3.select("#id_impact_pie")
        .select("svg")
        .select("#id_g_venn")
        .transition().duration(transition_time).style("opacity", opacity);

}
export { create_impact_pie, show_impact_pie };
