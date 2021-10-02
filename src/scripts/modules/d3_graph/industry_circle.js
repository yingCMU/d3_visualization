function load_circle() {

    var r = 400;

    var svg = d3.select("body")
        .append("svg");
    // var positionLabel = svg.append("text")
    //     .attr("x", 10)
    //     .attr("y", 30);

    // svg.on("mousemove", function () { //<-A
    //     printPosition();
    // });

    // function printPosition() { //<-B
    //     var position = d3.mouse(svg.node()); //<-C
    //     positionLabel.text(position);
    // }
    let num_of_rings = 15;
    let gap = 30;
    svg.on("click", function () { //<-D
        for (var i = 1; i < num_of_rings; ++i) {
            // var position = d3.mouse(svg.node());
            const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
            const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
            var r=i*gap;
            var circle = svg.append("circle")
                .attr("cx",width/2)
                .attr("cy", height/2)
                .attr("r", r)
                .style("stroke-width", 1)
                // .transition()
                // .delay(Math.pow(i, 2.5) * 50)
                // .duration(2000)
                // .ease('quad-in')
                // .attr("r", r)
                // .style("stroke-opacity", 0)
                // .each("end", function () {
                //     d3.select(this).remove();
                // });
        }
    });

}
export { load_circle };
