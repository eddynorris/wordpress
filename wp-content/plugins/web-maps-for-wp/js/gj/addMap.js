jQuery(window).load(function () {  
  var mapPicker = AGOLFglobaldir + 'agolInsertMapPicker.js';  
  require([
    'dojo/on', 
    'dojo/Deferred',
    'dojo/dom', 
    
    'dojo/fx/Toggler', 
    'dojo/fx',

    'dijit/layout/ContentPane',
    'dijit/layout/TabContainer',

    mapPicker],
    function(
      on, Deferred, dom, 
      Toggler, coreFx,
      ContentPane, TabContainer,
      agolInsertMapPicker
    ) {
      //Container vars
      var tc = null;
      var contentDescription = null;
      var tc2 = null;
      var cplayout = null;
      var cpsearch = null;
      var cpsidenode = null;
      var cpmapnode = null;
      var cpadvnode = null;
      var mapPreviewContent = null;
            
      /*****************************************************************************
      * Handle Default Item Pallet
      *****************************************************************************/
      var agolUrl = "http://maps.arcgis.com";    
      var setupDef = setupContainers();
      setupDef.then(function() {
        agol_search("map");
      }).otherwise(function(err){console.log(err);});
      
      // Search if enter key pressed
      on(dom.byId('agol_for_WP_add_map_agol_search_input'), "keyup", function(e) {
        if (e.which == '13') {          
          agol_search(dom.byId('agol_for_WP_add_map_agol_search_input').value);
        }
      });
      
      // Search Button
      on(dom.byId('agol_for_WP_add_map_agol_search_button'), "click", function() {
      agol_search(dom.byId('agol_for_WP_add_map_agol_search_input').value);
      });
      
      // Dojo Toggler for Insert View
      var insertView = new Toggler({
        node: "agol_for_WP_insert_map_popup_insert_view",
        showFunc: coreFx.wipeIn,
        hideFunc: coreFx.wipeOut
      });
      // Dojo Toggler for Create View
      var createView = new Toggler({
        node: "agol_for_WP_insert_map_popup_create_view",
        showFunc: coreFx.wipeIn,
        hideFunc: coreFx.wipeOut
      });
      
      // Insert Map button
      on(dom.byId('agol_for_WP_insert_map_popup_insert_map_button'), "click", function() {
        insertView.show();
        createView.hide();
      });

      // Create Map button
      on(dom.byId('agol_for_WP_insert_map_popup_create_map_button'), "click", function() {
        createView.show();
        insertView.hide();
      });
      
      function agol_search(searchVal) {
        if (searchVal) {
          dom.byId("agol_for_WP_add_map_agol_search_input").value = searchVal;
          var searchUrl = "http://maps.arcgis.com";
          if (!searchUrl || searchUrl == "") { 
            alert("Please set your Organization's ArcGIS URL Options on the Web Maps for WordPress Options Page.")
            return;
          }          
          setupContainers();
          // Pass Options for the Initial Map Picker
          agolInsertMapPickerOptions = {
            portalUrl : searchUrl,
            targetContainer : "agol_for_WP_insert_map_popup_map_insert_content_container",
            standbyContainer: "agol_for_WP_insert_map_popup_right_container",
            searchQuery : searchVal,
            numResults: '50',
            pluginsPath : "../wp-content/plugins"            
          };

          var containerOptions = {
            tc: tc,
            contentDescription: contentDescription,
            tc2: tc2,
            cplayout: cplayout,
            cpsearch: cpsearch,
            cpsidenode: cpsidenode,
            cpmapnode: cpmapnode,
            cpadvnode: cpadvnode,
            mapPreviewContent: mapPreviewContent
          };
          
          var agolInsertMapPickerInstance = new agolInsertMapPicker(agolInsertMapPickerOptions, containerOptions);
        }
      }

      function setupContainers() {       
        var def = new Deferred(); 
        //ready tab and content containers
        if (tc) {
          tc.destroyRecursive(true);
          contentDescription.destroyRecursive(true);
          mapPreviewContent.destroyRecursive(true);
          tc2.destroyRecursive(true);
          cplayout.destroyRecursive(true);
          cpsearch.destroyRecursive(true);
          cpsidenode.destroyRecursive(true);
          cpmapnode.destroyRecursive(true);
          cpadvnode.destroyRecursive(true);
          dom.byId("agol_for_WP_insert_tabs_container").innerHTML = "";
        }                            
        tc = new TabContainer({class: "claro", style: "height: 320px; width:99%"}, "agol_for_WP_insert_tabs_container");
        contentDescription = new ContentPane({title: "Description", content: ''});
        tc.addChild(contentDescription);            
        tc2 = new TabContainer({class: "claro", style: "height: 320px; width:99%"}, "");    
        cplayout = new ContentPane({id: 'cplayout', title: "Layout", content: '<div id="agol_for_wp_cplayout"></div>', selected: true});
        cpsearch = new ContentPane({title: "Search", content: '<div id="agol_for_wp_cpsearch"></div>'});
        cpsidenode = new ContentPane({title: "Side Panel", content: '<div id="agol_for_wp_cpsidenode"></div>'});
        cpmapnode = new ContentPane({title: "Mapping Options", content: '<div id="cpmapnode"></div>'});
        cpadvnode = new ContentPane({title: "Advanced", content: '<div id="agol_for_wp_cpadvnode"></div>'});
        tc2.addChild(cplayout);
        tc2.addChild(cpsearch);
        tc2.addChild(cpsidenode);
        tc2.addChild(cpmapnode);
        tc2.addChild(cpadvnode);
        //tc2.startup();            
        mapPreviewContent = new ContentPane({title: "Advanced Formatting", content: ''});
        tc.addChild(mapPreviewContent);
        //tc.startup();                   
        def.resolve();
        return def.promise;
      }
  });
});