dc.calendarChart = function (parent, chartGroup) {

var thisYear = new Date().getFullYear();
var _chart = dc.marginMixin(dc.baseMixin({}));
var color;
var width = 900,
	height = 120,
	cellSize = 16; // cell size
	_chart.SELECTED_CLASS = "day-selected";
	_chart.DESELECTED_CLASS = "day-deselected";
	_chart.range = d3.range(thisYear, thisYear + 1);

var day = d3.time.format("%w"),
	week = d3.time.format("%U"),
	percent = d3.format(".1%"),
	format = d3.time.format("%Y-%m-%d"),
	fullMonth = d3.time.format("%b");

var dowMap = {
	"M" : 2,
	"W" : 4,
	"F" : 6
	};

_chart._doRedraw = function() {
	_chart._doRender();
	_highlightFilters();
	return _chart;
};

_chart._doRender = function () {
	d3.select("#"+ _chart.anchorName())
		.selectAll("svg")
		.remove();

	var svg = d3.select("#"+ _chart.anchorName())
		.selectAll("svg")
		.data(_chart.range)
		.enter().append("svg")
		.style("padding",'3px')
		.attr("width", width + _chart.margins().left + (cellSize * 3))
		.attr("height", height + _chart.margins().top + cellSize)
		.attr("class", "RdYlGn")
		.append("g")
		.attr("transform", "translate(" + _chart.margins().left + "," + _chart.margins().top + ")");

	svg.append("text")
		.attr("transform", "translate(-16," + cellSize * 3.5 + ")rotate(-90)")
		.style("text-anchor", "middle")
		.text(function(d) { return d; });

	if(_chart.renderTitle()){
		var dowLabel = svg.selectAll('.dowLabel')
			.data(function(d){return ["M","W","F"];})
			.enter().append("text")
			.attr('transform', function(d){
			
			return "translate(-15," + parseInt((cellSize * dowMap[d]) - 3) + ")";})
			.text(function(d) { return d; })
			.attr("style","font-weight : bold");
	}

	var rect = svg.selectAll(".day")
		.data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
		.enter()
		.append("rect")
		.attr("class", "day")
		.attr("width", cellSize)
		.attr("height", cellSize)
		.attr("x", function(d) { return week(d) * cellSize; })
		.attr("y", function(d) { return day(d) * cellSize; });
		//.datum(format);
		// .attr("data-ot",function(d){
		//   return d;
		// });

	if(_chart.renderTitle()){
		rect.append("title")
			.text(function(d) { return d; });
	}

	var monthLabel = svg.selectAll(".monthLabel")
		.data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
		.enter().append("text")
		.text(function(d){ return fullMonth(d);})
		.attr("x", function(d){return week(d) * cellSize /*+ cellSize*/;})
		.attr("y", -3)
		.attr("class","monthLabel");

	var data = d3.nest()
		.key(function(d) { return d.key; })
		.rollup(function(d) { 
		return _chart.valueAccessor()(d);
		})
		.map(_chart.data());

	if(!color){
		color = d3.scale.quantize()
			.domain([-4,4])
			.range(d3.range(11).map(function(d) { 
				return "q" + d + "-11"; 
			}));
	}

	rect.filter(function(d) { 
			var date = simpleDate(d);
			return date in data; 
		})
		.attr("class", function(d) { 
			var date = simpleDate(d);
			return "day " + color(data[date]); })
		.on('click', onClick);
		// .attr("data-ot",function(d){
		// 	var date = simpleDate(d);
		// 	return d + ": " + data[date].toFixed(2) + " Daily Average";
		// });

	if(_chart.renderTitle()){
		rect.filter(function(d) { 
			var date = simpleDate(d);
			return date in data; })
		.select("title")
		.text(function(d) { 
			var date = simpleDate(d);
			return date + ": " + data[date].toFixed(2) + " Daily Average";
		});
	}
	return _chart;
};

function onClick(d, i) {
	var dateClicked = simpleDate(d);
	_chart.group().all().forEach(function(datum){
		if(datum.key === dateClicked){
			_chart.onClick(datum, i);
		}
	});
}

function prefixZero(value) {
	var s = value + "";
	if(s.length === 1){
		return "0" + value;
	}else{
		return value;
	}
}

function simpleDate(date){
	return date.getFullYear() + "-" + prefixZero(date.getMonth() + 1) + "-" + prefixZero(date.getDate());
}

_chart.legendables = function () {
	// do nothing in base, should be overridden by sub-function
	return [];
};

_chart.legendHighlight = function (d) {
	// do nothing in base, should be overridden by sub-function
};

_chart.legendReset = function (d) {
	// do nothing in base, should be overridden by sub-function
};

_chart.legendToggle = function (d) {
	// do nothing in base, should be overriden by sub-function
};

_chart.isLegendableHidden = function (d) {
	// do nothing in base, should be overridden by sub-function
	return false;
};

//custom overrides for calendarChart since standard selected and deselected
//classes for DC make the chart look bad
_chart.highlightSelected = function (e) {
	d3.select(e).classed(_chart.SELECTED_CLASS, true);
	d3.select(e).classed(_chart.DESELECTED_CLASS, false);
};

_chart.fadeDeselected = function (e) {
	d3.select(e).classed(_chart.SELECTED_CLASS, false);
	d3.select(e).classed(_chart.DESELECTED_CLASS, true);
};

_chart.resetHighlight = function (e) {
	d3.select(e).classed(_chart.SELECTED_CLASS, false);
	d3.select(e).classed(_chart.DESELECTED_CLASS, false);
};

_chart.rangeYears = function(range){
	_chart.range = d3.range(range[0], range[1]);
	return _chart;
}

function _highlightFilters() {
	if (_chart.hasFilter()) {
		var chartData = _chart.group().all();
		_chart.root().selectAll('.day').each(function (d) {
			if (_chart.hasFilter(simpleDate(d))) {
				_chart.highlightSelected(this);
			}
			else {
				_chart.fadeDeselected(this);
			}
		});
	}
	else {
	  _chart.root().selectAll('.day').each(function (d) {
	    _chart.resetHighlight(this);
	  });
	}
}

return _chart.anchor(parent, chartGroup);
};