<?php
declare(strict_types=1);
function admin_head(string $title): void
{
    $b = base_url();
    ?><!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title><?= e($title) ?> — RapidStudio admin</title>
  <link rel="stylesheet" href="<?= e($b) ?>/assets/admin.css">
</head>
<body>
<?php
}
function admin_bar(string $here = ''): void
{
    ?>
  <header class="abar">
    <a class="abar-mark" href="<?= e(url('/admin/')) ?>">Rapid<span>&bull;</span>Studio <em>admin</em></a>
    <nav class="abar-nav">
      <a href="<?= e(url('/admin/')) ?>"<?= $here === 'list' ? ' class="on"' : '' ?>>Projects</a>
      <a href="<?= e(url('/admin/edit.php')) ?>"<?= $here === 'new' ? ' class="on"' : '' ?>>Add a project</a>
      <a href="<?= e(url('/admin/leads.php')) ?>"<?= $here === 'leads' ? ' class="on"' : '' ?>>Enquiries</a>
      <a href="<?= e(url('/')) ?>" target="_blank" rel="noopener">View site &nearr;</a>
      <a href="<?= e(url('/admin/logout.php')) ?>" class="out">Sign out</a>
    </nav>
  </header>
<?php
}
function flash(string $msg, string $kind = 'ok'): void
{
    session_boot();
    $_SESSION['flash'] = ['msg' => $msg, 'kind' => $kind];
}
function show_flash(): void
{
    session_boot();
    if (empty($_SESSION['flash'])) { return; }
    $f = $_SESSION['flash'];
    unset($_SESSION['flash']);
    echo '<p class="note note-' . e($f['kind']) . '">' . e($f['msg']) . '</p>';
}
