require({
    packages: [
        {
            name: 'd3', location: '//d3js.org', main: 'd3.v4.min'
        }
    ]
});
define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask", "esri/graphicsUtils", "d3"
],
function ( declare, Query, QueryTask, graphicsUtils, d3 ) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				t.jurisdictions = 2;
				$("#" + t.id + "chooseGeography").chosen({allow_single_deselect:false, width:"98%"})
					.change(function(c){
						var v = c.target.value;
						console.log(v)
					});

				$("#" + t.id + "ebOptDiv input").click(function(c){
					var v = c.currentTarget.value;
					$(".mr-section-wrap").hide();
					$("#" + t.id + v).show();
				})	
			},
			buildPieChart: function(t){
				var tau = 2 * Math.PI; // http://tauday.com/tau-manifesto

				// An arc function with all values bound except the endAngle. So, to compute an
				// SVG path string for a given angle, we pass an object with an endAngle
				// property to the `arc` function, and it will return the corresponding string.
				var arc = d3.arc()
				    .innerRadius(25)
				    .outerRadius(40)
				    .startAngle(0);

				// Get the SVG container, and apply a transform such that the origin is the
				// center of the canvas. This way, we don’t need to position arcs individually.
				var svg = d3.select(".pie1"),
				    width = +svg.attr("width"),
				    height = +svg.attr("height"),
				    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");	
				
				g.append("text")
				 	.attr("text-anchor", "middle")
				 	.attr('font-size', '16px')
				 	.attr('y', 5)
				 	.text("15%");

				// Add the background arc, from 0 to 100% (tau).
				var background = g.append("path")
				    .datum({endAngle: tau})
				    .style("fill", "#ddd")
				    .attr("d", arc);

				// Add the foreground arc in orange, currently showing 12.7%.
				var foreground = g.append("path")
				    .datum({endAngle: 0.15 * tau})
				    .style("fill", "#558139")
				    .attr("d", arc);
				console.log(0.127 * tau)
				// Every so often, start a transition to a new random angle. The attrTween
				// definition is encapsulated in a separate function (a closure) below.
				t.p = 0.55;
				$("#" + t.id + "pie1Up").click(function(){
				   foreground.transition()
				      .duration(750)
				      .attrTween("d", arcTween(t.p*tau))
				});

				// Returns a tween for a transition’s "d" attribute, transitioning any selected
				// arcs from their current angle to the specified new angle.
				function arcTween(newAngle) {
					console.log(newAngle)
					g.select("text")
						.text(Math.round(t.p*100) + "%")	
				  // The function passed to attrTween is invoked for each selected element when
				  // the transition starts, and for each element returns the interpolator to use
				  // over the course of transition. This function is thus responsible for
				  // determining the starting angle of the transition (which is pulled from the
				  // element’s bound datum, d.endAngle), and the ending angle (simply the
				  // newAngle argument to the enclosing function).
				  return function(d) {

				    // To interpolate between the two angles, we use the default d3.interpolate.
				    // (Internally, this maps to d3.interpolateNumber, since both of the
				    // arguments to d3.interpolate are numbers.) The returned function takes a
				    // single argument t and returns a number between the starting angle and the
				    // ending angle. When t = 0, it returns d.endAngle; when t = 1, it returns
				    // newAngle; and for 0 < t < 1 it returns an angle in-between.
				    var interpolate = d3.interpolate(d.endAngle, newAngle);

				    // The return value of the attrTween is also a function: the function that
				    // we want to run for each tick of the transition. Because we used
				    // attrTween("d"), the return value of this last function will be set to the
				    // "d" attribute at every tick. (It’s also possible to use transition.tween
				    // to run arbitrary code for every tick, say if you want to set multiple
				    // attributes from a single function.) The argument t ranges from 0, at the
				    // start of the transition, to 1, at the end.
				    return function(t) {

				      // Calculate the current arc angle based on the transition time, t. Since
				      // the t for the transition and the t for the interpolate both range from
				      // 0 to 1, we can pass t directly to the interpolator.
				      //
				      // Note that the interpolated angle is written into the element’s bound
				      // data object! This is important: it means that if the transition were
				      // interrupted, the data bound to the element would still be consistent
				      // with its appearance. Whenever we start a new arc transition, the
				      // correct starting angle can be inferred from the data.
				      d.endAngle = interpolate(t);

				      // Lastly, compute the arc path given the updated data! In effect, this
				      // transition uses data-space interpolation: the data is interpolated
				      // (that is, the end angle) rather than the path string itself.
				      // Interpolating the angles in polar coordinates, rather than the raw path
				      // string, produces valid intermediate arcs during the transition.
				      return arc(d);
				    };
				  };
				}






				// var data = [
				//     {name: 'dogs', count: 59, color: '#558139'},
			 //    	{name: 'cats', count: 41, color: '#AAD091'},
			 //    ];
			 //    var totalCount = 59;		
			    
			 //    var width = 100,
			 //    height = 100,
			 //    radius = 50;

				// var arc = d3.arc()
				// 	.outerRadius(radius - 10)
				// 	.innerRadius(25);

				// var pie = d3.pie()
				// 	.sort(null)
				// 	.value(function(d) {
				// 	    return d.count;
				// 	});

				// var svg = d3.select("#" + t.id + 'pie1').append("svg")
				// 	.attr("width", width)
				// 	.attr("height", height)
				// 	.append("g")
				// 	.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

			 //    var g = svg.selectAll(".arc")
			 //      .data(pie(data))
			 //      .enter().append("g");    

			 //   	g.append("path")
			 //    	.attr("d", arc)
				// 	.style("fill", function(d,i) {
				// 		return d.data.color;
				// 	});

 			//     g.append("text")
				// 	.attr("text-anchor", "middle")
				// 	.attr('font-size', '16px')
				// 	.attr('y', 5)
				// 	.text(totalCount + "%");

				// $("#" + t.id + "pie1Up").click(function(){
				// 	var data = [
				//     	{name: 'dogs', count: 75, color: '#558139'},
			 //    		{name: 'cats', count: 25, color: '#AAD091'},
			 //    	];
					
			 //    	// var g = svg.selectAll(".arc")
				// 	// 	.data(pie(data))
				// 	// 	.enter().append("g"); 
				// 	// g.append("path")
			 //  //   		.attr("d", arc)
				// 	// 	.style("fill", function(d,i) {
				// 	// 	return d.data.color;
				// 	// });
				// })	
			},
			updateBarGraphs: function(t){
				
			},
			numberWithCommas: function(x){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
        });
    }
);
