<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

/**
 * Take one uploaded file and put it in /uploads.
 *
 * The extension the browser sent is never trusted: the type is read from the
 * file's own bytes and only then mapped to an extension we allow. The stored
 * name is generated, so nothing a user typed ever becomes a path.
 *
 * @return array{ok:bool, url?:string, kind?:string, error?:string}
 */
function store_upload(array $file, string $expect = 'any'): array
{
    $config = require __DIR__ . '/config.php';

    if (!isset($file['error']) || is_array($file['error'])) {
        return ['ok' => false, 'error' => 'Nothing was uploaded.'];
    }
    switch ($file['error']) {
        case UPLOAD_ERR_OK: break;
        case UPLOAD_ERR_NO_FILE: return ['ok' => false, 'error' => 'No file chosen.'];
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE: return ['ok' => false, 'error' => 'That file is larger than the server allows.'];
        default: return ['ok' => false, 'error' => 'Upload failed.'];
    }
    if ($file['size'] > $config['max_upload']) {
        return ['ok' => false, 'error' => 'That file is over the ' . (int) ($config['max_upload'] / 1048576) . ' MB limit.'];
    }
    if (!is_uploaded_file($file['tmp_name'])) {
        return ['ok' => false, 'error' => 'Upload failed.'];
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string) $finfo->file($file['tmp_name']);

    $images = $config['allow_image'];
    $videos = $config['allow_video'];
    $allowed = match ($expect) {
        'image' => $images,
        'video' => $videos,
        default => $images + $videos,
    };
    if (!isset($allowed[$mime])) {
        return ['ok' => false, 'error' => 'That file type is not allowed (' . e($mime) . ').'];
    }
    $ext = $allowed[$mime];
    $kind = isset($images[$mime]) ? 'image' : 'video';

    $dir = $config['upload_dir'];
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        return ['ok' => false, 'error' => 'The uploads folder could not be created.'];
    }
    $name = date('Ymd') . '-' . bin2hex(random_bytes(8)) . '.' . $ext;
    $dest = $dir . '/' . $name;
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        return ['ok' => false, 'error' => 'The file could not be saved.'];
    }
    @chmod($dest, 0644);

    return ['ok' => true, 'url' => $config['upload_url'] . '/' . $name, 'kind' => $kind];
}

/** Remove a file we previously stored, if it is one of ours. */
function drop_upload(?string $urlPath): void
{
    if (!$urlPath) { return; }
    $config = require __DIR__ . '/config.php';
    $prefix = rtrim($config['upload_url'], '/') . '/';
    if (!str_starts_with($urlPath, $prefix)) { return; }     // not ours, leave it
    $name = basename($urlPath);
    $full = $config['upload_dir'] . '/' . $name;
    if (is_file($full)) { @unlink($full); }
}
