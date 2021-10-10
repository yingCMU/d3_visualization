function sort_label_by_body(label_data, name_dict) {
    var sorted_data = { 'Goverment': [], 'Non-Profit': [], 'For-Profit': [] }
    label_data.forEach(label => {
        sorted_data[name_dict[label.Body.trim()]].push(label)
    });

    for (const [body, label_array] of Object.entries(sorted_data)) {
        label_array.sort(function(a, b) {
            return parseInt(b.Total) - parseInt(a.Total);
          });
    }
    return sorted_data
}



function get_color_class_color(label, l, row_colors) {

    var class_name
    if (label['Transparency_' + (l+1)] == 0) {
       class_name = "rect_empty"
    } else {
       class_name = "rect_Unkown"
    }
        return class_name

}



function create_grid(label_data, name_dict, row_colors) {
    var sorted_label_data = sort_label_by_body(label_data, name_dict)
    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
    var svg = d3.select("#id_industry_pie")
        .select("svg")
        .append("g")
        .attr("id", "id_g_grid")
        .style("opacity", 0)
        .attr("transform", "translate(" + (width / 2 + block_width*3) + "," + height / 2 + ")");
    var idx = 0
    // width = 0.89 * width
    // height= 0.89* height

    var lable_row_to_grid_index = {}
    for (const [body, label_array] of Object.entries(sorted_label_data)) {
        for (var i = 0; i < label_array.length; ++i) {
            var label = label_array[i]
            lable_row_to_grid_index[label.Row] = idx
            for (var l = 0; l < num_of_grid_layers; l++) {
                var label_class = get_color_class_color(label, l ,row_colors)
                 var hex_color=row_colors[label.Row][0]

                svg
                    .append('rect').attr('id', 'id_rect_' + l + '-' + idx)
                    // .attr("class", label_class)
                    .attr("fill", label_class == "rect_empty" ? null: hex_color)
                    .attr('x', block_width * idx - total_grid_width / 2 + (block_width - grid_block_filled_width) / 2)
                    .attr('y', l * block_height - total_grid_height / 2)
                    .attr("width", grid_block_filled_width)
                    .attr("height", block_height)
                    .attr("stroke-width", "1pt")
                    .style("opacity", 1)
            }
            idx++ // label processed
            let filter_color = row_colors[label.Row][1]
            let final_filter_color = filter_color.replace("filter:", "").replace(";","")
            creat_label_images(400, lable_row_to_grid_index, label.Row, svg,final_filter_color )
        }
        idx++
    }
    var horizontal_lines = []
    for (var l = 0; l < num_of_grid_layers; l++) {
        horizontal_lines.push([
            [-total_grid_width / 2 - block_width, l * block_height - total_grid_height / 2 + block_height],
            [total_grid_width / 2 + block_width, l * block_height - total_grid_height / 2 + block_height]
        ])
    }
    // draw horizontal dotted lines
    svg
        .selectAll("path")
        .data(horizontal_lines)
        .enter()
        .append("path")
        .attr("d", function (d) {
            return d3.line()(d)
        })
        .attr("id", function (d) {
            return "id_line";
        }).attr("stroke", "white")
        .style("stroke-dasharray", ("1, 2"))
        .style("stroke-width", "2px")
        .style("opacity", 0.3)


    expand_one_grid(lable_row_to_grid_index)
    return lable_row_to_grid_index

}
function expand_one_grid(lable_row_to_grid_index) {
    var grid_idx = lable_row_to_grid_index[mock_grid_row_num]
    console.log('mock_grid_index:',grid_idx)
    // var all_grids = [
        d3.select("#id_rect_0-" + grid_idx).on("mouseover",expand_on_click).on("mouseout",revert )
        d3.select("#id_rect_1-" + grid_idx).on("mouseover",expand_on_click).on("mouseout",revert )
        d3.select("#id_rect_2-" + grid_idx).on("mouseover",expand_on_click).on("mouseout",revert )
        d3.select("#id_rect_3-" + grid_idx).on("mouseover",expand_on_click).on("mouseout",revert )
        d3.select("#id_rect_4-" + grid_idx).on("mouseover",expand_on_click).on("mouseout",revert )
    // ]
    // d3.select("#id_rect_0-" + i).on("click", function (d) {
    //     var selected = d3.select(this).raise()
    //     debugger

    //     var original_width = selected.attr('width')
    //     selected.transition().duration(400)
    //         .attr("width", 6 * original_width)
    //     // .style("stroke-opacity", 0.6);
    // })
    function expand_on_click() {
        var transition_time = 400*2
        var text_data = []

        for (var l = 0; l < num_of_grid_layers; l++) {
            var selected =  d3.select("#id_rect_"+l+"-" + grid_idx).raise()
            selected.transition().duration(transition_time)
                    .attr("width", 6 * block_width - grid_block_filled_width)
            var y = selected.attr('y')
                    text_data.push(
                        {
                            "text": mock_grid_text[l],
                            "id":"id_trans_grid_text_" + l,
                            "x": parseInt(selected.attr('x')) + block_width/2,
                            "y": parseInt(y) + block_height/2
                    }
            )
        }
        d3.selectAll("#id_line").raise()
        // var svg = d3.select("#id_g_grid")
        // svg.selectAll('allLabels1')
        //         .data(text_data)
        //         .enter()
        //         .append('text')
        //         .attr('class',  "grid_text")
        //         // .attr('textLength',  "10em")
        //         .style("fill-opacity",0)
        //         .attr("x", function (d) { return d.x})
        //         .attr("y", function (d) { return d.y})
        //         .raise()
        //         .transition().duration(transition_time)

        //         .attr('id', function (d) {return d.id})
        //         .text(function (d) { return d.text})
        //         .style("fill-opacity",1)

        //         .attr("fill", "white")
        //         .style('font', "11px Helvetica Neue")
        //         .style('text-anchor', 'start')
    }

    function revert() {
        for (var l = 0; l < num_of_grid_layers; l++) {
            var selected =  d3.select("#id_rect_"+l+"-" + grid_idx).raise()
            selected.transition().duration(transition_time)
                    .attr("width", grid_block_filled_width)
                // .style("stroke-opacity", 0.6);
                d3.select("#id_trans_grid_text_" + l).remove()
        }
    }


}

function show_grid(opacity, transition_time, lable_row_to_grid_index) {
    if (opacity > 0) {
        for (const [row, grid_idx] of Object.entries(lable_row_to_grid_index)) {
            label_transform(transition_time, row, grid_idx)
        }
        d3.select("#id_industry_pie")
            .select("svg")
            .select("#id_g_grid").raise()
            .transition().duration(transition_time).style("opacity", opacity);
    } else {
        d3.select("#id_industry_pie")
            .select("svg")
            .select("#id_g_grid").lower()
            .transition().duration(transition_time).style("opacity", opacity).remove();
    }
}

function label_transform(transition_time, label_row, grid_idx) {
    var svg_top_cell = d3.select("#id_rect_0-" + grid_idx)
    var svg_label = d3.select("#id_label_" + label_row,).raise()
        .attr("x", 0)
        .attr("y", 0)
        // .attr("x",svg_top_cell.attr('x'))
        // .attr('y',-total_height/2-block_height*0.7)
        // .attr("transform","translate(0,0)")
        .transition()
        .duration(transition_time * 3)
        .attr("transform", "translate(" + svg_top_cell.attr('x') + "," + (-total_grid_height / 2 - block_height * 0.7) + ")")
}
function creat_label_images(transition_time, lable_row_to_grid_index, label_row, svg, filter) {
    var grid_idx = lable_row_to_grid_index[label_row]
    var svg_top_cell = d3.select("#id_rect_0-" + grid_idx)
    svg
        .append('svg:image').raise()
        .attr('xlink:href', '../data/images/labels/' + label_row + '.png')
        .attr("x", 0)
        .attr("y", 0)
        .attr('width', label_width)
        .attr('height', label_height)
        .attr('id', 'id_label_img_' + grid_idx)
        .attr('filter', filter)
        // .attr('class', 'label_class')
        .style("opacity", 1)
        // .attr("fill", 'red')
        .transition()
        .duration(transition_time * 3)
        .attr("transform", "translate(" + (parseInt(svg_top_cell.attr('x')) - grid_block_filled_width/2) + "," + (-total_grid_height / 2 - block_height * 0.8) + ")")
}
function transparency_grid_index_text(svg) {
    var transparency_criteria = ["Standardization", "Quantified Data", "Awardee Information", "Full Lifecycle", "Enforcement"]

    var left_top_cell = d3.select("#id_rect_0-0")
    var svg = d3.select("#id_g_grid")
   var text_data = []
    for (var r = 0; r < 5; ++r) {
        var left_cell = d3.select("#id_rect_" + r + "-0")
        var y = left_cell.attr('y')
        text_data.push(
            {
                "text":transparency_criteria[r],
                "id":"id_trans_index_" + r,
                "x": (left_top_cell.attr('x') - block_width),
                "y": parseInt(y) + block_height*3/4
        }
        )
    }

            svg
            .selectAll('allLabels1')
            .data(text_data)
            .enter()
            .append('text')
            .attr('id', function (d) {return d.id})
            .text(function (d) { return d.text})
            .attr("x", function (d) { return d.x})
            .attr("y", function (d) { return d.y})
            .attr("fill", "white")
            .style('font', "15px Helvetica Neue")
            .style('text-anchor', 'end')
    // d3.select("#id_g_pie")
    //     .selectAll("path_arch")
    //     .data(label_data)
    //     .enter()
    //     .append("path")
}
export { create_grid, show_grid, label_transform, transparency_grid_index_text };
