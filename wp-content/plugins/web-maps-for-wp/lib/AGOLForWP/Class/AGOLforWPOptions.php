<?php

class AGOLforWP_Class_AGOLforWPOptions {

  private $sections;
	private $checkboxes;
	private $settings;

	/**
	 * Construct
	 *

	 */
	public function __construct() {

		// This will keep track of the checkbox options for the validate_settings function.
		$this->checkboxes = array();
		$this->settings = array();
		$this->get_settings();

		$this->sections['general']      = __( 'General Settings <small>(upgrade)</small>' );
		//$this->sections['account']      = __( 'Account Settings <small>(upgrade)</small>' );
		//$this->sections['adv_tree']     = __( 'Advanced Content Tree Settings <small>(upgrade)</small>' );

		add_action( 'admin_menu', array( &$this, 'add_pages' ) );
		add_action( 'admin_init', array( &$this, 'register_settings' ) );

		if ( ! get_option( 'agolforwp_options' ) )
			$this->initialize_settings();

	}

	/**
	 * Add options page
	 *

	 */
	public function add_pages() {

		$admin_page = add_options_page( __( 'Web Maps Free' ), __( 'Web Maps Free' ), 'manage_options', 'agolforwp-options', array( &$this, 'display_page' ) );
		add_action( 'admin_print_scripts-' . $admin_page, array( &$this, 'scripts' ) );
		add_action( 'admin_print_styles-' . $admin_page, array( &$this, 'styles' ) );
	}

	/**
	 * Create settings field
	 **/
	public function create_setting( $args = array() ) {

		$defaults = array(
			'id'      => 'default_field',
			'title'   => '',
			'desc'    => '',
			'std'     => '',
			'type'    => 'text',
			'section' => 'general',
			'choices' => array(),
			'class'   => ''
		);

		extract( wp_parse_args( $args, $defaults ) );

		$field_args = array(
			'type'      => $type,
			'id'        => $id,
			'desc'      => $desc,
			'std'       => $std,
			'choices'   => $choices,
			'label_for' => $id,
			'class'     => $class
		);

		if ( $type == 'checkbox' )
			$this->checkboxes[] = $id;

		add_settings_field( $id, $title, array( $this, 'display_setting' ), 'agolforwp-options', $section, $field_args );
	}

	/**
	 * Display options page
	 */
	public function display_page() {
		echo '<div class="wrap">
	<div class="icon32" id="icon-options-general"></div>
	<h2>' . __( 'Web Maps for WordPress' ) . '</h2>';

		if ( isset( $_GET['settings-updated'] ) && $_GET['settings-updated'] == true )
			echo '<div class="updated fade"><p>' . __( 'Web Maps for WordPress options updated.' ) . '</p></div>';

		echo '<form action="options.php" method="post">';

		settings_fields( 'agolforwp_options' );
		/*echo '<div class="ui-tabs">
			<ul class="ui-tabs-nav">';

		//foreach ( $this->sections as $section_slug => $section )
//			echo '<li><a href="#' . $section_slug . '">' . $section . '</a></li>';

		echo '</ul>';
		//do_settings_sections( $_GET['page'] );

		echo '</div>*/
		?>
			<div class="ui-tabs">
				<ul>
				<li><a href="#overview">Overview</a></li>
				<li><a href="#contenttrees">Content Trees (Upgrade)</a></li>
				<li><a href="#contentslider">Content Slider Widget (Upgrade)</a></li>
				<li><a href="#addmap">Add Map Button</a></li>
				<li><a href="#webmapshortcode">[webmap] Shortcode</a></li>
				</ul>
				<div id="overview">
					<h3>Web Maps for WordPress Overview</h3>
					<p>The Web Maps for WordPress plugin integrates the power of “where” into your pages and posts with interactive maps exposing authoritative content. Web Maps is designed to bridge the gap between authoritative maps registered with ArcGIS Online and WordPress.</p>					
					<p>The Add Map button is designed to provide WordPress users with a more streamlined process for embedding ArcGIS web maps in their pages and posts. While very similar to the Add Media 
					button, Add Map puts millions of interactive maps at the fingertips of bloggers, website creators, media outlets and news organizations. Millions of WordPress 
					users will be able to seamlessly enhance the information they’re communicating with authoritative maps exposing authoritative content from authoritative sources.</p>
					<h3>Web Maps for WordPress Pro</h3>
					<p>The Web Maps for WordPress Pro plugin is designed to interact directly with a single ArcGIS Online organization (primary organization).  On the general configuration page for the plugin, you specify the URL for the primary organization that you wish to interact with via the plugin. For example “http://geo-jobe.maps.arcgis.com”.</p>
					<p>While the plugin is configured to a single ArcGIS Online organization, it honors cross-organization sharing of items via groups that contain items owned by other ArcGIS Online organizations (secondary organizations) and shared with “Everyone (public)”.  Web Maps for WordPress Pro provides a variety of ways to display an organization's content, including Content Trees and Content Slider Widgets.</p>
					<p><a href="http://www.geo-jobe.com/wp/web-maps-for-wordpress-pro-plugin/" target="_blank"><img src="http://cdn.geopowered.com/Applications/WordPressPlugins/AGOL/Free/info/VersionChart500x600.png" alt="Version comparison" /></a></p>					
				</div>
				<div id="contenttrees">
					<h3>Content Trees (Web Maps Pro)</h3>	
					<p>The content tree widget is designed to provide WordPress users with a means of showcasing items, from the primary organization, on a WordPress page and filtering the items through tree view listings.  The content tree widget is comprised of (1) Tree view, (2) Items summary page and (3) Item details page.</p>
					<p><a href="http://www.geo-jobe.com/wp/web-maps-for-wordpress-pro-plugin/" target="_blank"><img src="http://cdn.geopowered.com/Applications/WordPressPlugins/AGOL/Free/info/VersionChart500x600.png" alt="Version comparison" /></a></p>										
				</div>
				<div id="contentslider">
				<h3>Content Slider Widget (Web Maps Pro)</h3>
					<p>The content slider widget is designed to provide WordPress user with a low-profile way to showcase ArcGIS Online items on a page.  The content slider automatically rotates through all items that have been configured to be showcased through the widget.</p>
					<p><a href="http://www.geo-jobe.com/wp/web-maps-for-wordpress-pro-plugin/" target="_blank"><img src="http://cdn.geopowered.com/Applications/WordPressPlugins/AGOL/Free/info/VersionChart500x600.png" alt="Version comparison" /></a></p>										
				</div>
				<div id="addmap">
					<h3>Add Map Button</h3>
					<p>The Add Map button is designed to provide WordPress users with a more streamlined process for embedding web maps in their pages and posts.  While very similar to the Add Media button, Add Map puts millions of interactive maps at the fingertips of bloggers, website creators, media outlets and news organizations.  For the first time, millions of WordPress users will be able to seamlessly enhance the information they’re communicating through their website with authoritative maps exposing authoritative content from authoritative sources.</p>
					<p>The following outlines various features of the Add Map button:</p>
					<h3>Searching for Maps</h3>
					<ul>
						<li>Search millions of interactive web maps using one or more keywords.</li>
						<li>Choose to search public ArcGIS maps or your specific organization only</li>
						<li>All public web maps registered with ArcGIS Online that have a name or contain tags matching your keywords will be returned.</li>
						<li>Search results will be displayed in a grid view showing the name and image of the map.</li>
						<li>Hovering over a map will provide additional details (owner, description, etc.) that will help to inform users on whether or not this map is showcasing the right content.</li>
						<li>A map details link will take you to the ArcGIS Online item details page where a variety of additional information about this map is available.</li>
					</ul>
					<h3>Configuring Maps</h3>
					<ul>
						<li>Once a map has been selected, the user is presented with a variety of settings that can be configured before the map is embedded.</li>
						<li>You can set a custom extent in the map preview by panning and zooming to the desired location and clicking the “Set Extent” button on the Advanced Formatting > Layout tabs.</li>
						<li>The Layout tab also allows you to set the size and alignment of your map window as well as the option to show a view larger button and home button that will recenter the map to the default extent.</li>
						<li>The Search tab allows you to set a location search inside the map widget. You also have the option to limit the search extent as well as provide a default location for the map to open.</li>
						<li>The Side Panel tab will allow you to show a legend and map description if needed.</li>
						<li>Under the Mapping Options Tab, you can set a customized marker to display on the map. Click the Set Marker button, then click on a point in the preview map. You can then provide a marker title, description and a url to an image that will display at the map location. </li>
						<li>You can also show a scale bar, disable map scrolling and toggle a basemap under the Mapping Options tab.</li>
						<li>If you wish to search for a specific feature in a searchable layer, you can use the Advanced Tab to provide that information.</li>				
					</ul>
					<h3>Viewing Maps</h3>
					<ul>
						<li>Embedded maps are fully interactive, which means that users can zoom in/out and identify features on the map.</li>
						<li>All visible data and capabilities exposed on each map layer are controlled within ArcGIS Online by the map creator.</li>
						<li>For layers with pop-ups enabled, users can click on features to see additional information in a pop-up dialog.</li>
						<li>Additional map controls exposed to the user (scale bar, legend, etc.) are determined on the WordPress side by the map settings.</li>
						<li>For users that want a more robust experience for interacting with the map, they can click the “view larger map” link which will open the web map up in the ArcGIS Online map viewer.</li>
					</ul>
				</div>
				<div id="webmapshortcode">
					<h3>[webmap] Shortcode</h3>
					
					<p>If you are an advanced user that knows the exact information you would like to use for map content, you can provide a [webmap] shortcode to generate a map for your post or page. The format for the [webmap] shortcode is:</p>
					<p><strong>[webmap id=webmapidhere attr=value … attr=value]</strong></p>
					<p>The attributes [webmap] recognizes are:</p>
		
					<h3>Mapping:</h3>
					<ul>
					<li>
					<p><strong>id=yourwebmapid</strong><span><br/></span><span> [required] the id of the webmap </span><span><br/></span><em>(example: id=432a8d7ca22d4b5b859e0bdaa30ae118)</em></p>
					</li>
					<li>
					<p><strong>width=100%</strong><span><br/></span><span>The width of the map. Be sure to specify % or px at the end of your value. <em>(default: 100%)</em></span></p>
					</li>
					<li>
					<p><strong>height=500px</strong><span><br/></span><span>The height of the map. Be sure to specify % or px at the end of your value.</span></p>
					</li>
					<li>
					<p><strong>extent=xmin,ymin,xmax,ymax</strong><span><br/></span><span>Specifies the extent to be used when the map loads. This overrides the map&rsquo;s default extent. Only geographic coordinate system values are valid. <em>(ex: </em></span><em>extent=-86.179,39.923,-85.932,40.075)</em></p>
					</li>
					<li>
					<p><strong>center=x,y</strong><span><br/></span><span>Centers the map using geographic coordinates (x,y).</span><span><br/></span><em>(ex: center=-86.39,39.84)</em></p>
					</li>
					<li>
					<p><strong>level=levelamt</strong><span><br/></span><span>The level ID of the cached scale as listed in the REST endpoint of the basemap. This determines the default zoom level when the map loads, for example, </span><span><em>level=9</em></span><span>.</span></p>
					</li>
					<li>
					<p><strong>zoom=true|false</strong><span><br/></span><span>When set to </span><span>true</span><span>, the zoom in and zoom out buttons are displayed. Their location in the map can be controlled by the </span><span>zoom_position</span><span> parameter. <em>(ex: zoom=true)</em></span></p>
					</li>
					<li>
					<p><strong>zoom_position=top-left|bottom-left|top-right|bottom-right</strong><span><br/></span><span>Determines the location of the zoom control buttons. Valid options are </span><span>top-left</span><span>(default), </span><span>bottom-left</span><span>, </span><span>top-right</span><span>, or </span><span>bottom-right</span><span>. If the </span><span>home</span><span> parameter is set to </span><span>true</span><span>, the home button also moves according to the value of the </span><span>zoom_position</span><span> parameter.</span></p>
					</li>
					<li>
					<p><strong>home=true|false</strong><span><br/></span><span>When set to </span><span>true</span><span>, the home button is displayed. The home button is used to navigate back to the map&rsquo;s default extent.&nbsp;</span></p>
					</li>
					<li>
					<p><strong>scale=true|false</strong><span><br/></span><span>When set to </span><span>true</span><span>, the scale bar is displayed. The scale bar appears in the lower-left corner of the map.</span></p>
					</li>
					<li>
					<p><strong>disable_scroll=true|false</strong><span><br/></span><span>When set to </span><span>true</span><span>, mouse scrolling for zoom is disabled.</span></p>
					</li>
					<li>
					<p><strong>marker=longitude;latitude;wkid;description;URL;title</strong><span><br/></span><span>Places a desired image as a marker symbol with a pop-up in the map at a chosen location. Syntax is </span><span>marker=longitude;latitude;wkid;description;URL;title</span><span>. Longitude and latitude are required; the other values are optional. <em>(ex: </em></span><em>marker=-86.52;39.18;;Assembly%20Hall;https://cdn-png.si.com/sites/default/files/teams/basketball/cbk/logos/ind_200.png)</em></p>
					</li>
					<li>
					<p><strong>basemap_toggle=true|false</strong><span><br/></span><span>The basemap toggle button is displayed. This must be set to </span><span>true</span><span> in order to use </span><span>alt_basemap</span><span>.</span></p>
					</li>
					<li>
					<p><strong>alt_basemap=streets|satellite|hybrid|topo|gray|oceans|national-geographic|osm|terrain|dark-gray</strong><span><br/></span><span>Controls which basemap is used as the alternate basemap in the basemap toggle. The </span><span>basemap_toggle</span><span> parameter must be set to </span><span>true</span><span> in order to use </span><span>alt_basemap</span><span>. If no alternative basemap is specified, the satellite basemap is used. Valid values are </span><span>streets</span><span>, </span><span>satellite</span><span>, </span><span>hybrid</span><span>,</span><span>topo</span><span>,</span><span>gray</span><span>, </span><span>oceans</span><span>, </span><span>national-geographic</span><span>, </span><span>osm</span><span>, </span><span>terrain</span><span>, and </span><span>dark-gray</span><span>.</span></p>
					</li>
					</ul>
					<h3>Geosearch:</h3>
					<ul>
					<li>
					<p><strong>search=true|false</strong><span><br/></span><span>When set to true, the search widget is displayed.</span></p>
					</li>
					<li>
					<p><strong>searchextent=true|false</strong><span><br/></span><span>When set to </span><span>true</span><span>, a geosearch through the search widget returns results that are within the default extent of the map.</span></p>
					</li>
					<li>
					<p><strong>find=addressorlocationvalue</strong><span><br/></span><span>Opens the map at a specific location. The find parameter can be used for searching by addresses or places (geocoding) or for searching attribute field values from a searchable layer. This parameter returns results from all search resources to which the map has access. </span></p>
					</li>
					<li>
					<p><strong>feature=layerID;searchfield;searchvalue</strong><span><br/></span><span>Allows searching for a specific feature in a searchable layer. Find Locations by Layer needs to be set up on the map for a searchable field. The syntax is feature=layerID;searchfield;searchvalue, for example, <em>feature=CentralIndianaCities_634;PLACEFIPS;05860</em></span></p>
					</li>
					</ul>
					<h3>Layout:</h3>
					<ul>
					<li>
					<p><strong>theme=light|dark</strong><span><br/></span><span>Determines the color theme applied to the side panel and buttons. Valid options are light or dark.</span></p>
					</li>
					<li>
					<p><strong>legend=true|false</strong><span><br/></span><span>When set to true, a legend displays in the side panel showing the layers in the map.</span></p>
					</li>
					<li>
					<p><strong>details=true|false</strong><span><br/></span><span>When set to true, the map&rsquo;s description text appears in the side panel.</span></p>
					</li>
					<li>
					<p><strong>show_panel=true|false</strong><span><br/></span><span>When set to true, the side panel displays when the map loads. The default is false.</span></p>
					</li>
					<li>
					<p><strong>active_panel=legend|details</strong><span><br/></span><span>Sets which tab is active in the side panel when the map loads. Valid options are legend or details. The legend or details parameter must be set to true if used as the value for the active_panel parameter.</span></p>
					</li>
					<li>
					<p><strong>popup_sidepanel=true|false</strong><span><br/></span><span>When set to true, pop-up information is presented on the info tab of the side panel instead of in the map.</span></p>
					</li>
					</ul>
				
				</div>
			</div>					

<script type="text/javascript">
	jQuery(document).ready(function($) {
		jQuery(".ui-tabs").tabs({
				fx: { opacity: "toggle", duration: "fast" }
			});
	});
</script>
<?php
	echo '</form>';

	echo '<script type="text/javascript">
		/*jQuery(document).ready(function($) {
			var sections = [];';

			foreach ( $this->sections as $section_slug => $section )
				echo "sections['$section'] = '$section_slug';";

			echo 'var wrapped = $(".wrap h3").wrap("<div class=\"ui-tabs-panel\">");
			wrapped.each(function() {
				$(this).parent().append($(this).parent().nextUntil("div.ui-tabs-panel"));
			});
			$(".ui-tabs-panel").each(function(index) {
				$(this).attr("id", sections[$(this).children("h2").text()]);
				if (index > 0)
					$(this).addClass("ui-tabs-hide");
			});
			$(".ui-tabs").tabs({
				fx: { opacity: "toggle", duration: "fast" }
			});
			$("input[type=text], textarea").each(function() {
				if ($(this).val() == $(this).attr("placeholder") || $(this).val() == "")
					$(this).css("color", "#999");
			});

			$("input[type=text], textarea").focus(function() {
				if ($(this).val() == $(this).attr("placeholder") || $(this).val() == "") {
					$(this).val("");
					$(this).css("color", "#000");
				}
			}).blur(function() {
				if ($(this).val() == "" || $(this).val() == $(this).attr("placeholder")) {
					$(this).val($(this).attr("placeholder"));
					$(this).css("color", "#999");
				}
			});

			$(".wrap h3").show();

			// This will make the "warning" checkbox class really stand out when checked.
			// I use it here for the Reset checkbox.
			$(".warning").change(function() {
				if ($(this).is(":checked"))
					$(this).parent().css("background", "#c00").css("color", "#fff").css("fontWeight", "bold");
				else
					$(this).parent().css("background", "none").css("color", "inherit").css("fontWeight", "normal");
			});

			// Browser compatibility
			if ($.browser.mozilla)
			         $("form").attr("autocomplete", "off");
		});*/
	</script>
</div>';

	}
/**
	 * Description for section
	 *

	 */
	public function display_section() {
		echo '<p><a href="http://www.geo-jobe.com/wp/web-maps-for-wordpress-pro-plugin/" target="_blank"><img src="http://cdn.geopowered.com/Applications/WordPressPlugins/AGOL/Free/info/VersionChart500x600.png" alt="Version comparison" /></a></p>';
	}

	/**
	 * Description for About section
	 *
	 */
	public function display_about_section() {

		// Code

	}
	/**
	 * HTML output for text field
	 */
	public function display_setting( $args = array() ) {

		extract( $args );

		$options = get_option( 'agolforwp_options' );

		if ( ! isset( $options[$id] ) && $type != 'checkbox' )
			$options[$id] = $std;
		elseif ( ! isset( $options[$id] ) )
			$options[$id] = 0;

		$field_class = '';
		if ( $class != '' )
			$field_class = ' ' . $class;

		switch ( $type ) {

			case 'heading':
				echo '<h4>' . $desc . '</h4>';
				break;

			case 'checkbox':

				echo '<input class="checkbox' . $field_class . '" type="checkbox" id="' . $id . '" name="agolforwp_options[' . $id . ']" value="1" ' . checked( $options[$id], 1, false ) . ' /> <label for="' . $id . '">' . $desc . '</label>';

				break;

			case 'select':
				echo '<select class="select' . $field_class . '" name="agolforwp_options[' . $id . ']">';

				foreach ( $choices as $value => $label )
					echo '<option value="' . esc_attr( $value ) . '"' . selected( $options[$id], $value, false ) . '>' . $label . '</option>';

				echo '</select>';

				if ( $desc != '' )
					echo '<br /><span class="description">' . $desc . '</span>';

				break;

			case 'radio':
				$i = 0;
				foreach ( $choices as $value => $label ) {
					echo '<input class="radio' . $field_class . '" type="radio" name="agolforwp_options[' . $id . ']" id="' . $id . $i . '" value="' . esc_attr( $value ) . '" ' . checked( $options[$id], $value, false ) . '> <label for="' . $id . $i . '">' . $label . '</label>';
					if ( $i < count( $options ) - 1 )
						echo '<br />';
					$i++;
				}

				if ( $desc != '' )
					echo '<br /><span class="description">' . $desc . '</span>';

				break;

			case 'textarea':
				echo '<textarea class="' . $field_class . '" id="' . $id . '" name="agolforwp_options[' . $id . ']" placeholder="' . $std . '" rows="5" cols="30">' . wp_htmledit_pre( $options[$id] ) . '</textarea>';

				if ( $desc != '' )
					echo '<br /><span class="description">' . $desc . '</span>';

				break;

			case 'password':
				echo '<input class="regular-text' . $field_class . '" type="password" id="' . $id . '" name="agolforwp_options[' . $id . ']" value="' . esc_attr( $options[$id] ) . '" />';

				if ( $desc != '' )
					echo '<br /><span class="description">' . $desc . '</span>';

				break;

			case 'text':
			default:
		 		echo '<input class="regular-text' . $field_class . '" type="text" id="' . $id . '" name="agolforwp_options[' . $id . ']" placeholder="' . $std . '" value="' . esc_attr( $options[$id] ) . '" />';

		 		if ( $desc != '' )
		 			echo '<br /><span class="description">' . $desc . '</span>';

		 		break;

		}

	}

	/**
	 * Settings and defaults
	 *
	 */
	public function get_settings() {
	}

	/**
	 * Initialize settings to their default values
	 *
	 */
	public function initialize_settings() {

		$default_settings = array();
		foreach ( $this->settings as $id => $setting ) {
			if ( $setting['type'] != 'heading' )
				$default_settings[$id] = $setting['std'];
		}

		update_option( 'agolforwp_options', $default_settings );

	}

	/**
	* Register settings
	*
	*/
	public function register_settings() {

		register_setting( 'agolforwp_options', 'agolforwp_options', array ( &$this, 'validate_settings' ) );

		foreach ( $this->sections as $slug => $title ) {
			if ( $slug == 'about' )
				add_settings_section( $slug, $title, array( &$this, 'display_about_section' ), 'agolforwp-options' );
			else
				add_settings_section( $slug, $title, array( &$this, 'display_section' ), 'agolforwp-options' );
		}

		$this->get_settings();

		foreach ( $this->settings as $id => $setting ) {
			$setting['id'] = $id;
			$this->create_setting( $setting );
		}

	}

	/**
	* jQuery Tabs
	*
	*/
	public function scripts() {

		wp_print_scripts( 'jquery-ui-tabs' );

	}

	/**
	* Styling for the plugin options page
	*
	*/
	public function styles() {
		wp_register_style( 'agol_for_wp_tab_style', plugins_url('../../../styles/jquery-ui.css', __FILE__) );
		wp_enqueue_style('agol_for_wp_tab_style');
	}

	/**
	* Validate settings
	*
	* @since 1.0
	*/
	public function validate_settings( $input ) {

		if ( ! isset( $input['reset_plugin'] ) ) {
			$options = get_option( 'agolforwp_options' );

			foreach ( $this->checkboxes as $id ) {
				if ( isset( $options[$id] ) && ! isset( $input[$id] ) )
					unset( $options[$id] );
			}

			return $input;
		}
		return false;

	}

}

function agolforwp_option( $option ) {
	$options = get_option( 'agolforwp_options' );
	if ( isset( $options[$option] ) )
		return $options[$option];
	else
		return false;
}
?>