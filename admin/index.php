<?php
require_once __DIR__ . '/auth.php';
require_admin();

$pdo = db();
$nProjects = (int)$pdo->query('SELECT COUNT(*) FROM projects')->fetchColumn();
$nArticles = (int)$pdo->query('SELECT COUNT(*) FROM articles')->fetchColumn();
$nEnq      = (int)$pdo->query('SELECT COUNT(*) FROM enquiries')->fetchColumn();
$nNew      = (int)$pdo->query('SELECT COUNT(*) FROM enquiries WHERE handled=0')->fetchColumn();
$recent    = $pdo->query('SELECT * FROM enquiries ORDER BY id DESC LIMIT 5')->fetchAll();

$admin_title = 'Dashboard';
require __DIR__ . '/_head.php';
?>
<h1 style="font-size:2.2rem;margin-bottom:1.2rem">Dashboard</h1>
<div class="row" style="grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1.4rem">
  <a class="card" href="<?= admin_url('projects.php') ?>" style="text-align:center">
    <div style="font-family:'Cormorant Garamond',serif;font-size:2.6rem;color:var(--bronze-hi)"><?= $nProjects ?></div>
    <div class="muted">Projects</div>
  </a>
  <a class="card" href="<?= admin_url('articles.php') ?>" style="text-align:center">
    <div style="font-family:'Cormorant Garamond',serif;font-size:2.6rem;color:var(--bronze-hi)"><?= $nArticles ?></div>
    <div class="muted">Articles</div>
  </a>
  <a class="card" href="<?= admin_url('enquiries.php') ?>" style="text-align:center">
    <div style="font-family:'Cormorant Garamond',serif;font-size:2.6rem;color:var(--bronze-hi)"><?= $nEnq ?></div>
    <div class="muted">Enquiries<?= $nNew ? ' · ' . $nNew . ' new' : '' ?></div>
  </a>
</div>

<div class="card">
  <h2 style="font-size:1.5rem;margin-bottom:1rem">Latest enquiries</h2>
  <?php if (!$recent): ?>
    <p class="muted">No enquiries yet. They will appear here as visitors send the contact form.</p>
  <?php else: ?>
    <table>
      <tr><th>Name</th><th>Contact</th><th>Project</th><th>When</th></tr>
      <?php foreach ($recent as $r): ?>
        <tr>
          <td><?= e($r['name']) ?> <?= $r['handled'] ? '' : '<span class="pill on">new</span>' ?></td>
          <td><?= e($r['email']) ?><br><span class="muted"><?= e($r['phone']) ?></span></td>
          <td><?= e($r['plot']) ?></td>
          <td class="muted"><?= e(date('j M, H:i', strtotime($r['created_at']))) ?></td>
        </tr>
      <?php endforeach; ?>
    </table>
    <p style="margin-top:1rem"><a href="<?= admin_url('enquiries.php') ?>">See all enquiries →</a></p>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/_foot.php'; ?>
