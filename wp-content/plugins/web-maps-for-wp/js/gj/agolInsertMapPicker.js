define([
 'dojo/_base/declare',
 'dojo/dom',
 'dojo/dom-class',
 'dojo/dom-construct',
 'dojo/dom-style',
 'dojo/on',
 'dojo/query', 
 
 'dojox/widget/Standby',

 'dijit/Tooltip',

 'dijit/layout/ContentPane',
 'dijit/layout/TabContainer',

 'dijit/form/NumberTextBox',
 
 'esri/Graphic',
 'esri/widgets/Popup',
 'esri/views/MapView',
 'esri/portal/Portal', 
 'esri/WebMap',
 'dojo/domReady!'
], function(
  declare, dom, domClass, domConstruct, domStyle, on, query,
  Standby,
  Tooltip, 
  ContentPane, TabContainer,
  NumberTextBox,
  Graphic, Popup, MapView, Portal, WebMap) {
  return declare(null, {    
    constructor : function(options, containerOptions) {                  
      /**********************************************************
      * The first time this object is constructed, by Dojo, it will not
      * have options defined.  Only run constructor if options argument
      * has been provided.
      **********************************************************/
      if (options) {
        /*******************************************************
        * Initialize the ESRI Portal
        ********************************************************/       
        portal = new Portal();
        portal.url = options.portalUrl;
        portal.load().then(function() { // After portal connects
          /*******************************************************
          * DojoX Standby Widget being used for loading indicator
          ********************************************************/
          var standby = new Standby( { target: options.standbyContainer } );
          document.body.appendChild(standby.domNode);
          standby.startup();
          standby.show();          
          
          /*******************************************************
          * queryParams will be autocast by the queryItems function
          ********************************************************/
          var queryParams = {
            query : 'type: "Web Map" AND access:public AND (title: "'+options.searchQuery+'" OR tags: "'+options.searchQuery+'")',
            sortField: 'numViews',
            sortOrder: 'desc',
            num : options.numResults
          }          
          // Now actually go talk to the portal and do the search
          portal.queryItems(queryParams).then(function(queryResults) {
            //Declare Advanced View Options for Insert Map URL
            var useTemplateCheck = 'false';

            //Declare Advanced View Formatting option array and assign default values
            var advancedViewOptionsArray = {              
              'currentSize'           : 'medium',
              'currentSizeWidth'      : '500',
              'currentSizeHeight'     : '400',
              'theme' : 'light',
              'homeButton': 'false',
              'viewLargerMap'         : 'false',
              'showLocationSearch': '',
              'searchExtent': '',
              'defaultSearch': '',
              'showLegend': 'false',
              //'showSidePanel': 'false',
              'showDescription'       : 'false',              
              'showScaleBar'          : 'false',
              'disableMapScrolling': 'false',
              'toggleBasemap': 'false',
              'alternateBasemap': 'streets',
              'currentAlignment'      : 'left',
              'markerTitle': '',
              'markerDescription': '',
              'markerURL': '',
              'markerPos': '',
              'feature': ''
            };

            var tempExtent = {
              extent: null,              
              zoom: null
            };

            var tempMapPoint = null;
            var pickMapPoint = false;
            var advFormattingCreated = false;
                       
            //event handlers
            var agolSetExtentHandler;

            var itemsToInsert = "<div id='agol_for_wp_insert_map_picker_items_container'>";
            var pathToThumb = "";
            // Loop through the results
            for (var i = 0; i < queryResults.results.length; i++) {
              // shorthand pointer for current item in loop, to make rest of loop easier to read.
              var thisResult = queryResults.results[i];
              // Thumbnail preview -- use provided if possible, otherwise use default placeholder
              if (thisResult.thumbnailUrl != null) {
                pathToThumb = thisResult.thumbnailUrl;
              } else {
                pathToThumb = options.pluginsPath + '/web-maps-for-wp-pro/assets/ago_default.png';
              }
              
              if (thisResult.extent) { // Just a quick check to see if the result is formatted like we'd expect.
               // Create a div for each item in the results using custom data attributes to transfer necessary information
                itemsToInsert += "<div id='item-" + thisResult.id + "' class='itemResult agol_for_wp_insert_map_picker_item_container' "
                               + "data-portalurl='" + thisResult.portal.url + "' "
                               + "data-itemid='" + thisResult.id + "' "
                               + "data-xmax='" + thisResult.extent.xmax + "' "
                               + "data-ymax='" + thisResult.extent.ymax + "' "
                               + "data-xmin='" + thisResult.extent.xmin + "' "
                               + "data-ymin='" + thisResult.extent.ymin + "' "
                               + "data-portalname='" + thisResult.portal.portalName + "' "
                               + "data-portalhostname='" + thisResult.portal.portalHostname + "' "
                               + "data-owner='" + thisResult.owner + "' "
                               + "data-snippet='" + thisResult.snippet + "' "
                               + "data-avgrating='" + thisResult.avgRating + "' "
                               + "data-itemTitle='" + thisResult.title + "' "
                               + "data-pathToThumb='" + pathToThumb + "'>"
                               + "<img src='" + pathToThumb + "'/>" + "<h3>" + thisResult.title + "</h3>" + "</div>";
              }
            }
            
            // Close out the results container
            itemsToInsert += "</div>";
            
            // Insert the html into the target container
            dom.byId(options.targetContainer).innerHTML = itemsToInsert;
            
            var resultsPanel = dom.byId(options.targetContainer);
            var insertSearchField = dom.byId("agol_for_WP_insert_map_popup_map_insert_search_field");
            var insertTypeContainer = dom.byId("agol_for_WP_insert_map_popup_map_insert_type_container");                        
            //Add click event to each item
            query('.itemResult').on('click', function(passedClickEvent) {
              // Hide/show proper elements
              domStyle.set(resultsPanel, 'display', 'none');
              domStyle.set(insertSearchField, 'display', 'none');
              domStyle.set(insertTypeContainer, 'display', 'none');  
              domClass.remove(dom.byId('agol_for_WP_preview_container'), "agolHidden");                                    
              
              //Get portalURL from Event
              var targetPortalURL = passedClickEvent.currentTarget.attributes['data-portalurl'].value;

              //Get Title of Item
              var targetItemTitle = passedClickEvent.currentTarget.attributes['data-itemTitle'].value;

              //Get ItemId from Event
              var targetItemId = passedClickEvent.currentTarget.attributes['data-itemid'].value;

              //Get Extent from Event
              var targetItemExtentXMax = passedClickEvent.currentTarget.attributes['data-xmax'].value;
              var targetItemExtentYMax = passedClickEvent.currentTarget.attributes['data-ymax'].value;
              var targetItemExtentXMin = passedClickEvent.currentTarget.attributes['data-xmin'].value;
              var targetItemExtentYMin = passedClickEvent.currentTarget.attributes['data-ymin'].value;

              //Get remaining details for preview from Event
              var targetItemPortalName = passedClickEvent.currentTarget.attributes['data-portalname'].value;
              var targetItemPortalHostname = passedClickEvent.currentTarget.attributes['data-portalhostname'].value;
              var targetItemOwner = passedClickEvent.currentTarget.attributes['data-owner'].value;
              var targetItemSnippet = passedClickEvent.currentTarget.attributes['data-snippet'].value;
              var targetItemAvgRating = passedClickEvent.currentTarget.attributes['data-avgrating'].value;
              var targetPathToThumb = passedClickEvent.currentTarget.attributes['data-pathToThumb'].value;

              /***********************************************
               *  Create HTML to insert for preview screen
               **********************************************/
              containerOptions.tc.selectChild(containerOptions.contentDescription);
              containerOptions.tc2.selectChild(containerOptions.cplayout);
              var previewContentForInsert = '';
              //turn on map preview window
              domClass.remove(dom.byId('agol_for_WP_preview_map'), "agolHidden");       
              
              var node = '<div id="agolforwp_insert_map_preview">';
              node += '<div id="agolforwp_insert_map_preview_top_row_container"><div id="agolforwp_preview_top_left"><img src="' + targetPathToThumb + '" /><h4>' + targetItemTitle + '</h4></div>';              
              
              //Right Hand Item Details Content
              node += '<div id="agolforwp_preview_top_right"><p><strong>Owner:</strong> ' + targetItemOwner + '</p>';
              node += '<p><strong>Description:</strong> ' + targetItemSnippet + '</p>';
              node += '<p><strong>Average Rating:</strong> ' + Math.round(targetItemAvgRating * 10) / 10 + '</p>';
              node += "</div></div>";              
              containerOptions.contentDescription.set('content', node);

              if (!advFormattingCreated) {
                advFormattingCreated = true;
                var layoutNode = "";
                layoutNode += '<div id="agolRow"><div class="agolExtentDiv"><div id="extentHelp">Adjust the location and zoom positions on the map above and click the "Set Extent" button to save your map settings.</div></div>';
                layoutNode += '<div style="float: left;width:25%;vertical-align:middle"><button id="agolSetExtent">  Set Extent  </button></div></div>';              

                layoutNode += '<div class="agolRow"><div class="agol2Column agol_advancedoptions"><label for="agolforwp_advanced_theme">Map Theme: </label><select id="agolforwp_advanced_theme" name="agolforwp_advanced_theme">';
                layoutNode += '<option ' + ( advancedViewOptionsArray['theme'] == 'light' ? 'selected ' : '' ) + 'value="light" class="agol_lighttheme">Light</option>';
                layoutNode += '<option ' + ( advancedViewOptionsArray['theme'] == 'dark' ? 'selected ' : '' ) + 'value="dark"  class="agol_darktheme">Dark</option>';
                layoutNode += '</select></div>';          
                              
                layoutNode += '<div class="agolRow"><div class="agol2Column"><label for="agolforwp_advanced_view_options_size_align">Alignment: </label><select id="agolforwp_advanced_view_options_size_align" name="agolforwp_advanced_view_options_size_align">';
                layoutNode += '<option ' + ( advancedViewOptionsArray['currentAlignment'] == 'left' ? 'selected ' : '' ) + 'value="left">Left</option>';
                layoutNode += '<option ' + ( advancedViewOptionsArray['currentAlignment'] == 'center' ? 'selected ' : '' ) + 'value="center">Center</option>';
                layoutNode += '<option ' + ( advancedViewOptionsArray['currentAlignment'] == 'right' ? 'selected ' : '' ) + 'value="right">Right</option>';
                layoutNode += '</select></div></div>';                

                layoutNode += '<div class="agolRow"><div class="agol2Column"><input type="checkbox" id="agolforwp_homeButton" name="agolforwp_homeButton" ' + ( advancedViewOptionsArray['homeButton'] == 'true' ? 'checked' : '' ) + '> Display Home Button</div>';
                layoutNode += '<div class="agol2Column"><input type="checkbox" id="agolforwp_viewLargerMap" name="agolforwp_viewLargerMap" ' + ( advancedViewOptionsArray['viewLargerMap'] == 'true' ? 'checked' : '' ) + '> View Larger Map Button</div></div>';
                
                // Add size and alignment option fields
                layoutNode += '<div class="agolRow"><fieldset>Window Size:</div>';
                // Small
                layoutNode += '<div>';
                layoutNode += '<div class="agol3Column"><input type="radio" ' + ( advancedViewOptionsArray['currentSize'] == 'small' ? 'checked ' : '' ) + 'class="agol_radio" id="agolforwp_advanced_view_options_size_small" name="agolforwp_advanced_view_options_size" value="small">';
                layoutNode += '<label for="agolforwp_advanced_view_options_size_small">Small (300x260)</label></div>';
                // Medium
                layoutNode += '<div class="agol3Column"><input type="radio" ' + ( advancedViewOptionsArray['currentSize'] == 'medium' ? 'checked ' : '' ) + 'class="agol_radio" id="agolforwp_advanced_view_options_size_medium" name="agolforwp_advanced_view_options_size" value="medium" checked>';
                layoutNode += '<label for="agolforwp_advanced_view_options_size_medium">Medium (500x400)</label></div>';
                // Large
                layoutNode += '<div class="agol3Column"><input type="radio" ' + ( advancedViewOptionsArray['currentSize'] == 'large' ? 'checked ' : '' ) + 'class="agol_radio" id="agolforwp_advanced_view_options_size_large" name="agolforwp_advanced_view_options_size" value="large">';
                layoutNode += '<label for="agolforwp_advanced_view_options_size_large">Large (940x600)</label></div>';
                layoutNode += "</div>";
                // Custom
                layoutNode += '<div class="agolRowShrink"><input type="radio" ' + ( advancedViewOptionsArray['currentSize'] == 'custom' ? 'checked ' : '' ) + 'class="agol_radio" id="agolforwp_advanced_view_options_size_custom" name="agolforwp_advanced_view_options_size" value="custom">';
                layoutNode += '<label for="agolforwp_advanced_view_options_size_custom" class="agol_custom_dimensions_label">Custom Width: </label>';
                layoutNode += '<input type="text" class="agol_text" id="agolforwp_advanced_view_options_size_custom_width" name="agolforwp_advanced_view_options_size_custom_width" size="3" length="5" value="' + advancedViewOptionsArray['currentSizeWidth'] + '" /><small>px</small> ';
                layoutNode += '<label for="agolforwp_advanced_view_options_size_custom" class="agol_custom_dimensions_label">Custom Height: </label>';
                layoutNode += '<input type="text" class="agol_text" id="agolforwp_advanced_view_options_size_custom_height" name="agolforwp_advanced_view_options_size_custom_height" size="3" length="5" value="' + advancedViewOptionsArray['currentSizeHeight'] + '" /><small>px</small></div>';
                layoutNode += '</fieldset>';
                //search tab
                var searchNode = "";
                // Location Search
                searchNode += '<div class="agolRow"><input type="checkbox" id="agolforwp_advanced_view_options_tools_search" name="agolforwp_advanced_view_options_tools_search" ' + ( advancedViewOptionsArray['showLocationSearch'] == 'true' ? 'checked' : '' ) + '/>';
                searchNode += '<label for="agolforwp_advanced_view_options_tools_search"> Show location search</label></div>';
                // Location Search Sub-option
                searchNode += '<div id="agolforwp_advanced_view_options_tools_search_sub_container" style="display:none;"><div id="agolRow"><input type="checkbox" id="agolforwp_advanced_view_options_tools_search_extent" name="agolforwp_advanced_view_options_tools_search_extent" ' + ( advancedViewOptionsArray['searchExtent'] == 'true' ? 'checked' : '' ) + '/>';
                searchNode += '<label for="agolforwp_advanced_view_options_tools_search_extent"> Limit search to extent</label></div>';
                searchNode += '<div class="agolRow"><label for="agolforwp_advanced_view_options_tools_default_location">Open map to specific location: </label>';
                searchNode += '<input type="text" class="agol_text" id="agolforwp_advanced_view_defaultSearch" name="agolforwp_advanced_view_defaultSearch" length="5" size="35" value="' + advancedViewOptionsArray['defaultSearch'] + '" /></div>';                
                searchNode += '<div class="agolRow">(Note that defining a default location will cancel an existing map marker)</div></div>';
                //Side Panel Options
                var sideNode = "";
                //sideNode += '<div class="agolRow"><input type="checkbox" id="agolforwp_advanced_view_options_showSidePanel" name="agolforwp_advanced_view_options_showSidePanel" ' + ( advancedViewOptionsArray['showSidePanel'] == 'true' ? 'checked' : '' ) + '/><label>Show Side Panel by Default (Recommended for large maps only)</label></div>';
                sideNode += '<div class="agolRow"><input type="checkbox" id="agolforwp_advanced_view_options_showLegend" name="agolforwp_advanced_view_options_showLegend" ' + ( advancedViewOptionsArray['showLegend'] == 'true' ? 'checked' : '' ) + '/><label>Show Legend</label></div>';
                sideNode += '<div class="agolRow"><input type="checkbox" id="agolforwp_advanced_view_options_showDescription" name="agolforwp_advanced_view_options_showDescription" ' + ( advancedViewOptionsArray['showDescription'] == 'true' ? 'checked' : '' ) + '/><label>Show Map Description</label>';
                sideNode += '</div>'                
                //Mapping Options
                var mappingNode = "";
                //set map marker
                mappingNode += '<div id="agolMarkerMessage"><div>To add a marker on the map, click the Set Marker button.</div>';
                mappingNode += '<div ><button id="agolSetMarkerCancel">  Cancel Marker  </button>    <button id="agolSetMarker">  Set Marker  </button></div></div>';              
                //set map marker cancel
                mappingNode += '<div id="agolMarkerMessageActive" style="display:none"><div><strong>Click a point on the map to add the marker:</strong></div>';
                mappingNode += '<div ><button id="agolSetMarkerCancel">  Cancel Marker  </button></div></div>';              
                //after marker set add options for description and url
                mappingNode += '<div id="agolMarkerMessageDescriptionUrl" style="display:none"><div class="agolRow"><div class="agol2Column"><label>Marker Title:</label></div><div class="agol2Column"><input type="text" class="agol_text" class="agolforwp_advanced_view_options_markerTitle" name="agolforwp_advanced_view_options_markerTitle" size="25" length="25" value="' + advancedViewOptionsArray['markerTitle'] + '" /></div></div>';
                mappingNode += '<div class="agolRow"><div class="agol2Column"><label>Marker Description:</label></div><div class="agol2Column"><input type="text" class="agol_text" class="agolforwp_advanced_view_options_markerDescription" name="agolforwp_advanced_view_options_markerDescription" size="25" length="25" value="' + advancedViewOptionsArray['markerDescription'] + '" /></div></div>';
                mappingNode += '<div class="agolRow"><div class="agol2Column"><label>Marker Image URL:</label></div><div class="agol2Column"><input type="text" class="agol_text" id="agolforwp_advanced_view_options_markerURL" name="agolforwp_advanced_view_options_markerURL" size="25" length="25" value="' + advancedViewOptionsArray['markerURL'] + '" /></div></div></div>';

                mappingNode += '<div class="agolRow"><div class="agol2Column"><input type="checkbox" id="agolforwp_advanced_view_options_showScaleBar" name="agolforwp_advanced_view_options_showScaleBar" ' + ( advancedViewOptionsArray['showScaleBar'] == 'true' ? 'checked' : '' ) + '/><label>Show Scale Bar</label></div>';
                mappingNode += '<div class="agolRow"><div class="agol2Column"><input type="checkbox" id="agolforwp_advanced_view_options_mapScrolling" name="agolforwp_advanced_view_options_mapScrolling" ' + ( advancedViewOptionsArray['disableMapScrolling'] == 'true' ? 'checked' : '' ) + '/><label>Disable Map Scrolling</label></div></div>';
                mappingNode += '<div class="agolRow"><input type="checkbox" id="agolforwp_advanced_view_options_toggleBasemap" name="agolforwp_advanced_view_options_toggleBasemap" ' + ( advancedViewOptionsArray['toggleBasemap'] == 'true' ? 'checked' : '' ) + '/><label>Toggle Basemap</label></div>';

                mappingNode += '<div id="agolforwp_advanced_view_options_toggleBasemap_sub_container" style="display:none"><div><label for="agolforwp_advanced_view_options_size_align">Alternate Basemap: </label><select id="agolforwp_advanced_view_options_alternateBasemap" name="agolforwp_advanced_view_options_alternateBasemap">';
                mappingNode += '<option ' + ( advancedViewOptionsArray['alternateBasemap'] == 'streets' ? 'selected ' : '' ) + 'value="streets">streets</option>';
                mappingNode += '<option ' + ( advancedViewOptionsArray['alternateBasemap'] == 'satellite' ? 'selected ' : '' ) + 'value="satellite">satellite</option>';
                mappingNode += '<option ' + ( advancedViewOptionsArray['alternateBasemap'] == 'hybrid' ? 'selected ' : '' ) + 'value="hybrid">hybrid</option>';
                mappingNode += '<option ' + ( advancedViewOptionsArray['alternateBasemap'] == 'topo' ? 'selected ' : '' ) + 'value="topo">topo</option>';
                mappingNode += '<option ' + ( advancedViewOptionsArray['alternateBasemap'] == 'gray' ? 'selected ' : '' ) + 'value="gray">gray</option>';
                mappingNode += '<option ' + ( advancedViewOptionsArray['alternateBasemap'] == 'oceans' ? 'selected ' : '' ) + 'value="oceans">oceans</option>';
                mappingNode += '<option ' + ( advancedViewOptionsArray['alternateBasemap'] == 'national-geographic' ? 'selected ' : '' ) + 'value="national-geographic">national-geographic</option>';
                mappingNode += '<option ' + ( advancedViewOptionsArray['alternateBasemap'] == 'osm' ? 'selected ' : '' ) + 'value="osm">osm</option>';
                mappingNode += '<option ' + ( advancedViewOptionsArray['alternateBasemap'] == 'terrain' ? 'selected ' : '' ) + 'value="terrain">terrain</option>';
                mappingNode += '<option ' + ( advancedViewOptionsArray['alternateBasemap'] == 'dark-gray' ? 'selected ' : '' ) + 'value="dark-gray">dark-gray</option>';
                mappingNode += '</select></div></div>';                

                var advancedNode = '<div class="agolRow">(For advanced users only): Search for a specific feature in a searchable layer. Find Locations by Layer needs to be set up on the map for a searchable field. <p>The syntax is: <strong>layerID;searchfield;searchvalue</strong></p><p>For example: <strong>CentralIndianaCities_634;PLACEFIPS;05860</strong></p></div>';
                advancedNode += '<div class="agolRow"><input type="text" class="agol_text" id="agolforwp_advanced_view_options_feature" name="agolforwp_advanced_view_options_feature" size="50" length="50" value="' + advancedViewOptionsArray['feature'] + '" /></div>';                            
                
                containerOptions.cplayout.set('content', layoutNode);              
                containerOptions.cpsearch.set('content', searchNode);
                containerOptions.cpsidenode.set('content', sideNode);
                containerOptions.cpmapnode.set('content', mappingNode);
                containerOptions.cpadvnode.set('content', advancedNode);                              
              
                containerOptions.mapPreviewContent.set('content', containerOptions.tc2);                
                //containerOptions.tc.resize();
                containerOptions.tc2.startup();
                containerOptions.tc.startup();                                
              }
                            
              var mapPreviewTitle = '<h3 id="agol_for_wp_insert_Map_Preview_Title">' + targetItemTitle + ' Preview</h3>';
              mapPreviewTitle += '<div id="agolforwp_preview_bottom"><div id="agol_for_WP_message_window"><small><em>Please Note: Some maps use data not publicly accessible and will not be available for use.</em></small></div>';                            
              mapPreviewTitle += '<div id="agol_for_wp_insert_map_buttons"><button id="insert_map_preview_cancel_btn">Cancel</button>    <button id="insert_map_preview_confirm_btn">Insert</button></div></div>';
              dom.byId("agol_for_WP_insert_map_popup_map_insert_preview").innerHTML = mapPreviewTitle;

              //Insert ArcGIS Map              
              dom.byId('agol_for_WP_preview_map').innerHTML = "";
              if (webmap) webmap.remove();
              var webmap = new WebMap({
                portalItem: { id: targetItemId }
              });
              var view = new MapView({
                map: webmap,
                container: "agol_for_WP_preview_map"                
              });
              
              view.when(function() {                
              }).catch(function(err){
                console.log(err);
              });                         ;
              
              

              //capture extent change and save new vals
              view.watch("extent", function(newval, oldval) {    
                if (dom.byId('agolSetExtent')) dom.byId('agolSetExtent').innerHTML = "  Set Extent  ";                                            
                tempExtent.extent = newval.extent.xmin + "," + newval.extent.ymin + "," + newval.extent.xmax + "," + newval.extent.ymax + "," + newval.extent.spatialReference.wkid;                
                tempExtent.zoom = view.zoom;
                dom.byId("agol_for_WP_message_window").innerHTML = "<small><em>Please Note: Some maps use data not publicly accessible and will not be available for use.</em></small>";                
              }); 

              //record long/lat
              view.on("click", function(event) {                
                event.stopPropagation();
                if (pickMapPoint) {                                    
                  tempMapPoint = event.mapPoint.longitude + ";" + event.mapPoint.latitude + ";;";                  
                  var startSymbol = {
                    type: "picture-marker",                    
                    xoffset: 0,
                    yoffset: 8,                                                   
                    url:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAdVBMVEX///8dQ3MdQ3MdQ3MdQ3MdQ3MdQ3MdQ3MdQ3MdQ3MfRnggSX0iTYImVpEsZq0tY6UtZ64taLAuabEva7QxbbMxbrczcLg1c701dcE2dsI5cLJDf8ZhjMJomNF7oMyCqtm+0ObB1ezL2evN3fDz9vrz9/v////A4KgrAAAACXRSTlMAEEBwkKDQ4PCy0djnAAAAkUlEQVQoz83Q2w6CMAyA4XFmHIoHBKeggrr3f0Q3iiGdxcQ7/9svS9sJMedHqTSlkS+cwrxqlKmp8pBKULQWALaHtggIJbVCAtjXCSFp4dx3J2Mq+6DrU+vHhaNeT3WgpEsD0o2hO9L426svs5YN5fpdDOFv/AltHIrLN+2OZUzIQ0PxBGOczMYKGi+TrYg1Ii+BgBmO06qR0gAAAABJRU5ErkJggg==",
                    width:24,
                    height:24
                  };
                  var graphic = new Graphic({
                    symbol: startSymbol,
                    geometry: event.mapPoint
                  });
                  view.graphics.removeAll();
                  view.graphics.add(graphic);
                  domStyle.set(dom.byId('agolMarkerMessage'), 'display', 'block');
                  domStyle.set(dom.byId('agolMarkerMessageActive'), 'display', 'none');
                  domStyle.set(dom.byId('agolMarkerMessageDescriptionUrl'), 'display', 'block');
                  pickMapPoint = false;
                }
              });

              //clicking on the set marker button
              on(query('#agolSetMarker'), 'click', function(evt) {
                if (!pickMapPoint) {
                  pickMapPoint = true;
                  domStyle.set(dom.byId('agolMarkerMessage'), 'display', 'none');
                  domStyle.set(dom.byId('agolMarkerMessageActive'), 'display', 'block');                                   
                }                                
              });
              //cancel marker set button
              on(query('#agolSetMarkerCancel'), 'click', function(evt) {                          
                  view.graphics.removeAll();
                  pickMapPoint = false;
                  tempMapPoint = null;                  
                  domStyle.set(dom.byId('agolMarkerMessage'), 'display', 'block');
                  domStyle.set(dom.byId('agolMarkerMessageActive'), 'display', 'none');         
                  domStyle.set(dom.byId('agolMarkerMessageDescriptionUrl'), 'display', 'none');                                           
              });
            
              // Hide/show proper elements
              var insertPreview = dom.byId("agol_for_WP_insert_map_popup_map_insert_preview");
              dojo.style(insertPreview, 'display', 'block');
        
              //Set Extent button clicked
              agolSetExtentHandler = on(query('#agolSetExtent'), "click", function() {                
                dom.byId('agolSetExtent').innerHTML = "  Extent Set!  ";
                advancedViewOptionsArray['extent'] = tempExtent.extent;
                advancedViewOptionsArray['zoom'] = tempExtent.zoom;
                dom.byId("agol_for_WP_message_window").innerHTML = "<small><em>Extent settings saved!</em></small>";
              });

              //Theme select              
              on(query('#agolforwp_advanced_theme'), "change", function(newval) {
                advancedViewOptionsArray['theme'] = newval.target.value;
                switch(newval.target.value) {
                  case "dark": 
                    query(".esri-widget-button").style("background-color", "#242424");
                    query(".esri-widget-button").style("color", "#adadad");              
                    break;
                  case "light":
                    query(".esri-widget-button").style("background-color", "#ffffff");
                    query(".esri-widget-button").style("color", "#4c4c4c");              
                    break;
                }                
              });

              //search button options select
              on(query("#agolforwp_advanced_view_options_tools_search"), 'change', function() {
                if(dom.byId("agolforwp_advanced_view_options_tools_search").checked) {
                 domStyle.set(dom.byId("agolforwp_advanced_view_options_tools_search_sub_container"), 'display', 'block');
                } else {
                 domStyle.set(dom.byId("agolforwp_advanced_view_options_tools_search_sub_container"), 'display', 'none');
                }
              });

              //basemap toggle options select              
              on(query("#agolforwp_advanced_view_options_toggleBasemap"), 'change', function() {
                if(dom.byId("agolforwp_advanced_view_options_toggleBasemap").checked) {
                 domStyle.set(dom.byId("agolforwp_advanced_view_options_toggleBasemap_sub_container"), 'display', 'block');
                } else {
                 domStyle.set(dom.byId("agolforwp_advanced_view_options_toggleBasemap_sub_container"), 'display', 'none');
                }
              });

              //Preview screen approval clicked
              on(dom.byId('insert_map_preview_confirm_btn'), 'click', function() {                           
                domStyle.set(insertPreview, 'display', 'none');
                domStyle.set(resultsPanel, 'display', 'block');                

                /////
                //Process fields and update option values array to reflect form field entries
                var adViewSize = query('input[name="agolforwp_advanced_view_options_size"]:checked')[0].value;
                  
                switch(adViewSize) {
                  case 'small': // 300x260
                    advancedViewOptionsArray['currentSize'] = 'small';
                    advancedViewOptionsArray['currentSizeWidth'] = '300';
                    advancedViewOptionsArray['currentSizeHeight'] = '260';
                    break;
                  case 'medium': // 500x400
                    advancedViewOptionsArray['currentSize'] = 'medium';
                    advancedViewOptionsArray['currentSizeWidth'] = '500';
                    advancedViewOptionsArray['currentSizeHeight'] = '400';
                    break;
                  case 'large': // 940x600
                    advancedViewOptionsArray['currentSize'] = 'large';
                    advancedViewOptionsArray['currentSizeWidth'] = '940';
                    advancedViewOptionsArray['currentSizeHeight'] = '600';
                    break;
                  case 'custom':
                    advancedViewOptionsArray['currentSize'] = 'custom';
                    advancedViewOptionsArray['currentSizeWidth'] = query('input[name="agolforwp_advanced_view_options_size_custom_width"]')[0].value;
                    advancedViewOptionsArray['currentSizeHeight'] = query('input[name="agolforwp_advanced_view_options_size_custom_height"]')[0].value;
                    break;
                  default: // 500x400
                    advancedViewOptionsArray['currentSize'] = 'medium';
                    advancedViewOptionsArray['currentSizeWidth'] = '500';
                    advancedViewOptionsArray['currentSizeHeight'] = '400';
                    break;
                }
                                                
                advancedViewOptionsArray['currentAlignment'] = query('select[name="agolforwp_advanced_view_options_size_align"]')[0].value;
                advancedViewOptionsArray['theme'] = query('select[name="agolforwp_advanced_theme"]')[0].value;
                advancedViewOptionsArray['homeButton'] = query('input[name="agolforwp_homeButton"]')[0].checked ? 'true' : 'false';
                advancedViewOptionsArray['viewLargerMap'] = query('input[name="agolforwp_viewLargerMap"]')[0].checked ? 'true' : 'false';                
                advancedViewOptionsArray['showLocationSearch'] = query('input[name="agolforwp_advanced_view_options_tools_search"]')[0].checked ? 'true' : 'false';
                advancedViewOptionsArray['searchExtent'] = query('input[name="agolforwp_advanced_view_options_tools_search_extent"]')[0].checked ? 'true' : 'false';
                advancedViewOptionsArray['defaultSearch'] = query('input[name="agolforwp_advanced_view_defaultSearch"]')[0].value;
                //advancedViewOptionsArray['showSidePanel'] = query('input[name="agolforwp_advanced_view_options_showSidePanel"]')[0].checked ? 'true' : 'false';
                advancedViewOptionsArray['showLegend'] = query('input[name="agolforwp_advanced_view_options_showLegend"]')[0].checked ? 'true' : 'false';
                advancedViewOptionsArray['showDescription'] = query('input[name="agolforwp_advanced_view_options_showDescription"]')[0].checked ? 'true' : 'false';
                advancedViewOptionsArray['markerTitle'] = query('input[name="agolforwp_advanced_view_options_markerTitle"]')[0].value;
                advancedViewOptionsArray['markerDescription'] = query('input[name="agolforwp_advanced_view_options_markerDescription"]')[0].value;
                advancedViewOptionsArray['markerURL'] = query('input[name="agolforwp_advanced_view_options_markerURL"]')[0].value;
                advancedViewOptionsArray['showScaleBar'] = query('input[name="agolforwp_advanced_view_options_showScaleBar"]')[0].checked ? 'true' : 'false';
                advancedViewOptionsArray['disableMapScrolling'] = query('input[name="agolforwp_advanced_view_options_mapScrolling"]')[0].checked ? 'true' : 'false';
                advancedViewOptionsArray['toggleBasemap'] = query('input[name="agolforwp_advanced_view_options_toggleBasemap"]')[0].checked ? 'true' : 'false';
                advancedViewOptionsArray['alternateBasemap'] = query('select[name="agolforwp_advanced_view_options_alternateBasemap"]')[0].value;
                advancedViewOptionsArray['feature'] = query('input[name="agolforwp_advanced_view_options_feature"]')[0].value;                                
                
                var advOptionUrl = new Array();
                
                if (tempExtent.extent) advOptionUrl.push('extent=' + tempExtent.extent + '&zoom=' + tempExtent.zoom);
                else {
                  //var extentString = targetItemExtentXMin + ',' + targetItemExtentYMin + ',' + targetItemExtentXMax + ',' + targetItemExtentYMax;                  
                  //todo initial
                }
                advOptionUrl.push('theme=' + advancedViewOptionsArray['theme']);
                advOptionUrl.push('home=' + advancedViewOptionsArray['homeButton']);
                if (advancedViewOptionsArray['showLocationSearch'] === 'true') {
                  advOptionUrl.push('search=true');
                  if (advancedViewOptionsArray['defaultSearch']) advOptionUrl.push('find=' + encodeURIComponent(advancedViewOptionsArray['defaultSearch']));
                  if (advancedViewOptionsArray['searchExtent'] === 'true') advOptionUrl.push('searchextent=true');
                }
                //if (advancedViewOptionsArray['showSidePanel'] === 'true') advOptionUrl.push('show_panel=true');
                if (advancedViewOptionsArray['showLegend'] === 'true') advOptionUrl.push('legend=true');
                if (advancedViewOptionsArray['showDescription'] === 'true') advOptionUrl.push('details=true');
                if (tempMapPoint) {
                  var markertxt = 'marker=' + tempMapPoint;
                  markertxt += advancedViewOptionsArray['markerDescription'] ? encodeURIComponent(advancedViewOptionsArray['markerDescription']) + ';' : ';';
                  markertxt += advancedViewOptionsArray['markerURL'] ? advancedViewOptionsArray['markerURL'] + ';' : ';';
                  markertxt += advancedViewOptionsArray['markerTitle'] ? encodeURIComponent(advancedViewOptionsArray['markerTitle']) + ';' : ';';
                  advOptionUrl.push(markertxt);
                }
                if (advancedViewOptionsArray['showScaleBar'] === 'true') advOptionUrl.push('scale=true');
                if (advancedViewOptionsArray['disableMapScrolling'] === 'true') advOptionUrl.push('disable_scroll=true');
                if (advancedViewOptionsArray['toggleBasemap'] === 'true') {
                  advOptionUrl.push('basemap_toggle=true');                   
                  if (advancedViewOptionsArray['alternateBasemap']) advOptionUrl.push('alt_basemap=' + advancedViewOptionsArray['alternateBasemap']);
                }
                if (advancedViewOptionsArray['feature']) advOptionUrl.push('feature=' + encodeURIComponent(advancedViewOptionsArray['feature']));

                

                
                // Form the URL src for the iframe
                //var formedUrl = targetPortalURL + '/home/webmap/' + advOptionUrl['useUrlPath'] + '?webmap=' + targetItemId + advOptionUrl['useExtent']
                var formedUrl = targetPortalURL + '/apps/Embed/index.html?webmap=' + targetItemId + '&' + advOptionUrl.join('&');                                              
                
                // Create the HTML for the iframe and it's container div
                var stringToInsert = '<div class="insert_map_iframe_container agol_insert_map_align_' + advancedViewOptionsArray['currentAlignment'] + '">';
                    stringToInsert += '<iframe width="' + advancedViewOptionsArray['currentSizeWidth'] + '" height="' + advancedViewOptionsArray['currentSizeHeight'] + '" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" ';
                    stringToInsert += 'src="' + formedUrl + '"></iframe>'; 
                if (advancedViewOptionsArray['viewLargerMap'] == 'true') {
                    stringToInsert += '<div><a class="agol_for_wp_view_larger_map" href="' + formedUrl + '" target="_blank">View Larger Map</a></div>';
                    //stringToInsert += '<br/>[webmap_viewlargerbutton label="View Larger Map" url="' + formedUrl + '"]';
                }
                    stringToInsert += '</div>';

                // Restore the search field
                domStyle.set(insertSearchField, 'display', 'block');
                domStyle.set(insertTypeContainer, 'display', 'block');
                
                // Insert iFrame into editor
                window.parent.send_to_editor(stringToInsert);
                window.parent.tb_remove();
              });
                
              

              // Preview screen cancel clicked
              on(dom.byId('insert_map_preview_cancel_btn'), 'click', function() {                
                // Show/hide proper elements
                domStyle.set(resultsPanel, 'display', 'block');
                domStyle.set(insertSearchField, 'display', 'block');
                domStyle.set(insertTypeContainer, 'display', 'block');
                domClass.add(dom.byId('agol_for_WP_preview_container'), "agolHidden");
                tempExtent.extent = null;                
                tempExtent.zoom = null;
                tempMapPoint = null;
                agolSetExtentHandler.remove();
              });
            });
          }).otherwise(function(err){console.log(err);});
          // Hide Loading Overlay - We're Finished
          standby.hide();
        });
      }
    }
  });
});