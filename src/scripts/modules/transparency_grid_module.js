function sort_label_by_body(label_data, name_dict) {
    var sorted_data = { 'Goverment': [], 'Non-Profit': [], 'For-Profit': [] }
    label_data.forEach(label => {
        sorted_data[name_dict[label.Body.trim()]].push(label)
    });
    return sorted_data;
}

function get_color_class(label, l, name_dict) {

    if (label['Transparency_' + l] == 0) {
        return "rect_empty"
    } else {
        var all_industries = label.Industry.split(',')
        return "rect_" + name_dict[all_industries[0]];
    }
}

function create_grid(label_data, name_dict) {
    var sorted_label_data = sort_label_by_body(label_data, name_dict)
    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var svg = d3.select("#id_industry_pie")
        .select("svg")
        .append("g")
        .attr("id", "id_g_grid")
        .style("opacity", 0)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    var idx = 0
    var lable_row_to_grid_index = {}
    for (const [body, label_array] of Object.entries(sorted_label_data)) {
        for (var i = 0; i < label_array.length; ++i) {
            var label = label_array[i]
            lable_row_to_grid_index[label.Row] = idx
            for (var l = 0; l < num_of_grid_layers; l++) {
                svg
                    .append('rect').attr('id', 'id_rect_' + l + '-' + idx).attr("class", get_color_class(label, l, name_dict))//.enter()
                    .attr('x', block_width * idx - total_grid_width / 2 + (block_width - grid_block_filled_width) / 2)
                    .attr('y', l * block_height - total_grid_height / 2)
                    .attr("width", grid_block_filled_width)
                    .attr("height", block_height)
                    .attr("stroke-width", "1pt")
                    // .attr("stroke", "white")
                    .style("opacity", 1)

                // .attrs({ x: 10, y: 10, width: 80, height: 80, fill: 'red' })
                // .transition()
                // .duration(5000)
                // .attrs({ x: 460, y: 150, width: 40, height: 40, fill: 'blue' });
                // svg.append("rect").attr("class", "rect")
                // 	// .data(newPerson)
                // 	.attr("width", block_width)
                // 	.attr("height", block_height)
                // 	.attr("stroke-width", "1pt")
                // 	.attr("stroke", "white")
                // 	.attr('x', d => d.x)
                // 	.attr('y', d => d.y)
                // 	// .attr("transform", function (d) {
                // 	// 	console.log(d);
                // 	// 	debugger;
                // 	// 	return "translate(" + d.x + "," + d.y + ")";
                // 	// })
                // 	// .style("opacity", 1e-6);
                // 	.style("opacity", 1);
            }
            idx++ // label processed
        }
        idx++ // gaps
    }
    return lable_row_to_grid_index

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
            .transition().duration(transition_time).style("opacity", opacity)//.remove();
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
function transparency_grid_index_text() {
    var left_top_cell = d3.select("#id_rect_0-0")
    for (var r = 0; r < 5; ++r) {
        var left_cell = d3.select("#id_rect_"+r+"-0")
        d3.select("#id_g_grid")
            .append("span").raise()
            .text("Transparency-" + r)
            .attr("id", "id_trans_index" + r)
            .attr("x", (left_top_cell.attr('x') - block_width))
            .attr("y", left_cell.attr('y'))
            .attr("stroke-width", "40px")
            .attr("stroke", "white")
            .style("opacity", 1)
            .transition()
            // .duration(transition_time * 3)
            // .attr("transform", "translate(" + (left_top_cell.attr('x') - block_width) + "," + left_cell.attr('y') + ")")
    }
}
export { create_grid, show_grid, label_transform, transparency_grid_index_text };
