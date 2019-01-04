<?php
/*
 Plugin Name: Web Maps for WordPress Free
 Plugin URI: http://www.geo-jobe.com/wordpress-plugin-for-arcgis-online/
 Description: Web Maps for WordPress is the best way to quickly and easily search for and insert authoritative maps directly into your blog posts and pages. The plugin connects you to ArcGIS Online, one of the largest resources of online mapping content in the world.  The Add a Map button mimics that of both a queried google search and the standard WordPress Add Media functionality.
 Version: 1.3.3
 Author: GEO-Jobe GIS Consulting
 Author URI: http://GEO-Jobe.com/
 License: GNU General Public License
 */

/*
Copyright (C) 2018 GEO-Jobe GIS Consulting, geo-jobe.com (info@geo-jobe.com)
Original code by GEO-Jobe GIS Consulting

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 1 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

//Loop through the lib folder and load the classes
//Register autoloader from above.
spl_autoload_register('agol_for_wp_template_autoloader');

function agol_for_wp_template_autoloader($class) {
	$namespaces = array(
		'AGOLForWP'
	);
	if ( preg_match('/([A-Za-z]+)_?/', $class, $match) && in_array($match[1], $namespaces) ) {
		$filename = str_replace('_', DIRECTORY_SEPARATOR, $class) . '.php';
		require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'lib' . DIRECTORY_SEPARATOR . $filename;
	}
}

//Adding Dojo Parser to Head of document
function register_dojo_parser(){
	echo('<script type="text/javascript">
  dojoConfig = {
    parseOnLoad : true,
		afterOnLoad : true		
	}
	var AGOLFglobaldir = "' . plugins_url('/js/gj/', __FILE__) . '";
</script>');
}

add_action('wp_enqueue_scripts', 'register_dojo_parser', 0);
add_action('admin_enqueue_scripts', 'register_dojo_parser');

//Register all addional scripts
function agol_for_wp_register_additional_scripts_method($hook) {
	// Force jQuery to load before arcgis api.
	wp_dequeue_script("jquery");

	if (is_admin()) {
		//Add ESRI JS Lib
		wp_register_script("esri_js_api", "http://js.arcgis.com/4.6/init.js", NULL, NULL, true);
		wp_enqueue_script("esri_js_api");
	
		//GEO-Jobe Classes
		wp_enqueue_script("gj_addMapLogic", plugins_url( '/js/gj/addMap.js' , __FILE__ ), NULL, NULL, true);	
	}
}

//Add additional scripts to WordPress
add_action('admin_enqueue_scripts', 'agol_for_wp_register_additional_scripts_method', 10);

//Register plugin styles
function agol_for_wp_register_styles(){
	 wp_register_style( 'agol_for_wp_main_style', plugins_url('styles/agolForWPStyle.css', __FILE__) );
   wp_enqueue_style( 'agol_for_wp_main_style');
   wp_enqueue_style( 'agol_for_wp_esri_style', 'http://js.arcgis.com/4.6/esri/css/main.css' );
   wp_enqueue_style( 'agol_for_wp_esri_claro_style', 'http://js.arcgis.com/4.6/dijit/themes/claro/claro.css' );
}

$AGOLforWP_Class_AGOLforWPOptions = new AGOLForWP_Class_AGOLforWPOptions();

// Add styles to Wordpress
//add_action('wp_enqueue_scripts', 'agol_for_wp_register_styles', 20);
// Admin styles, probably not necessary because only shown inside TinyMCE Editor
add_action('admin_enqueue_scripts', 'agol_for_wp_register_styles', 20);
// Add styles to TinyMCE Editor
add_editor_style(plugins_url('styles/agolForWPStyle.css', __FILE__));

/*****************************************************
*
*	Page / Post Editing Bar
*
*****************************************************/
//Function that adds additional buttons to Media Bar
function agol_for_WP_Add_Media_Bar_Buttons($context) {
  //Append Insert Map Button
  $context .= "<a class='button thickbox add_map' title='Add Map' href='#TB_inline?width=600&inlineId=agol_for_WP_insert_map_popup_container'><span class='wp-media-buttons-icon'></span> Add Map</a>";
  return $context;
}

//Add action to append buttons to the Media Bar
add_action('media_buttons_context',  'agol_for_WP_Add_Media_Bar_Buttons');

//Function to add hidden container called by new media buttons
function add_inline_popup_content() {
	include 'templates/mediaAddMap.php';
}

//Add action to append hidden containers called by the media bar
add_action( 'admin_footer',  'add_inline_popup_content' );

//Function to add link services
function add_gis_link_services() {
	include('templates/media/insertMap/gis_services.php');
}
//Add services links on add map
add_action( 'wp_footer', 'add_gis_link_services' );


// [webmap id="a72b0766aea04b48bf7a0e8c27ccc007" extent="-155.6006,6.5161,-42.1338,61.7856"]
function webmap_function($atts) {
	$viewLargerLinkString = '';
	$shortcodeAttributes = shortcode_atts( array(
		'id' => 'a72b0766aea04b48bf7a0e8c27ccc007',
		'width' => '100%', // default 100% because most blogs will want this
		'height' => '200px',
		'extent' => '',
		'center' => '',
		'zoom' => '',
		'level' => '',
		'zoom_position' => '',
		'home' => '',
		'scale' => '',
		'disable_scroll' => '',
		'marker' => '',
		'basemap_toggle' => '',
		'alt_basemap' => '',
		'search' => '',
		'searchextent' => '',
		'find' => '',
		'feature' => '',		
		'legend' => '',
		'details' => '',
		'show_panel' => '',
		'active_panel' => '',
		'popup_sidepanel' => '',
		'theme' => ''	
	), $atts );
	if ($shortcodeAttributes['marker'] != "") {
		$shortcodeAttributes['marker'] = rawurldecode($shortcodeAttributes['marker']);
	}
	if ($shortcodeAttributes['find'] != "") {
		$shortcodeAttributes['find'] = rawurldecode($shortcodeAttributes['find']);
	}
	$id = uniqid('webmap');
	$thesrc = "https://www.arcgis.com/apps/Embed/index.html?webmap=" . $shortcodeAttributes['id'];
	foreach ($shortcodeAttributes as $key => $value) {
		if ($value != "" && $key != "id" && $key != "width" && $key != "height") {
			$thesrc .= "&$key=$value";
		}
	}

	return '<div class="insert_map_iframe_container"><iframe src="' . $thesrc . '" width="' . $shortcodeAttributes['width'] . '" height="' . $shortcodeAttributes['height'] . '" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe></div>';
}
add_shortcode('webmap', 'webmap_function');

