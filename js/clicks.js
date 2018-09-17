define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask", "esri/graphicsUtils"
],
function ( declare, Query, QueryTask, graphicsUtils ) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				t.jurisdictions = 2;
				$("#" + t.id + "chooseGeography").chosen({allow_single_deselect:false, width:"255px"})
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
			updateBarGraphs: function(t){
				
			},
			numberWithCommas: function(x){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
        });
    }
);
