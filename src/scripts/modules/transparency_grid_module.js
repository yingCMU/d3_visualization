

const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
const num_of_layers = 5;
const num_of_labels = 50;
const boundary = [{ 'body': 'gov', 'num': 8 }, { 'body': 'for_profit', 'num': 18 }, { 'body': 'non_profit', 'num': num_of_labels }]

var points = [];
var rects = [];

// var width = 960,
// 	height = 500;
const block_width = 30;
const block_height = 60;
const grid_width = num_of_labels * (block_width + 1);
const grid_height = num_of_layers * (block_height + 1);
var total_width = num_of_labels * block_width
var total_height = num_of_layers * block_height
// d3.gridLayout = () => {
//     function processGrid(data) {
//         var rows = Math.ceil(Math.sqrt(data.length));
//         var columns = rows;
//         var cell = 0;
//         for (var rowNumber = 0; rowNumber < rows; rowNumber++) {
//             for (var cellNumber = 0; cellNumber < columns; cellNumber++) {
//                 if (data[cell]) {
//                     cellNumber
//                     data[cell].y = rowNumber
//                     cell++
//                 }
//                 else {
//                     break
//                 }
//             }
//         }
//         return data
//     }


//     return processGrid
// }
// var grid = d3.gridLayout()
// grid([1, 2, 3, 4, 5])




// var rectGrid = d3.layout.grid()
// 	.bands()
// 	.size([grid_width, grid_height])
// 	.padding([0.1, 0.1]);
// d3.gridLayout()

    // .attr({
    //     width: width,
    //     height: height
    // })
    // .append("g")
    // .attr("transform", "translate(" + (width - num_of_labels * block_width) / 2 + "," + (height - num_of_layers * block_height) / 2 + ")");

function get_color_class(i) {
    if (Math.random() > 0.5) {
        return "rect_empty";
    }
    else {
        for (var idx = 0; idx < boundary.length; idx++) {
            var e = boundary[idx]
            if (i < e.num) {
                return "rect_" + e.body;
            }
        }
    }
}

function create_grid() {
    // var svg = d3.select("#id_industry_pie").select("svg")

    // var svg = d3.select("#id_industry_pie")
    // .select("svg")
    // .append("g")
    // .attr("id","id_g_label_row")
    // .style("opacity", 0)
    // .attr("transform", "translate(" + (width ) / 2 + "," + (height ) / 2 + ")");
    var svg = d3.select("#id_industry_pie")
    .select("svg")
    .append("g")
    .attr("id","id_g_grid")
    .style("opacity", 0)
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    for (var l = 0; l < num_of_layers; l++) {
        for (var i = 0; i < num_of_labels; ++i) {
            var newPerson = { x: block_width * i, y: l * block_height };
            svg
            .append('rect').attr('id','id_rect_'+l+'-'+i).attr("class", get_color_class(i))//.enter()
                .attr('x', block_width * i-total_width/2)
                .attr('y', l * block_height-total_height/2)
                .attr("width", block_width)
                .attr("height", block_height)
                .attr("stroke-width", "1pt")
                .attr("stroke", "white")
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
    }
}

function show_grid(opacity, transition_time) {
    var svg = d3.select("#id_industry_pie")
    .select("svg")
    .select("#id_g_grid").lower()
    .transition().duration(transition_time).style("opacity", opacity);
    if(opacity>0)
    for(var i = 3; i < 3+num_of_labels; i++){
        label_transform(transition_time, i)
    }

}
function label_transform(transition_time, label_row_number) {
    var svg_top_cell = d3.select("#id_rect_0-"+(label_row_number-3))
    var svg_label = d3.select("#id_label_"+label_row_number).raise()
    .attr("x",0)
    .attr("y",0)
    // .attr("x",svg_top_cell.attr('x'))
    // .attr('y',-total_height/2-block_height*0.7)
    // .attr("transform","translate(0,0)")
    .transition()
    .duration(transition_time*3)
    .attr("transform", "translate(" + svg_top_cell.attr('x') +","+ (-total_height/2-block_height*0.7)+ ")")
    //  .style("left",block_width).style("top",0)
    console.log('attrx',svg_top_cell.attr('x'))
    debugger
}
export { create_grid, show_grid ,label_transform};
