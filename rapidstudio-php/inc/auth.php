<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

function session_boot(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        // secure is left off so this works over plain http on XAMPP; turn it on
        // once the site is behind https
        'secure'   => !empty($_SERVER['HTTPS']),
    ]);
    session_start();
}

function is_admin(): bool
{
    session_boot();
    return !empty($_SESSION['admin']);
}

function require_admin(): void
{
    if (!is_admin()) {
        header('Location: ' . url('/admin/login.php'));
        exit;
    }
}

function attempt_login(string $user, string $pass): bool
{
    $config = require __DIR__ . '/config.php';
    // compare both, and always run the hash check, so a wrong username and a
    // wrong password take the same time to fail
    $userOk = hash_equals((string) $config['admin_user'], $user);
    $passOk = password_verify($pass, (string) $config['admin_hash']);
    if (!($userOk && $passOk)) {
        return false;
    }
    session_boot();
    session_regenerate_id(true);   // a session fixed before login is now useless
    $_SESSION['admin'] = true;
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return true;
}

function logout(): void
{
    session_boot();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

function csrf_token(): string
{
    session_boot();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="_csrf" value="' . e(csrf_token()) . '">';
}

/** Every POST in the admin goes through this before it touches anything. */
function check_csrf(): void
{
    session_boot();
    $sent = (string) ($_POST['_csrf'] ?? '');
    if ($sent === '' || empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $sent)) {
        http_response_code(400);
        exit('Bad request — please go back, reload the page and try again.');
    }
}
