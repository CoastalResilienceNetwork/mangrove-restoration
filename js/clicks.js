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
				// global variables
				t.p = 0.55;
				t.p1 = 0.55;
				t.geography = 2;
				t.typology = 0;
				// switch between geography and typology 	
				$("#" + t.id + "ebOptDiv input").click(function(c){
					var v = c.currentTarget.value;
					$(".mr-section-wrap").hide();
					$("#" + t.id + v).show();
					t.obj.ebOpt = v;
					t.map.graphics.clear();
					$("#" + t.id + "chooseGeography").val("").trigger("chosen:updated").change();
					$(".typeStatsWrap").slideUp();
					t.map.setMapCursor("pointer");
				})	
				// reference layer clicks
				$("#" + t.id + "ref-wrap input").click(function(c){
					var ln = c.currentTarget.value;
					if (c.currentTarget.checked){
						t.obj.visibleLayers.push(ln);	
					}else{
						var index = t.obj.visibleLayers.indexOf(ln);
						if (index > -1){
							t.obj.visibleLayers.splice(index, 1);
						}
					}
					
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers)

				})
			},
			geographySetup: function(t){
				// build  geography pie chart
				var tau = 2 * Math.PI;
				var arc = d3.arc()
				    .innerRadius(25)
				    .outerRadius(40)
				    .startAngle(0);
				var svg = d3.select(".pie1"),
				    width = +svg.attr("width"),
				    height = +svg.attr("height"),
				    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");	
				g.append("text")
				 	.attr("text-anchor", "middle")
				 	.attr('font-size', '16px')
				 	.attr('font-weight', 'bold')
				 	.attr('fill', '#438c9d')
				 	.attr('y', 5)
				 	.text("15%");
				var background = g.append("path")
				    .datum({endAngle: tau})
				    .style("fill", "#ddd")
				    .attr("d", arc);
				var foreground = g.append("path")
				    .datum({endAngle: 0.15 * tau})
				    .style("fill", "#558139")
				    .attr("d", arc);
				function startTransition(){ 
				   foreground.transition()
				      .duration(750)
				      .attrTween("d", arcTween(t.p*tau))
				}      
				function arcTween(newAngle) {
					g.select("text")
						.text(Math.round(t.p*100) + "%")	
					return function(d) {
						var interpolate = d3.interpolate(d.endAngle, newAngle);
						return function(t) {
							d.endAngle = interpolate(t);
							return arc(d);
				    	}
				  	};
				}	
				// chosen country dropdown menu
				$("#" + t.id + "chooseGeography").chosen({allow_single_deselect:false, width:"98%"})
					.change(function(c){
						var c = c.target.value;
						if (c){
							t.obj.country = c;
							var q = new Query();
							var qt = new QueryTask(t.url + "/" + t.geography );
							q.where = "CNTRY_NAME ='" + c + "'";
							q.returnGeometry = true;
							q.outFields = ["*"];
							qt.execute(q, function(e){
								t.map.graphics.clear();
								t.csym = e.features[0];
								t.csym.setSymbol(t.sym1);
								t.map.graphics.add(t.csym);
								var ext = new esri.geometry.Extent(e.features[0].geometry.getExtent())
								t.map.setExtent(ext,true);
								if ( $("#" + t.id + "t3res1")[0].checked ){
									t.clicks.showTopThree(t);
								}	
							})
							$.each(t.atts,function(i,v){
								if (c == v.CNTRY_NAME){
									$(".geoStatsWrap").slideDown();
									t.p = v.Mean_Score/100;
									startTransition();
									$("#" + t.id + "geography .geoNum span").each(function(i1,v1){
										var field = v1.id.split("-").pop();
										if (field.length > 0){
											var n = t.clicks.numberWithCommas(Math.round(v[field]))
											$(v1).html(n);
										}	
									})
								}
							})
							t.layerDefs[t.geography] = q.where;
						}else{
							$(".geoStatsWrap").slideUp();
						}	
					});	
				$("#" + t.id + "t3res1").click(function(c){
					if (c.currentTarget.checked){
						t.clicks.showTopThree(t);
					}else{
						t.map.graphics.clear();
						t.csym.setSymbol(t.sym1);
						t.map.graphics.add(t.csym);
					}	
				})	
			},
			showTopThree: function(t){
				var q = new Query();
				var qt = new QueryTask(t.url + "/" + t.typology );
				q.where = "Juris ='" + t.obj.country + "'";
				q.returnGeometry = true;
				q.outFields = ["*"];
				qt.execute(q, function(e){
					$.each(e.features,function(i,v){
						var f = v;
						f.setSymbol(t.sym2);
						t.map.graphics.add(f);
					})
				});	
			},
			typologySetup:function(t){
				// build  typography pie chart
				var tau = 2 * Math.PI;
				var arc = d3.arc()
				    .innerRadius(25)
				    .outerRadius(40)
				    .startAngle(0);
				var svg = d3.select(".pie2"),
				    width = +svg.attr("width"),
				    height = +svg.attr("height"),
				    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");	
				g.append("text")
				 	.attr("text-anchor", "middle")
				 	.attr('font-size', '16px')
				 	.attr('font-weight', 'bold')
				 	.attr('fill', '#438c9d')
				 	.attr('y', 5)
				 	.text("15%");
				var background = g.append("path")
				    .datum({endAngle: tau})
				    .style("fill", "#ddd")
				    .attr("d", arc);
				var foreground = g.append("path")
				    .datum({endAngle: 0.15 * tau})
				    .style("fill", "#558139")
				    .attr("d", arc);
				function startTransition(){ 
				   foreground.transition()
				      .duration(750)
				      .attrTween("d", arcTween(t.p1*tau))
				}      
				function arcTween(newAngle) {
					g.select("text")
						.text(Math.round(t.p1*100) + "%")	
					return function(d) {
						var interpolate = d3.interpolate(d.endAngle, newAngle);
						return function(t) {
							d.endAngle = interpolate(t);
							return arc(d);
				    	}
				  	};
				}
				// build typography bar chart
				var data1 = [{"inputs":"Proportion of lost mangrove contiguous with extant","barval":66, "label":"25%", "field": "Prop_loss"},
							{"inputs":"Median patch size","barval":33, "label":"Low", "field": "Med_Patch"}, {"inputs":"Sediment change","barval":100, "label":"None", "field": "Sediment"},
							{"inputs":"Time since loss","barval":66, "label":"Pre-2007", "field": "Time_Loss"}, {"inputs":"Future SLR","barval":66, "label":"None", "field": "Future_SLR"},
							{"inputs":"Antecedent SLR","barval":33, "label":"High", "field": "Ant_SLR"}, {"inputs":"Tidal range","barval":25, "label":"Meso", "field": "Tidal_range"}];			

				// set the dimensions and margins of the graph
				var margin = {top: 20, right: 80, bottom: 10, left: 140},
					width = 310 - margin.left - margin.right,
					height = 200 - margin.top - margin.bottom;

				// set the ranges
				var y = d3.scaleBand()
					.range([height, 0])
					.padding(0.1);

				var x = d3.scaleLinear()
					.range([0, width]);
				          
				// format the data
				data1.forEach(function(d) {
						d.barval = +d.barval;
					});

				// append the svg object to the body of the page, append a 'group' element to 'svg', moves the 'group' element to the top left margin
				var svg = d3.select("#" + t.id + "barDiv").append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

				var wc = 0;	
				function updateBar(data1){
					// Scale the range of the data in the domains
					x.domain([0, d3.max(data1, function(d){ return d.barval; })])
					y.domain(data1.map(function(d) { return d.inputs; }));	
					
					var bar = svg.selectAll(".bar")
			        	      .data(data1);
					var barExit = bar.exit().remove();
					var barEnter = bar.enter()
									.append("g")
									.attr("class", "bar");

			        var barRects = barEnter.append("rect")
			            .attr("x", function(d) {
				            return x(0);
				        })
			        	.attr("y", function(d) { return y(d.inputs); })
			        	.attr("width", function(d) {return x(d.barval); } )   
			        	.attr("height", y.bandwidth())

					var barTexts = barEnter.append("text")
						.attr("x", (function(d) { return x(d.barval) + 4; }  ))
						.attr("y", (function(d) { return y(d.inputs) + 4; }  ))
						.attr("fill", "#438c9d")
						.attr("dy", ".75em")
						.text(function(d) { return d.label; })

					var barRectUpdate = bar.select("rect")
						.transition()
						.duration(750)
						.attr("x", function(d) {
							return x(0);
						})
						.attr("y", function(d) { return y(d.inputs); })
			        	.attr("width", function(d) {return x(d.barval); } )   
			        	.attr("height", y.bandwidth())		

			        var barTextsUpdate = bar.select("text")
						.transition()
           				.duration(750)
           				.attr("x", (function(d) { return x(d.barval) + 4; }  ))
						.attr("y", (function(d) { return y(d.inputs) + 4; }  ))
						.attr("dy", ".75em")
						.text(function(d) { return d.label; })

					if (wc == 0){
						svg.selectAll(".tick text")
    	  					.call(wrap, 155);	
	    			}
	      		}		
	      		updateBar(data1);
	      		
	      		// add the y Axis
				svg.append("g")
					.call(d3.axisLeft(y))
					.attr("font-size", 11)

				svg.selectAll(".tick text")
      				.call(wrap, 155);

	      		function updateBarData(atts){
	      			var fields = [ ["Tidal_range","Tidal_range_1"],["Ant_SLR","Ant_SLR1"], ["Future_SLR","Future_SLR1"], ["Time_Loss","Time_Loss1"],
	      						   ["Sediment","Sediment1"], ["Med_Patch","Med_Patch1"], ["Prop_loss","Prop_loss"] ]
	      			$.each(data1,function(i,v){
						$.each(fields,function(i1,v1){
							if (v.field == v1[0]){
								v.barval = atts[v1[1]]
								var lbl = atts[v1[0]];
								if (isNaN(lbl)){
									v.label = lbl	
								}else{
									v.label = Math.round(lbl) + "%"
								}
							}
						})
	      			})
	      			updateBar(data1)
	      			wc = 1;
	      		}

      			//wraps text for long labels
				function wrap(text, width) {
					  text.each(function() {
					    var text = d3.select(this),
					        words = text.text().split(/\s+/).reverse(),
					        word,
					        line = [],
					        lineNumber = 0,
					        lineHeight = 1.1 
					    var y = text.attr("y"),
					        dy = parseFloat(text.attr("dy"));
					    var tspan = text.text(null).append("tspan").attr("x", -5).attr("y", y).attr("dy", dy + "em");
					    while (word = words.pop()) {
					      line.push(word);
					      tspan.text(line.join(" "));
					      if (tspan.node().getComputedTextLength() > width) {
					        tspan.attr("y", -5);
					        line.pop();
					        tspan.text(line.join(" "));
					        line = [word];
					        tspan = text.append("tspan").attr("x", -5).attr("y", y-5).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
					      }
					    }
					  });
					}



				// map clicks
				t.map.on("click",function(c){
					if (t.open == "yes"){
						if (t.obj.ebOpt == "geography"){
							var q = new Query();
							var qt = new QueryTask(t.url + "/" + t.geography);
							q.geometry = c.mapPoint;
							q.where = "CNTRY_NAME <> 'Global'";
							q.returnGeometry = false;
							qt.execute(q, function(e){
								if (e.features[0]){
									var c = e.features[0].attributes.CNTRY_NAME;
									$("#" + t.id + "chooseGeography").val(c).trigger("chosen:updated").change();
								}
								t.map.setMapCursor("pointer");	
							})
						}
						if (t.obj.ebOpt == "typology"){
							var q = new Query();
							var qt = new QueryTask(t.url + "/" + t.typology);
							q.geometry = c.mapPoint;
							q.outFields = ["*"];
							q.returnGeometry = true;
							t.map.graphics.clear();
							qt.execute(q, function(e){
								if (e.features[0]){
									//add graphics
									var f = e.features[0];
									f.setSymbol(t.sym2);
									t.map.graphics.add(f);
									//define attributes
									var atts = e.features[0].attributes;
									//send data to typology ie chart
									t.p1 = atts.Rest_Score/100;
									startTransition();
									//set up and send data to bar chart
									updateBarData(atts);
									// populate attribute fields
									$("#" + t.id + "typology .geoNum span").each(function(i1,v1){
										var field = v1.id.split("-").pop();
										if ( field.slice(-1) == "_" ){
											field = field.slice(0, -1);
										}
										if (field.length > 0){
											if (isNaN(atts[field])){
												$(v1).html(atts[field])
											}else{
												var n = t.clicks.numberWithCommas(Math.round(atts[field]))
												$(v1).html(n);
											}	
										}	
									})
									t.map.setMapCursor("pointer");
									$(".typeStatsWrap").slideDown();
								}	
							})
						}
					}
				})
			},
			buildPieChart: function(t){
				
			},
			updateBarGraphs: function(t){
				
			},
			numberWithCommas: function(x){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
        });
    }
);
