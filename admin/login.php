<?php
require_once __DIR__ . '/auth.php';
if (admin_logged_in()) { header('Location: ' . admin_url('')); exit; }

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $u = $_POST['user'] ?? '';
    $p = $_POST['pass'] ?? '';
    if (hash_equals(ADMIN_USER, $u) && hash_equals(ADMIN_PASS, $p)) {
        session_regenerate_id(true);
        $_SESSION['admin'] = true;
        header('Location: ' . admin_url(''));
        exit;
    }
    $error = 'Wrong username or password.';
}
$admin_title = 'Log in';
require __DIR__ . '/_head.php';
?>
<div class="card" style="max-width:420px;margin:6vh auto">
  <h2 style="font-size:1.8rem;margin-bottom:.4rem">Log in</h2>
  <p class="muted" style="margin-top:0;font-size:.86rem">Manage projects, articles, and enquiries.</p>
  <?php if ($error): ?><div class="flash" style="background:rgba(200,80,60,.12);border-color:rgba(200,80,60,.4);color:#e8a996"><?= e($error) ?></div><?php endif; ?>
  <form method="post">
    <div class="field"><label>Username</label><input name="user" autofocus required></div>
    <div class="field"><label>Password</label><input name="pass" type="password" required></div>
    <button class="btn" type="submit">Log in</button>
  </form>
</div>
<?php require __DIR__ . '/_foot.php'; ?>
