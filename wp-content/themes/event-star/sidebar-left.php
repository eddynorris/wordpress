<?php
/**
 * The left sidebar containing the main widget area.
 */
if ( ! is_active_sidebar( 'event-star-sidebar' ) ) {
    return;
}
$sidebar_layout = event_star_sidebar_selection();
if( $sidebar_layout == "left-sidebar" ) : ?>
    <div id="secondary-left" class="at-fixed-width widget-area sidebar secondary-sidebar" role="complementary">
        <div id="sidebar-section-top" class="widget-area sidebar init-animate clearfix">
            <?php dynamic_sidebar( 'event-star-sidebar' ); ?>
        </div>
    </div>
<?php endif;