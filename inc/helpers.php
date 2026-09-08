<?php
/* Small shared helpers. */
require_once __DIR__ . '/config.php';

/* Escape for HTML output. */
function e($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

/* Build a URL under the site base path. */
function url(string $path = ''): string
{
    $path = ltrim($path, '/');
    return rtrim(BASE_PATH, '/') . '/' . $path;
}

/* Build an asset URL, cache-busted by file mtime. */
function asset(string $path): string
{
    $rel  = 'assets/' . ltrim($path, '/');
    $full = __DIR__ . '/../' . $rel;
    $v    = is_file($full) ? filemtime($full) : '1';
    return url($rel) . '?v=' . $v;
}

/* Image src for a stored cover: a real file in assets/img, else a poster
   placeholder that matches the chapter it belongs to. */
function cover_src(string $cover, string $fallback = 'chapter-04.jpg'): string
{
    $name = $cover !== '' ? $cover : $fallback;
    $file = __DIR__ . '/../assets/img/' . $name;
    if (is_file($file)) return asset('img/' . $name);
    // no real photo dropped in yet: use the palette poster of the same slot
    $poster = 'posters/' . preg_replace('/\.\w+$/', '.svg', $name);
    if (is_file(__DIR__ . '/../assets/img/' . $poster)) return asset('img/' . $poster);
    // last resort: a poster that always exists
    return asset('img/posters/chapter-04.svg');
}

/* Placeholder image from the light Mediterranean set (assets/img/ph/). */
function ph(string $name): string { return asset('img/ph/' . $name); }

/* Real (AI-enhanced) project photo from assets/img/real/. */
function rimg(string $name): string { return asset('img/real/' . $name); }

/* A bougainvillea corner overlay. $pos = tl|tr|bl|br */
function flower(string $pos): string
{
    return '<img class="flower ' . e($pos) . '" src="' . ph('flower-corner.svg') . '" alt="" aria-hidden="true">';
}

/* Current page slug for nav highlighting. */
function current_page(): string
{
    return basename($_SERVER['SCRIPT_NAME'] ?? '', '.php');
}

/* Chapter media for the home film. Prefers a dropped-in video, then a
   real photo, then the palette poster. Videos and photos both live in
   assets/ so the team just drops files in and they appear. */
function film_media(int $n, string $alt): string
{
    $base = 'chapter-' . str_pad((string)$n, 2, '0', STR_PAD_LEFT);
    $dir  = __DIR__ . '/../assets/';
    $poster = cover_src($base . '.jpg');
    foreach (['mp4', 'webm'] as $ext) {
        if (is_file($dir . 'video/' . $base . '.' . $ext)) {
            return '<video autoplay muted loop playsinline preload="metadata" '
                . 'poster="' . e($poster) . '" data-scrub>'
                . '<source src="' . e(asset('video/' . $base . '.' . $ext)) . '" type="video/' . $ext . '">'
                . '</video>';
        }
    }
    return '<img src="' . e($poster) . '" alt="' . e($alt) . '" loading="lazy">';
}

function nav_items(): array
{
    return [
        'index'    => ['Home',     url('')],
        'projects' => ['Projects', url('projects.php')],
        'services' => ['Services', url('services.php')],
        'team'     => ['Team',     url('team.php')],
        'insights' => ['Insights', url('insights.php')],
        'contact'  => ['Contact',  url('contact.php')],
    ];
}
