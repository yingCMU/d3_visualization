import { label_transform, show_grid, create_grid } from "./transparency_grid_module.js";
class Color {
    constructor(r, g, b) {
      this.set(r, g, b);
    }

    toString() {
      return `rgb(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)})`;
    }

    set(r, g, b) {
      this.r = this.clamp(r);
      this.g = this.clamp(g);
      this.b = this.clamp(b);
    }

    hueRotate(angle = 0) {
      angle = angle / 180 * Math.PI;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      this.multiply([
        0.213 + cos * 0.787 - sin * 0.213,
        0.715 - cos * 0.715 - sin * 0.715,
        0.072 - cos * 0.072 + sin * 0.928,
        0.213 - cos * 0.213 + sin * 0.143,
        0.715 + cos * 0.285 + sin * 0.140,
        0.072 - cos * 0.072 - sin * 0.283,
        0.213 - cos * 0.213 - sin * 0.787,
        0.715 - cos * 0.715 + sin * 0.715,
        0.072 + cos * 0.928 + sin * 0.072,
      ]);
    }

    grayscale(value = 1) {
      this.multiply([
        0.2126 + 0.7874 * (1 - value),
        0.7152 - 0.7152 * (1 - value),
        0.0722 - 0.0722 * (1 - value),
        0.2126 - 0.2126 * (1 - value),
        0.7152 + 0.2848 * (1 - value),
        0.0722 - 0.0722 * (1 - value),
        0.2126 - 0.2126 * (1 - value),
        0.7152 - 0.7152 * (1 - value),
        0.0722 + 0.9278 * (1 - value),
      ]);
    }

    sepia(value = 1) {
      this.multiply([
        0.393 + 0.607 * (1 - value),
        0.769 - 0.769 * (1 - value),
        0.189 - 0.189 * (1 - value),
        0.349 - 0.349 * (1 - value),
        0.686 + 0.314 * (1 - value),
        0.168 - 0.168 * (1 - value),
        0.272 - 0.272 * (1 - value),
        0.534 - 0.534 * (1 - value),
        0.131 + 0.869 * (1 - value),
      ]);
    }

    saturate(value = 1) {
      this.multiply([
        0.213 + 0.787 * value,
        0.715 - 0.715 * value,
        0.072 - 0.072 * value,
        0.213 - 0.213 * value,
        0.715 + 0.285 * value,
        0.072 - 0.072 * value,
        0.213 - 0.213 * value,
        0.715 - 0.715 * value,
        0.072 + 0.928 * value,
      ]);
    }

    multiply(matrix) {
      const newR = this.clamp(this.r * matrix[0] + this.g * matrix[1] + this.b * matrix[2]);
      const newG = this.clamp(this.r * matrix[3] + this.g * matrix[4] + this.b * matrix[5]);
      const newB = this.clamp(this.r * matrix[6] + this.g * matrix[7] + this.b * matrix[8]);
      this.r = newR;
      this.g = newG;
      this.b = newB;
    }

    brightness(value = 1) {
      this.linear(value);
    }
    contrast(value = 1) {
      this.linear(value, -(0.5 * value) + 0.5);
    }

    linear(slope = 1, intercept = 0) {
      this.r = this.clamp(this.r * slope + intercept * 255);
      this.g = this.clamp(this.g * slope + intercept * 255);
      this.b = this.clamp(this.b * slope + intercept * 255);
    }

    invert(value = 1) {
      this.r = this.clamp((value + this.r / 255 * (1 - 2 * value)) * 255);
      this.g = this.clamp((value + this.g / 255 * (1 - 2 * value)) * 255);
      this.b = this.clamp((value + this.b / 255 * (1 - 2 * value)) * 255);
    }

    hsl() {
      // Code taken from https://stackoverflow.com/a/9493060/2688027, licensed under CC BY-SA.
      const r = this.r / 255;
      const g = this.g / 255;
      const b = this.b / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;

          case g:
            h = (b - r) / d + 2;
            break;

          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      return {
        h: h * 100,
        s: s * 100,
        l: l * 100,
      };
    }

    clamp(value) {
      if (value > 255) {
        value = 255;
      } else if (value < 0) {
        value = 0;
      }
      return value;
    }
  }
class Solver {
    constructor(target, baseColor) {
      this.target = target;
      this.targetHSL = target.hsl();
      this.reusedColor = new Color(0, 0, 0);
    }

    solve() {
      const result = this.solveNarrow(this.solveWide());
      return {
        values: result.values,
        loss: result.loss,
        filter: this.css(result.values),
      };
    }

    solveWide() {
      const A = 5;
      const c = 15;
      const a = [60, 180, 18000, 600, 1.2, 1.2];

      let best = { loss: Infinity };
      for (let i = 0; best.loss > 25 && i < 3; i++) {
        const initial = [50, 20, 3750, 50, 100, 100];
        const result = this.spsa(A, a, c, initial, 1000);
        if (result.loss < best.loss) {
          best = result;
        }
      }
      return best;
    }

    solveNarrow(wide) {
      const A = wide.loss;
      const c = 2;
      const A1 = A + 1;
      const a = [0.25 * A1, 0.25 * A1, A1, 0.25 * A1, 0.2 * A1, 0.2 * A1];
      return this.spsa(A, a, c, wide.values, 500);
    }

    spsa(A, a, c, values, iters) {
      const alpha = 1;
      const gamma = 0.16666666666666666;

      let best = null;
      let bestLoss = Infinity;
      const deltas = new Array(6);
      const highArgs = new Array(6);
      const lowArgs = new Array(6);

      for (let k = 0; k < iters; k++) {
        const ck = c / Math.pow(k + 1, gamma);
        for (let i = 0; i < 6; i++) {
          deltas[i] = Math.random() > 0.5 ? 1 : -1;
          highArgs[i] = values[i] + ck * deltas[i];
          lowArgs[i] = values[i] - ck * deltas[i];
        }

        const lossDiff = this.loss(highArgs) - this.loss(lowArgs);
        for (let i = 0; i < 6; i++) {
          const g = lossDiff / (2 * ck) * deltas[i];
          const ak = a[i] / Math.pow(A + k + 1, alpha);
          values[i] = fix(values[i] - ak * g, i);
        }

        const loss = this.loss(values);
        if (loss < bestLoss) {
          best = values.slice(0);
          bestLoss = loss;
        }
      }
      return { values: best, loss: bestLoss };

      function fix(value, idx) {
        let max = 100;
        if (idx === 2 /* saturate */) {
          max = 7500;
        } else if (idx === 4 /* brightness */ || idx === 5 /* contrast */) {
          max = 200;
        }

        if (idx === 3 /* hue-rotate */) {
          if (value > max) {
            value %= max;
          } else if (value < 0) {
            value = max + value % max;
          }
        } else if (value < 0) {
          value = 0;
        } else if (value > max) {
          value = max;
        }
        return value;
      }
    }

    loss(filters) {
      // Argument is array of percentages.
      const color = this.reusedColor;
      color.set(0, 0, 0);

      color.invert(filters[0] / 100);
      color.sepia(filters[1] / 100);
      color.saturate(filters[2] / 100);
      color.hueRotate(filters[3] * 3.6);
      color.brightness(filters[4] / 100);
      color.contrast(filters[5] / 100);

      const colorHSL = color.hsl();
      return (
        Math.abs(color.r - this.target.r) +
        Math.abs(color.g - this.target.g) +
        Math.abs(color.b - this.target.b) +
        Math.abs(colorHSL.h - this.targetHSL.h) +
        Math.abs(colorHSL.s - this.targetHSL.s) +
        Math.abs(colorHSL.l - this.targetHSL.l)
      );
    }

    css(filters) {
      function fmt(idx, multiplier = 1) {
        return Math.round(filters[idx] * multiplier);
      }
      return `filter: invert(${fmt(0)}%) sepia(${fmt(1)}%) saturate(${fmt(2)}%) hue-rotate(${fmt(3, 3.6)}deg) brightness(${fmt(4)}%) contrast(${fmt(5)}%);`;
    }
  }
  function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
      : null;
  }

function load_industry_pie(label_data) {
    const start_year = 1950;
    const latest_year = 2016;
    const label_height = 30
    const label_width = 30;
    const industry_label_color = 'white';
    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
    const num_of_layers = latest_year - start_year;
    const margin = 80


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
        "Farming_Agriculture": {},
        "Manufacturing": {}
    }
    var row_colors = {}
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
            var row_color= color(d.Row);
            var rgb = hexToRgb(row_color);
            if (rgb.length !== 3) {
              alert('Invalid format!');
            }

            var what_color = new Color(rgb[0], rgb[1], rgb[2]);
            var solver = new Solver(what_color);
            var result = solver.solve();
            row_colors[d.Row] = [row_color, result.filter]
            console.log(d.Row,rgb[0],rgb[1],rgb[2], row_colors[d.Row])

            return row_color
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
function show_pie(opacity, label_opacity, transition_time, industry_pie_transform_values) {
    d3.selectAll('#id_g_pie').raise().transition().duration(transition_time).style("opacity", opacity);
    d3.selectAll('#id_pie_text').raise().transition().duration(transition_time).style("opacity", label_opacity);
    // if (opacity > 0) {
    //     for (const [row, transform_value] of Object.entries(industry_pie_transform_values)) {
    //         pie_label_transform(transition_time, row, transform_value)
    //     }
    // }
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
