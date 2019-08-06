define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color", "dojo/_base/lang",
	"esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters", "esri/request"
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, Graphic, Color, lang,
			IdentifyTask, IdentifyParameters, esriRequest) {
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
					var qt = new QueryTask(t.url + "/" + t.geoEnv );
					q.where = "OBJECTID > -1";
					q.returnGeometry = false;
					q.outFields = ["*"];
					t.atts = [];
					qt.execute(q, function(e){
						t.features = e.features;
						$("#" + t.id + "chooseGeography").append("<option></option>")
						var cntry = [];
						var region = [];
						$.each(e.features,function(i,v){
							t.atts.push(v.attributes)
							if (v.attributes.GeoType == "Country"){
								cntry.push(v.attributes.CNTRY_NAME)
							}
							if (v.attributes.GeoType == "Region"){
								region.push(v.attributes.CNTRY_NAME)
							}	
						})		
						var cs = cntry.sort();
						var rg = region.sort();
						$.each(cs,function(i,v){
							var v1 = v;
							if (v == "Côte dIvoire"){
								v1 = "Côte d'Ivoire";
							}
							$("#" + t.id + "countryOg").append("<option value='"+v+"'>"+v1+"</option>")	
						})
						$.each(rg,function(i,v){
							$("#" + t.id + "regionOg").append("<option value='"+v+"'>"+v+"</option>")	
						})
						$("#" + t.id + "chooseGeography").val("Global").trigger("chosen:updated").trigger("change");
						//$("#show-single-plugin-mode-help").trigger("click")
						// get legend items as json
						var legendRequest = esriRequest({
							url: t.url + "/legend",
							content: { f: "json" },
							handleAs: "json",
							callbackParamName: "callback"
						});
						legendRequest.then(
							function(response) {
								t.legendItems = response.layers;
								$(`#${t.id}manType`).trigger('click');
							}, function(error) {
								console.log("Error: ", error.message);
							}
						);
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

				t.map.on("update-start",function(){
					t.map.setMapCursor("wait")
					$(".geoNum").css("cursor","wait")
				})
				t.map.on("update-end",function(){
					t.map.setMapCursor("pointer")
					$(".geoNum").css("cursor","pointer")
				})
				t.map.on("extent-change",function(){
				 	t.clicks.scaleChange(t);
				})
			},
			clearAtts: function(t){
				t.map.graphics.clear();
			} 				
		});
    }
);