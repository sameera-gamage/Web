<?php
require_once __DIR__ . '/../inc/db.php';
require_once __DIR__ . '/../inc/helpers.php';
session_start();

function admin_logged_in(): bool { return !empty($_SESSION['admin']); }

function require_admin(): void
{
    if (!admin_logged_in()) {
        header('Location: ' . url('admin/login.php'));
        exit;
    }
}

function admin_url(string $p = ''): string { return url('admin/' . ltrim($p, '/')); }

/* CSRF for admin forms */
function admin_token(): string
{
    if (empty($_SESSION['admin_csrf'])) $_SESSION['admin_csrf'] = bin2hex(random_bytes(16));
    return $_SESSION['admin_csrf'];
}
function admin_check_token(): bool
{
    return isset($_POST['csrf']) && isset($_SESSION['admin_csrf'])
        && hash_equals($_SESSION['admin_csrf'], $_POST['csrf']);
}

/* Handle an optional cover upload; returns a filename to store or the fallback. */
function handle_cover_upload(string $fallback): string
{
    if (empty($_FILES['cover_file']['name']) || $_FILES['cover_file']['error'] !== UPLOAD_ERR_OK) {
        return $fallback;
    }
    $tmp = $_FILES['cover_file']['tmp_name'];
    $ext = strtolower(pathinfo($_FILES['cover_file']['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
    if (!in_array($ext, $allowed, true)) return $fallback;
    $safe = 'upload-' . date('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '.' . $ext;
    $dest = __DIR__ . '/../assets/img/' . $safe;
    return move_uploaded_file($tmp, $dest) ? $safe : $fallback;
}
