<?php
/* =====================================================================
   Excello — site configuration
   Everything you might want to change lives here.
   ===================================================================== */

/* ---- Database (XAMPP defaults) ------------------------------------
   Fresh XAMPP: host 127.0.0.1, user "root", empty password.
   The site creates the database and tables by itself on first load,
   so you do not need to touch phpMyAdmin. If your MySQL has a password,
   set DB_PASS below.                                                   */
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'excello');
define('DB_USER', 'root');
define('DB_PASS', '');

/* ---- Admin login --------------------------------------------------
   Change these before you go live. The password is stored as a hash
   the first time the site runs, but this is the login you type.        */
define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'excello2026');

/* ---- Site details -------------------------------------------------- */
define('SITE_NAME',    'Excello');
define('SITE_TAGLINE', 'From the ground to the keys.');
define('SALES_EMAIL',  'Sales@excello.lk');
define('SITE_PHONE',   '+94 77 022 2000');
define('SITE_PHONE_RAW','94770222000');            /* for tel: / WhatsApp */
define('SITE_ADDRESS', "No 16, St Rita's Road, Mount Lavinia");

/* ---- Base URL path ------------------------------------------------
   If the site lives at http://localhost/excello/ leave this as
   "/excello". If it sits at the web root, set it to "".                */
define('BASE_PATH', '/excello');

/* ---- Cost calculator rate table (indicative, LKR per sq ft) --------
   The team can edit these numbers; the calculator reads them live.     */
$COST_RATES = [
    'standard' => ['label' => 'Standard',      'rate' => 9500],
    'premium'  => ['label' => 'Premium',       'rate' => 14500],
    'luxury'   => ['label' => 'Luxury',        'rate' => 22000],
];

date_default_timezone_set('Asia/Colombo');
