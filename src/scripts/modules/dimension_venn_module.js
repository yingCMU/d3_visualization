import venn from "../../package/dist/venn.js";

function create_venn() {


    const circle_opacity = .25;
    // define sets and set set intersections
    const circle_size = 60, overlapping = 10;
    var sets = [
        { sets: ['A'], size: circle_size },
        { sets: ['B'], size: circle_size },
        { sets: ['C'], size: circle_size },
        { sets: ['A', 'B'], size: overlapping },
        { sets: ['A', 'C'], size: overlapping },
        { sets: ['C', 'B'], size: overlapping },
    ];
    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    // var chart = venn.VennDiagram();
    var chart = venn.VennDiagram().width(width)
        .height(height);
    var svg = d3.select("#id_industry_pie")
        .select("svg").append("g")
        .attr("id", "id_g_venn")
        .style("opacity", 0)
    d3.select("#id_g_venn").attr("transform", "translate(" + (width) / 2 + "," + (height) / 2 + ")")
        .datum(sets).call(chart);
    d3.selectAll("#id_g_venn g[data-venn-sets='A'] path")
        .style("fill", "#2BB673").style("fill-opacity", circle_opacity);
    d3.selectAll("#id_g_venn g[data-venn-sets='B'] path")
        .style("fill", "#7F3F98").style("fill-opacity", circle_opacity);
    d3.selectAll("#id_g_venn g[data-venn-sets='C'] path")
        .style("fill", "#BE1E2D").style("fill-opacity", circle_opacity);
}
function show_venn(opacity, transition_time) {
    var svg = d3.select("#id_industry_pie")
        .select("svg")
        .select("#id_g_venn")
        .transition().duration(transition_time).style("opacity", opacity);

}
export { create_venn, show_venn };
