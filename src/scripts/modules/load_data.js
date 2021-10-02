function loadJSON(callback) {

	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', '../data/population-by-age.csv', true); // Replace 'my_data' with the path to your file
	xobj.onreadystatechange = function () {
		if (xobj.readyState == 4 && xobj.status == "200") {
			// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
			callback(xobj.responseText);
		}
	};
	xobj.send(null);
}
function processCSVData(allText) {
	var record_num = 5;  // or however many elements there are in each row
	var allTextLines = allText.split(/\r\n|\n/);
	var entries = allTextLines[0].split(',');
	var lines = [];

	var headings = entries.splice(0, record_num);
	while (entries.length > 0) {
		var tarr = [];
		for (var j = 0; j < record_num; j++) {
			tarr.push(headings[j] + ":" + entries.shift());
		}
		lines.push(tarr);
	}
	// alert(lines);
}


export { loadJSON, processCSVData };
