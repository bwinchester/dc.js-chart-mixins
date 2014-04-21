dc.js-chart-mixins
==================

The Missing dc.js charts you want, but could never have

[Example Github contribution chart in dc.js and crossfilter](http://bwinchester.github.io/dc.js-chart-mixins/)

> Note: You will need to understand [Crossfilter Map-Reduce](https://github.com/square/crossfilter/wiki/API-Reference#group-map-reduce) to do any significant heat mapping with dc.js or Crossfilter

What your code needs:
==================

```
// Include the chart-mixin JS you want to add to dc.js

<script type="text/javascript" src="calendar-chart.js"></script>
```

```
//Init your calendar chart

var calendarChart = dc.calendarChart('#daily-volume-chart');
```

```
//Set your crossfilter dimension and group map-reduce functions

var calendarDimension = ndx.dimension(function (datum) {
        //("%Y-%m-%d")
        return datum.calDate;
    });

var calendarGroup = calendarDimension.group().reduce(
    /* callback for when data is added to the current filter results */
    function (p, v) {
        ++p.count;
        p.absGain += v.close - v.open;
        p.fluctuation += Math.abs(v.close - v.open);
        p.sumIndex += (v.open + v.close) / 2;
        p.avgIndex = p.sumIndex / p.count;
        p.percentageGain = (p.absGain / p.avgIndex) * 100;
        p.fluctuationPercentage = (p.fluctuation / p.avgIndex) * 100;
        return p;
    },
    /* callback for when data is removed from the current filter results */
    function (p, v) {
        --p.count;
        p.absGain -= v.close - v.open;
        p.fluctuation -= Math.abs(v.close - v.open);
        p.sumIndex -= (v.open + v.close) / 2;
        p.avgIndex = p.sumIndex / p.count;
        p.percentageGain = (p.absGain / p.avgIndex) * 100;
        p.fluctuationPercentage = (p.fluctuation / p.avgIndex) * 100;
        return p;
    },
    /* initialize p */
    function () {
        return {count: 0, absGain: 0, fluctuation: 0, fluctuationPercentage: 0, sumIndex: 0, avgIndex: 0, percentageGain: 0};
    }
);
```

```
// Set your chart options and data/dimensions

    calendarChart.width(900)
        .height(130)
        .dimension(calendarDimension)
        .group(calendarGroup)
        .valueAccessor(function (p) {
            return p[0].value.percentageGain;
        })
        .rangeYears([2010,2013])
        .renderTitle(true);

```

```
// Add .render() to the end of your chart ^^Above or tell dc to renderAll

dc.renderAll();
```
