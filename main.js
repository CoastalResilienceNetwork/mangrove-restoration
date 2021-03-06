// // Pull in your favorite version of jquery 
require({ 
	packages: [{ name: "jquery", location: "https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/", main: "jquery.min" }] 
});
// Bring in dojo and javascript api classes as well as varObject.json, js files, and content.html
define([
	"dojo/_base/declare", "framework/PluginBase", "dijit/layout/ContentPane", "dojo/dom", "dojo/dom-style", "dojo/dom-geometry", "dojo/text!./obj.json", 
	"dojo/text!./html/content.html", './js/esriapi', './js/clicks', 'dojo/_base/lang', "esri/tasks/query", "esri/tasks/QueryTask"	
],
function ( 	declare, PluginBase, ContentPane, dom, domStyle, domGeom, obj, content, esriapi, clicks, lang, Query, QueryTask ) {
	return declare(PluginBase, {
		// The height and width are set here when an infographic is defined. When the user click Continue it rebuilds the app window with whatever you put in.
		toolbarName:"Mangrove Restoration", showServiceLayersInLegend:false, allowIdentifyWhenActive:false, rendered:false, resizable:false,
		hasCustomPrint:false, size:'custom', width:"450", hasHelp:false, fullName:"Mangrove Restoration",
		
		// First function called when the user clicks the pluging icon. 
		initialize: function (frameworkParameters) {
			// Access framework parameters
			declare.safeMixin(this, frameworkParameters);
			// Define object to access global variables from JSON object. Only add variables to varObject.json that are needed by Save and Share. 
			this.obj = dojo.eval("[" + obj + "]")[0];	
			this.url = "https://services2.coastalresilience.org/arcgis/rest/services/OceanWealth/Mangrove_Restoration/MapServer";
			this.layerDefs = [];
		},
		// Called after initialize at plugin startup (why the tests for undefined). Also called after deactivate when user closes app by clicking X. 
		hibernate: function () {
			if (this.appDiv != undefined){
				this.esriapi.clearAtts(this);
				this.obj.visibleLayers = [-1];
				this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
			}
			this.open = "no";
		},
		// Called after hibernate at app startup. Calls the render function which builds the plugins elements and functions.   
		activate: function (showHelpOnStart) {
			if (this.rendered == false) {
				this.rendered = true;							
				this.render();
				$(this.printButton).hide();
			}else{
				this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
			}
			$(`#map-utils-dropdown-button`).hide();
			this.open = "yes";
		},
		// Called when user hits the minimize '_' icon on the pluging. Also called before hibernate when users closes app by clicking 'X'.
		deactivate: function () {
			$(`#map-utils-dropdown-button`).show();
		},	
		// Called when user hits 'Save and Share' button. This creates the url that builds the app at a given state using JSON. 
		// Write anything to you varObject.json file you have tracked during user activity.		
		getState: function () {
			// remove this conditional statement when minimize is added
			if ( $('#' + this.id ).is(":visible") ){
				//extent
				this.obj.extent = this.map.geographicExtent;
				this.obj.stateSet = "yes";	
				var state = new Object();
				state = this.obj;
				return state;	
			}
		},
		// Called before activate only when plugin is started from a getState url. 
		//It's overwrites the default JSON definfed in initialize with the saved stae JSON.
		setState: function (state) {
			this.obj = state;
		},
		// Called when the user hits the print icon
		beforePrint: function(printDeferred, $printArea, mapObject) {
			printDeferred.resolve();
		},	
		// Called by activate and builds the plugins elements and functions
		render: function() {
			this.mapScale  = this.map.getScale();
			// BRING IN OTHER JS FILES
			this.clicks = new clicks();
			this.esriapi = new esriapi();
			// ADD HTML TO APP
			// Define Content Pane as HTML parent		
			this.appDiv = new ContentPane({style:'padding:8px; height:100%;'});
			this.id = this.appDiv.id
			dom.byId(this.container).appendChild(this.appDiv.domNode);	
			// hide minimize for this app
			//$('#' + this.id).parent().parent().find(".plugin-minimize").hide();
			if (this.obj.stateSet == "no"){
				$('#' + this.id).parent().parent().css('display', 'flex')
			}		
			// Get html from content.html, prepend appDiv.id to html element id's, and add to appDiv
			var idUpdate0 = content.replace(/for="/g, 'for="' + this.id);	
			var idUpdate = idUpdate0.replace(/id="/g, 'id="' + this.id);
			$('#' + this.id).html(idUpdate);
			// Add popup window for descriptions
			this.legDiv = new ContentPane({style:'padding:5px; color:#000; opacity: 1; z-index:1000; position:absolute; bottom:50px; right:10px; border-radius:5px; box-shadow: 0 1px 2px rgba(0,0,0,0.5); background:#fff;'});
			this.legID = this.legDiv.id;
			dom.byId('map-0').appendChild(this.legDiv.domNode);
			$('#' + this.legID).html(`
					<div class="hsLeg" id="showLeg" style="display:none;">Show Legend</div>
					<div id="legWrap">
						<div class="legDiv" id="legendContent">
							<div id="leg1"></div>
							<div id="leg2"></div>
						</div>
					</div>
					<div class="hsLeg" id="hideLeg">Minimize</div>
				`);
			$("#hideLeg").click(function(c){
				$("#legWrap").hide();
				$("#showLeg").show();
				$("#hideLeg").hide();
			})
			$("#showLeg").click(function(c){
				$("#showLeg").hide();
				$("#legWrap").show();
				$("#hideLeg").show();
			})
			// Click listeners
			this.clicks.eventListeners(this);
			this.clicks.geographySetup(this);
			this.clicks.typologySetup(this);
			// Create ESRI objects and event listeners	
			this.esriapi.esriApiFunctions(this);
			this.rendered = true;	
		}
	});
});
