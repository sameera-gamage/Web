<?php
declare(strict_types=1);

/** Escape for HTML. Everything that reaches a template goes through this. */
function e(?string $v): string
{
    return htmlspecialchars((string) $v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function base_url(): string
{
    static $base = null;
    if ($base === null) {
        $config = require __DIR__ . '/config.php';
        $base = rtrim((string) $config['base'], '/');
    }
    return $base;
}

function url(string $path): string
{
    return base_url() . '/' . ltrim($path, '/');
}

/** A URL with a ?v=<mtime> tag, so browsers always fetch the latest build. */
function asset_url(string $path): string
{
    $rel = '/' . ltrim($path, '/');
    $file = __DIR__ . '/..' . $rel;
    $v = is_file($file) ? filemtime($file) : time();
    return base_url() . $rel . '?v=' . $v;
}

/** "one per line" text into a clean list. */
function lines(?string $text): array
{
    if ($text === null || trim($text) === '') {
        return [];
    }
    $out = [];
    foreach (preg_split('/\R/', $text) as $line) {
        $line = trim($line);
        if ($line !== '') { $out[] = $line; }
    }
    return $out;
}

/** "figure | label" per line into pairs, so the results block stays editable as text. */
function pairs(?string $text): array
{
    $out = [];
    foreach (lines($text) as $line) {
        $bits = array_map('trim', explode('|', $line, 2));
        $out[] = [$bits[0], $bits[1] ?? ''];
    }
    return $out;
}

function slugify(string $s): string
{
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    return trim($s, '-') ?: 'project';
}

/** A slug nothing else is using. */
function unique_slug(string $slug, ?int $ignoreId = null): string
{
    $base = slugify($slug);
    $try = $base;
    $n = 2;
    while (true) {
        $sql = 'SELECT id FROM projects WHERE slug = ?' . ($ignoreId ? ' AND id <> ?' : '');
        $st = db()->prepare($sql);
        $st->execute($ignoreId ? [$try, $ignoreId] : [$try]);
        if (!$st->fetch()) { return $try; }
        $try = $base . '-' . $n++;
    }
}
