import { label_transform, show_grid, create_grid } from "./transparency_grid_module.js";

function load_industry_pie(label_data, second_time, row_colors) {
    const start_year = 1950;
    const latest_year = 2016;
    const label_height = 30
    const label_width = 30;
    const industry_label_color = 'white';
    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    width = 0.92 * width
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
    height= 0.92* height
    const num_of_layers = latest_year - start_year;
    const margin = 80


    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin

    // append the svg object to the div called 'id_industry_pie'

    // if(second_time){
    //   debugger
    //   var svg = d3.select("#id_g_pie")
    // } else {
        debugger
      var svg = d3.select("#id_industry_pie")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr('id', 'id_g_pie')
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    // }

    var industry_index = {
        "Service": 0,
        "Farming & Agriculture": 1,
        "Manufacturing": 2
    }
    // Create dummy data
    var data = {
        "Service": 25,
        "Farming & Agriculture": 25,
        "Manufacturing": 25
    };

    // set the color scale

  //       var color =   d3.scaleSequential().domain(Object.keys(data))
  // .interpolator(d3.interpolatePuRd);
  // var color = d3.scaleOrdinal()
  // .domain(Object.keys(data))
  // .range(d3.schemeDark2);
  // var color = d3.scaleSequential().domain([1,10])
  // .range(["green", "blue"])
        // .range(d3.scaleSequential(["blue", "green"]));

    // Compute the position of each group on the pie:
    var pie = d3.pie()
        .sort(null) // Do not sort group by size
        .value(function (d) { return d.value; })
    var data_ready = pie(d3.entries(data))

    var arcLabel = d3.arc().innerRadius(radius * 1.1).outerRadius(radius * 1.1);

    // Another arc that won't be drawn. Just for labels positioning
    var outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9)

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
            .attr('id', 'id_industry_pie_'+i)
            .attr('fill', function (d) {
                return "white"
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
        "Service": {},
        "Farming & Agriculture": {},
        "Manufacturing": {}
    }
    var estimating_labels_per_industry_per_year = 9;
    var label_angle_gap_to_avoid_overlapping = Math.PI / Object.keys(memorize_label_count_per_year).length / estimating_labels_per_industry_per_year;
    var transform_values = {}
    d3.select("#id_g_pie")
        .selectAll("path_arch")
        .data(label_data)
        .enter()
        .append("path")
        .attr("d", function (d) {
            var year = parseInt(d.Year)
            var angles = get_arch_angles_from_pie(data_ready, industry_index, d)
            var label_png_arc = d3.arc()
                .innerRadius(radius / num_of_layers * (year - start_year))         // This is the size of the donut hole
                .outerRadius(radius / num_of_layers * (year - start_year))
                .startAngle(angles[0])
                .endAngle(angles[1]);
            return label_png_arc()
        })
        .attr("id", function (d) {
            return "id_arch_" + d.Row;
        }).attr("stroke", function (d) {
            // }
            // var row_color= color(d.Row);
            // if (row_color.startsWith("#")){
            // var rgb = hexToRgb(row_color);

            // } else{
            //   var rgb = row_color.replace('rgb(','').replace(')','').split(',')
            // }
            // if (rgb.length !== 3) {
            //   alert('Invalid format!');
            // }

            // var what_color = new Color(rgb[0], rgb[1], rgb[2]);
            // var solver = new Solver(what_color);
            // var result = solver.solve();
            // row_colors[d.Row] = [row_color, result.filter]

            // return row_color
            return  row_colors[d.Row][0]
        })
        .style("stroke-width", "6px")
        // .style("opacity", function (d) {
        //     return d.Row==34 || d.Row==40 ?1:0;
        // })
        .style("opacity", 0.6)
        .on("mouseover", function (d) {
            // sort all the areas relative to the current item
            // Display a tooltip with the current size
            // tooltip.transition().duration(400).style("opacity", .9);
            // tooltip.text(d.Name);
            // highlight the current path
            d3.select(this)
                // .style("fill-opacity", .1)
                // .style("stroke-opacity", 1)
                .style("stroke", "white")
        })
        .on("mousemove", function (d) {

        })
        .on("mouseout", function (d) {
            d3.select(this)
            .transition().duration(400)
            .style("stroke", row_colors[d.Row][0])
        });

    return transform_values, row_colors
}

function get_arch_angles_from_pie(data_ready, industry_index, d) {
    var all_industries = d.Industry.split(',')
    if (all_industries.length == 1) {
        var industry = name_dict[all_industries[0]];
        var industry_pie_params = data_ready[industry_index[industry]]
        return [industry_pie_params.startAngle, industry_pie_params.endAngle]
    }
    if (all_industries.length == 3) {
        return [0, 2 * Math.PI]
    } else {
        if (industry_index[name_dict[all_industries[0]]] + industry_index[name_dict[all_industries[1]]] == 2) {
            return [data_ready[2].startAngle - 2 * Math.PI, data_ready[0].endAngle]
        } else if (industry_index[name_dict[all_industries[0]]] + industry_index[name_dict[all_industries[1]]] == 1) {
            return [data_ready[0].startAngle, data_ready[1].endAngle]
        }
        else {
            return [data_ready[1].startAngle, data_ready[2].endAngle]
        }
    }

}
function show_pie(opacity, label_opacity, transition_time, industry_pie_transform_values,ids, pie_id) {
    ids.forEach(id =>
      d3.selectAll('#'+id).raise().transition().duration(transition_time).style("opacity", opacity)
    );
    // d3.selectAll('#id_g_pie').raise().transition().duration(transition_time).style("opacity", opacity);
    // d3.selectAll('#id_pie_text').raise().transition().duration(transition_time).style("opacity", label_opacity);
    if (opacity == 0) {
      debugger
        // .transition().duration(transition_time).style("opacity", opacity)//.remove();
        // d3.select("#id_pie_text")
        // .transition().duration(transition_time).style("opacity", opacity)//.remove();
        ids.forEach(id =>
          d3.selectAll('#'+id).transition().duration(transition_time).style("opacity", opacity).remove()
        );
    }
    // else {
    //     // d3.select("#id_g_pie")
    //     // .transition().duration(transition_time).style("opacity", opacity)//.remove();
    //     // d3.select("#id_pie_text")
    //     // .transition().duration(transition_time).style("opacity", opacity)//.remove();
    // }
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
export { load_industry_pie, show_pie };
