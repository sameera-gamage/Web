<?php
/*
  Site configuration.

  Copy this to config.local.php and edit that instead if you want to keep your
  password out of the repository — config.local.php wins when it exists.
*/
declare(strict_types=1);

$config = [
    'db' => [
        // 'sqlite' needs no database server — the site creates and seeds a file
        // the first time it runs. Switch to 'mysql' only if you want to use one.
        'driver'      => 'sqlite',
        'sqlite_path' => __DIR__ . '/../data/rapidstudio.sqlite',

        // used only when driver is 'mysql'
        'host' => '127.0.0.1',
        'name' => 'rapidstudio',
        'user' => 'root',
        'pass' => '',
        'charset' => 'utf8mb4',
    ],

    // The admin login. Generate a fresh hash and paste it here:
    //   php -r "echo password_hash('your password', PASSWORD_DEFAULT), PHP_EOL;"
    // The default below is the password: changeme
    'admin_user' => 'admin',
    'admin_hash' => '$2y$12$bCK/jIYrrVyz3ytmkQqZ.O9ABzcnkMrCWVjGa6ClGq0fW/i3UZBZC',

    // Where uploads land, relative to the site root, and what is allowed in.
    'upload_dir'  => __DIR__ . '/../uploads',
    'upload_url'  => '/uploads',
    'max_upload'  => 64 * 1024 * 1024,   // 64 MB, enough for a short clip
    'allow_image' => ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'],
    'allow_video' => ['video/mp4' => 'mp4', 'video/webm' => 'webm'],

    // Set this to the folder the site is served from. '' when it is the domain
    // root, '/rapidstudio' when it sits in a subfolder of htdocs.
    'base' => '/rapidstudio',
];

$local = __DIR__ . '/config.local.php';
if (is_file($local)) {
    $override = require $local;
    if (is_array($override)) {
        $config = array_replace_recursive($config, $override);
    }
}

return $config;
