<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'imagina');

/** MySQL database username */
define('DB_USER', 'root');

/** MySQL database password */
define('DB_PASSWORD', '');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'X7`R%}R$/ia&zedZjJ,?1@/&cDI8k`t$Y3C,Yr,T%^d6~ERKb93 KIw`I;n# |%A');
define('SECURE_AUTH_KEY',  '9G+ZN|/W/|HGpWm;84l9xjEfgD{g`n$.p&S<sZ{fD:wxh6C%W/X.~2#oc#5K!sjp');
define('LOGGED_IN_KEY',    'CN|3_j8g^y1/Vf2}*s>{d*4?ln#)7Y0;*6v&8*%WY8AS(.4u/;+phPuAqJ(r%%dF');
define('NONCE_KEY',        '-Ki%%tl[N]|%JPf+N^r_e9,W/H>~vx1Hb8W^e(/RDC5,R6v-|jHcHb7|%uEfq^eF');
define('AUTH_SALT',        '6EAfDx+tn7oga./n.muz~FVJP|MA7[(; [KR}bOq9GO_*_[-|HDfQ+Vb=h4C)>3,');
define('SECURE_AUTH_SALT', 'teUXkp+3KJmnkpLh8aQf[[KlA#M17n-P4=rso&%r!}KiHhAzol#:U)^8(]`}moPF');
define('LOGGED_IN_SALT',   'VPMWM(Q1KKhWHLeqIZ8J*.MphN9-bE{I*=chb+>=mvM8!>Uo7W!,h@7oo{q*/C<u');
define('NONCE_SALT',       'KCNc@kowjyq%U{:JB2LqJ&z~#+Qm]*hu{w1f(9Uw1kpnje:]&l$S83tz,Y<+j;Rg');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
