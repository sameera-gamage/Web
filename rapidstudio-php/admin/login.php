<?php
declare(strict_types=1);
require_once __DIR__ . '/../inc/auth.php';
require_once __DIR__ . '/_head.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    if (attempt_login((string) ($_POST['user'] ?? ''), (string) ($_POST['pass'] ?? ''))) {
        header('Location: ' . url('/admin/'));
        exit;
    }
    // one message for both cases, so it cannot be used to discover a username
    $error = 'That did not match. Try again.';
    usleep(400000);
}

admin_head('Sign in');
?>
<main class="alogin">
  <form method="post" class="acard">
    <p class="acard-k">RapidStudio</p>
    <h1>Sign in</h1>
    <?php if ($error !== ''): ?><p class="note note-bad"><?= e($error) ?></p><?php endif; ?>
    <?= csrf_field() ?>
    <label>Username <input type="text" name="user" autocomplete="username" required autofocus></label>
    <label>Password <input type="password" name="pass" autocomplete="current-password" required></label>
    <button type="submit" class="btn">Sign in</button>
  </form>
</main>
</body></html>
