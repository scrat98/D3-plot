window.addEventListener("load", initGraph);

let data = [];
let svg;

function initGraph() {
    svg = d3.select("#graph").append("svg")
        .attr("width", "95%")
        .attr("height", "95%");

    d3.select("window").on("resize", updateGraph);
    d3.selectAll(".toggle").on("transitionend", updateGraph);

    let dataInput = document.getElementById("data-input");
    d3.select("#data-input")
        .on("keypress", () => {
            if (d3.event.keyCode === 13) {
                addPoint(new Date(), dataInput.value);
                dataInput.value = "";
            }
        });

    d3.select("#data-clear")
        .on("click", () => {
            data = [];
            d3.selectAll(".value").remove();
            dataInput.value = "";
            updateGraph();
        });

    svg.append("path")
        .attr("class", "line");

    updateGraph();
}

function addPoint(x, y) {
    if (!parseFloat(y) && parseFloat(y) !== 0) {
        return;
    }

    let point = {x: x, y: y};
    data.push(point);
    createValueContainer(point);

    updateGraph();
}

function createValueContainer(point) {
    let time = point.x;

    let container = document.getElementById("values-container");

    let valueContainer = document.createElement("div");
    valueContainer.className = "value";

    let timeSpan = document.createElement("span");
    timeSpan.textContent = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
    valueContainer.appendChild(timeSpan);

    let valueSpan = document.createElement("span");
    valueSpan.innerHTML = `<b>${point.y}</b>`;
    valueContainer.appendChild(valueSpan);

    let removeButton = document.createElement("input");
    removeButton.type = "button";
    removeButton.value = "Remove";
    removeButton.onclick = () => {
        data.splice(data.indexOf(point), 1);
        container.removeChild(valueContainer);
        updateGraph();
    };
    valueContainer.appendChild(removeButton);

    container.appendChild(valueContainer);
}

function updateGraph() {
    let box = svg.node().getBoundingClientRect();
    let width = box.width;
    let height = box.height;

    let x_scale = d3.scaleTime()
        .domain(d3.extent(data, d => d.x))
        .range([32, width - 32]);

    let y_scale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.y))
        .range([height - 32, 32]);

    let valueLine = d3.line()
        .x(d => x_scale(d.x))
        .y(d => y_scale(d.y));

    let points = svg.selectAll("text")
        .data(data)
        .attr("x", d => x_scale(d.x))
        .attr("y", d => y_scale(d.y))
        .attr("date", d => d.x)
        .attr("value", d => d.y)
        .text(d => d.y);

    points.enter().append("text")
        .attr("x", d => x_scale(d.x))
        .attr("y", d => y_scale(d.y))
        .attr("date", d => d.x)
        .attr("value", d => d.y)
        .text(d => d.y);

    points.exit().remove();

    svg.select("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueLine);
}