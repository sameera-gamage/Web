<?php
/*
  Routing for PHP's built-in server, which has no .htaccess.
  Apache (XAMPP, Hostinger) uses .htaccess instead and never loads this file.

      php -S localhost:8080 router.php

  It carries one thing Apache gives you for free and the built-in server does
  not: byte-range replies. The hero is a <video> scrubbed by scroll, and a
  browser refuses to seek a resource the server will not serve in parts —
  video.seekable comes back empty and currentTime silently does nothing, so the
  camera freezes on frame one with no error anywhere. Serving 206 here keeps the
  dev server honest about what Apache will do.
*/
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$file = realpath(__DIR__ . $path);
$root = realpath(__DIR__);

// Apache closes inc/ and sql/ with the .htaccess files in them; the built-in
// server does not read those, so without this the dev server would hand out the
// schema and this file would be verifying something the real site never does.
// seed.php is the one exception, and it checks for an admin session itself.
if (preg_match('#^/(inc|sql)/#', $path) && !preg_match('#^/sql/seed\.php$#', $path)) {
    http_response_code(403);
    exit('Forbidden');
}

if ($path !== '/' && $file !== false && is_file($file) && str_starts_with($file, $root)) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $ranged = ['mp4' => 'video/mp4', 'webm' => 'video/webm', 'mov' => 'video/quicktime'];
    if (!isset($ranged[$ext])) {
        return false;                   // let the server hand back the real file
    }

    $size = filesize($file);
    $start = 0;
    $end = $size - 1;
    $partial = false;

    header('Accept-Ranges: bytes');
    header('Content-Type: ' . $ranged[$ext]);

    $range = $_SERVER['HTTP_RANGE'] ?? '';
    if ($range !== '') {
        if (!preg_match('/^bytes=(\d*)-(\d*)$/', trim($range), $m) || ($m[1] === '' && $m[2] === '')) {
            header('HTTP/1.1 416 Range Not Satisfiable');
            header("Content-Range: bytes */$size");
            return true;
        }
        if ($m[1] === '') {                       // suffix range: the last N bytes
            $start = max(0, $size - (int) $m[2]);
        } else {
            $start = (int) $m[1];
            if ($m[2] !== '') $end = (int) $m[2];
        }
        $end = min($end, $size - 1);
        if ($start > $end) {
            header('HTTP/1.1 416 Range Not Satisfiable');
            header("Content-Range: bytes */$size");
            return true;
        }
        $partial = true;
    }

    if ($partial) {
        header('HTTP/1.1 206 Partial Content');
        header("Content-Range: bytes $start-$end/$size");
    }
    header('Content-Length: ' . ($end - $start + 1));

    $fh = fopen($file, 'rb');
    fseek($fh, $start);
    $left = $end - $start + 1;
    while ($left > 0 && !feof($fh)) {
        $chunk = fread($fh, min(262144, $left));
        if ($chunk === false || $chunk === '') break;
        echo $chunk;
        $left -= strlen($chunk);
        flush();
    }
    fclose($fh);
    return true;
}

if (preg_match('#^/projects/?$#', $path)) { require __DIR__ . '/projects.php'; return true; }
if (preg_match('#^/projects/([A-Za-z0-9-]+)/?$#', $path, $m)) {
    $_GET['slug'] = $m[1];
    require __DIR__ . '/project.php';
    return true;
}
if (preg_match('#^/admin/?$#', $path)) { require __DIR__ . '/admin/index.php'; return true; }
if ($path === '/') { require __DIR__ . '/index.php'; return true; }
return false;
