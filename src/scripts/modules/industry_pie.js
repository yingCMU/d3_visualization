import { label_transform, show_grid, create_grid } from "./transparency_grid_module.js";
function load_industry_pie(data) {
    const start_year = 1950;
    const latest_year = 2016;
    const label_height = 30
    const label_width = 30;
    const industry_label_color = 'white';
    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
    const num_of_layers = latest_year - start_year;
    const margin = 40




    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin

    // append the svg object to the div called 'id_industry_pie'
    var svg = d3.select("#id_industry_pie")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr('id', 'id_g_pie')
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

    var industry_index = {
        "Service": 0,
        "Farming_Agriculture": 1,
        "Manufacturing": 2
    }
    // Create dummy data
    var data = {
        "Service": 25,
        "Farming_Agriculture": 25,
        "Manufacturing": 25
    };

    // set the color scale
    var color = d3.scaleOrdinal()
        .domain(Object.keys(data))
        .range(d3.schemeDark2);

    // Compute the position of each group on the pie:
    var pie = d3.pie()
        .sort(null) // Do not sort group by size
        .value(function (d) { return d.value; })
    var data_ready = pie(d3.entries(data))

    var arcLabel = d3.arc().innerRadius(radius).outerRadius(radius);

    // Another arc that won't be drawn. Just for labels positioning
    var outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    // The arc generator
    for (var i = 0; i < num_of_layers; ++i) {
        if (!(i == 0))
            // if(!(i%10==0 || i==0))
            continue
        var arc = d3.arc()
            // .innerRadius(radius * (1.0 - (i + 1) * 1 / num_of_layers))         // This is the size of the donut hole
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
            pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
            // return 'translate(' + pos + ')';
            return `translate(${arcLabel.centroid(d)})`
        })
        .style('fill', industry_label_color)
        .style('font', "bold 30px arial,serif")
        .style('text-anchor', function (d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
        })


    var memorize_label_count_per_year = {
        "Service": {},
        "Farming_Agriculture": {},
        "Manufacturing": {}
    }
    var estimating_labels_per_industry_per_year = 9;
    var label_angle_gap_to_avoid_overlapping = Math.PI / Object.keys(memorize_label_count_per_year).length / estimating_labels_per_industry_per_year;
    // var label_svg = d3.select("#id_labels")
    //     .append("svg")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .append("g")
    //     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    var transform_values = {}
    var tooltip = d3.select("body").append("div")
        .attr("class", "venntooltip")
        .attr("id", "id_tooltip")
    d3.select("#id_g_pie")
    .selectAll("path")
        .data(label_data)
        .enter()
        .append("path")
        .attr("d", function(d) {
            var year = parseInt(d.Year)
            var angles = get_arch_angles_from_pie(data_ready,industry_index, d)
            var label_png_arc = d3.arc()
                .innerRadius(radius / num_of_layers * (year - start_year))         // This is the size of the donut hole
                .outerRadius(radius / num_of_layers * (year - start_year))
                .startAngle(angles[0])
                .endAngle(angles[1]);
            return label_png_arc()
        })
        .attr("id", function (d) {
            return "id_arch_" + d.Row;
        }).attr("stroke",function (d) {
            return color(d.Row);
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

            // highlight the current path
            console.log('what is this', this)
            debugger
            var selection = d3.select(this).transition("tooltip").duration(400);
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

function get_arch_angles_from_pie(data_ready,industry_index,d) {
    var all_industries = d.Industry.split(',')
    if(all_industries.length ==1) {
        var industry = name_dict[all_industries[0]];
        var industry_pie_params = data_ready[industry_index[industry]]
        return [industry_pie_params.startAngle, industry_pie_params.endAngle]
    }
    if(all_industries.length ==3) {
        return [0, 2* Math.PI]
    } else {
        if(industry_index[name_dict[all_industries[0]]] + industry_index[name_dict[all_industries[1]]] == 2) {
            return [data_ready[2].startAngle - 2* Math.PI,data_ready[0].endAngle]
        } else if(industry_index[name_dict[all_industries[0]]] + industry_index[name_dict[all_industries[1]]] == 1) {
            return [data_ready[0].startAngle,data_ready[1].endAngle]
        }
        else {
            return [data_ready[1].startAngle,data_ready[2].endAngle]
        }
    }

}
function show_pie(opacity, label_opacity, transition_time, industry_pie_transform_values) {
    d3.selectAll('#id_g_pie').raise().transition().duration(transition_time).style("opacity", opacity);
    d3.selectAll('#id_pie_text').raise().transition().duration(transition_time).style("opacity", label_opacity);
    if (opacity > 0) {
        for (const [row, transform_value] of Object.entries(industry_pie_transform_values)) {
            pie_label_transform(transition_time, row, transform_value)
        }
    }
    else {
        // d3.select("#id_g_pie")
        // .transition().duration(transition_time).style("opacity", opacity).remove();
        // d3.select("#id_pie_text")
        // .transition().duration(transition_time).style("opacity", opacity).remove();
    }
}
function pie_label_transform(transition_time, label_row_number, transform_value) {
    var svg_label = d3.select("#id_label_" + label_row_number).raise()
        .attr("x", 0)
        .attr("y", 0)
        .transition()
        .duration(transition_time * 3)
        .attr("transform", transform_value)
    //  .style("left",block_width).style("top",0)
}
function show_venn(opacity, transition_time) {
    var svg = d3.select("#id_industry_pie")
        .select("svg")
        .select("#id_g_venn")
        .transition().duration(transition_time).style("opacity", opacity);

}
export { load_industry_pie, show_pie };
