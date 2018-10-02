define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color", "dojo/_base/lang",
	"esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters",
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, Graphic, Color, lang,
			IdentifyTask, IdentifyParameters) {
        "use strict";

        return declare(null, {
			esriApiFunctions: function(t){	
				// Add dynamic map service
				t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:0.6});
				t.map.addLayer(t.dynamicLayer);
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				t.dynamicLayer.on("load", function () { 			
					t.layersArray = t.dynamicLayer.layerInfos;
					// Query all features 
					var q = new Query();
					var qt = new QueryTask(t.url + "/" + t.geography );
					q.where = "OBJECTID > -1";
					q.returnGeometry = false;
					q.outFields = ["*"];
					t.atts = [];
					qt.execute(q, function(e){
						t.features = e.features;
						$("#" + t.id + "chooseGeography").append("<option></option>")
						var cntry = [];
						$.each(e.features,function(i,v){
							t.atts.push(v.attributes)
							var c = v.attributes.CNTRY_NAME;
							if (c != "Global"){
								cntry.push(c)
							}
						})		
						var cs = cntry.sort();
						$.each(cs,function(i,v){
							$("#" + t.id + "chooseGeography").append("<option value='"+v+"'>"+v+"</option>")	
						})
						$("#" + t.id + "chooseGeography").trigger("chosen:updated");
					});	

					$("#" + t.id + "ebOptDiv input[value='" + t.obj.ebOpt + "']").trigger("click");
					// Save and Share Handler					
					if (t.obj.stateSet == "yes"){
						//extent
						var extent = new Extent(t.obj.extent.xmin, t.obj.extent.ymin, t.obj.extent.xmax, t.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
						t.map.setExtent(extent, true);
						t.obj.stateSet = "no";
					}	
				});
				t.sym1  = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([88,116,215,1]), 1), new Color([88,116,215]);
				t.sym2  = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([168,0,132]), 1), new Color([168,0,132]);

				t.map.on("extent-change",function(){
					t.map.setMapCursor("pointer");
				})
			},
			clearAtts: function(t){
				t.map.graphics.clear();
			} 				
		});
    }
);