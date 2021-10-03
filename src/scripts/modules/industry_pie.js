import { label_transform, show_grid ,create_grid} from "./transparency_grid_module.js";
const transition_time = 400
function load_industry_pie(data) {
    const start_year = 1990;
    const current_year = 2021;
    const label_height = 30
    const label_width =30;
    const industry_label_color = 'white';
    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
    const num_of_layers = current_year - start_year;
    const margin = 40
    var rangeInput = document.getElementById("id_slider");
    var old_value = 1
    var new_value = 1

    rangeInput.addEventListener('mouseup', function () {
        if (this.value < 25) {
            this.value = 1
        } else if (this.value < 75) {
            this.value = 50
        } else {
            this.value = 100
        }
        new_value=parseInt(this.value)
        switch_view(old_value,new_value )
        old_value=new_value
    });


    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin

    // append the svg object to the div called 'id_industry_pie'
    var svg = d3.select("#id_industry_pie")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr('id','id_g_pie')
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    var industry_index = {
        "Energy/Environment": 0,
        "Social": 1,
        "Service": 2,
        "Farming/Agriculture": 3,
        "Manufacturing": 4
    }
    // Create dummy data
    var data = {
        "Energy/Environment": 20,
        "Social": 20,
        "Service": 20,
        "Farming/Agriculture": 20,
        "Manufacturing": 20
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
        var arc = d3.arc()
            .innerRadius(radius * (1.0 - (i + 1) * 1 / num_of_layers))         // This is the size of the donut hole
            .outerRadius(radius * (1.0 - i * 1 / num_of_layers))
        svg
            .selectAll('allSlices1111')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('id', 'pie_id')
            .attr('fill', function (d) {
                return i == 0 ? color(d.data.key) : "white";
                // console.log(d.data);
                // console.log(color(d.data));
                return (color(d.data.key));
            })
            .attr("stroke", "white")
            .style("stroke-width", "1px")
            .style("opacity", 0.4);
    }

    // Add the polylines between chart and labels:
    // svg
    // 	.selectAll('allPolylines')
    // 	.data(data_ready)
    // 	.enter()
    // 	.append('polyline')
    // 	.attr("stroke", "black")
    // 	.style("fill", "none")
    // 	.attr("stroke-width", 1)
    // 	.attr('points', function (d) {
    // 		var posA = arc.centroid(d) // line insertion in the slice
    // 		var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
    // 		// var posC = outerArc.centroid(d); // Label position = almost the same as posB
    // 		var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
    // 		// posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
    // 		return [posA, posB]//, posC]
    // 	})

    // Add the polylines between chart and labels:
    svg
        .selectAll('allLabels1')
        .data(data_ready)
        .enter()
        .append('text')
        .attr('id','id_pie_text')
        .text(function (d) { console.log(d.data.key); return d.data.key })
        .attr('transform', function (d) {
            var pos = outerArc.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
            // return 'translate(' + pos + ')';
            return `translate(${arcLabel.centroid(d)})`
        })
        .style('fill', industry_label_color)
        .style('text-anchor', function (d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
        })

    var csv_mock_data = [
        {
            'row': 3,
            'year': 1991,
            'industry': 'Social'
        },
        {
            'row': 4,
            'year': 1999,
            'industry': 'Manufacturing'
        },
        {
            'row': 5,
            'year': 1994,
            'industry': 'Service'
        },
        {
            'row': 6,
            'year': 2010,
            'industry': 'Farming/Agriculture'
        },
        {
            'row': 7,
            'year': 2016,
            'industry': 'Energy/Environment'
        },
    ]
    // var imgs = svg.selectAll("image").data([0]);
    var memorize_label_count_per_year = {
        "Energy/Environment": {},
        "Social": {},
        "Service": {},
        "Farming/Agriculture": {},
        "Manufacturing": {}
    }
    var estimating_labels_per_industry_per_year = 4;
    var label_angle_gap_to_avoid_overlapping = Math.PI / Object.keys(memorize_label_count_per_year).length / estimating_labels_per_industry_per_year;
    // var label_svg = d3.select("#id_labels")
    //     .append("svg")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .append("g")
    //     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    var transform_values = []

    for (var i = 0; i < csv_mock_data.length; i++) {
        var label_data = csv_mock_data[i]
        var industry_pie_params = data_ready[industry_index[label_data.industry]]
        // svg.append('svg:image')
        // .attr({
        //   'xlink:href': 'http://www.iconpng.com/png/beautiful_flat_color/computer.png',  // can also add svg file here
        //   x: 0,
        //   y: 0,
        //   width: 128,
        //   height: 128
        // });
        var myimage = svg
            .append('svg:image').raise()
            .attr('xlink:href', '../data/images/labels/' + label_data.row + '.png')
            .attr('width', label_width)
            .attr('height', label_height)
            .attr('id', 'id_label_'+label_data.row)
            .attr('class', 'label_class')
            .attr('transform', function (d) {
                // var pos = outerArc.centroid(d);
                // var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                // pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                // // return 'translate(' + pos + ')';
                // var usable_angel = industry_pie_params.endAngle- industry_pie_params.startAngle
                if (!(label_data.year in memorize_label_count_per_year[label_data.industry])) {
                    memorize_label_count_per_year[label_data.industry][label_data.year] = 0
                }
                var num_of_existing_labels = memorize_label_count_per_year[label_data.industry][label_data.year]
                console.log(num_of_existing_labels * label_angle_gap_to_avoid_overlapping, (num_of_existing_labels + 1) * label_angle_gap_to_avoid_overlapping)

                var label_png_arc = d3.arc()
                    .innerRadius(radius / num_of_layers * (label_data.year - start_year))         // This is the size of the donut hole
                    .outerRadius(radius / num_of_layers * (label_data.year - start_year))
                    .startAngle(industry_pie_params.startAngle + num_of_existing_labels * label_angle_gap_to_avoid_overlapping)
                    .endAngle(industry_pie_params.startAngle + (num_of_existing_labels + 1) * label_angle_gap_to_avoid_overlapping);
                // .startAngle(industry_pie_params.startAngle)
                // .endAngle(industry_pie_params.endAngle)
                memorize_label_count_per_year[label_data.industry][label_data.year]++
                var t = `translate(${label_png_arc.centroid(industry_pie_params)})`
                transform_values.push(t)
                return t
                // return `translate(${arcLabel.centroid(d)})`
            })
        // .attr('x', x)
        // .attr('y', y)
    }

    // .attr('x', width/2)
    // .attr('y', height/2);
    // imgs.enter().append("svg:image")
    // .attr('x', width/2)
    // .attr('y', height/2)
    // .attr('width', 40)
    // .attr('height', 54)
    // .attr("xlink:href", "../data/images/labels/3_american-grassfed.png");
    function show_pie(opacity, label_opacity, transition_time) {
        d3.selectAll('#pie_id').transition().duration(transition_time).style("opacity", opacity);
        d3.selectAll('#id_pie_text').transition().duration(transition_time).style("opacity", label_opacity);
        if(opacity>0){
            for(var i = 3; i < 3+csv_mock_data.length; i++){
                pie_label_transform(transition_time, i)
            }
        }


    }
    function pie_label_transform(transition_time, label_row_number) {
        var svg_label = d3.select("#id_label_"+label_row_number).raise()
        .attr("x",0)
        .attr("y",0)
        .transition()
        .duration(transition_time*3)
        .attr("transform", transform_values[label_row_number-3])
        //  .style("left",block_width).style("top",0)
    }
    function show_venn(opacity, transition_time) {
        var svg = d3.select("#id_industry_pie")
            .select("svg")
            .select("#id_g_venn")
            .transition().duration(transition_time).style("opacity", opacity);

    }
    function switch_view(old_value, new_value) {
        if(old_value==new_value){
            return
        }

        show_pie(new_value ==1? 0.4:0, new_value ==1? 1:0, transition_time*2)
        show_grid(new_value ==50? 1:0, transition_time*2)
        show_venn(new_value ==100? 1:0, transition_time*2)
            // d3
            //     .selectAll('#id_dimensions').transition().duration(transition_time).style("opacity", new_value ==100? 0.4:0);

        // .remove();
    }
}
export { load_industry_pie };
