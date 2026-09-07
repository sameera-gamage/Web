<?php
require_once __DIR__ . '/auth.php';
require_admin();
$pdo = db();
$flash = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && admin_check_token()) {
    $action = $_POST['action'] ?? '';
    $id = (int)($_POST['id'] ?? 0);
    if ($action === 'toggle') {
        $pdo->prepare('UPDATE enquiries SET handled = 1 - handled WHERE id=?')->execute([$id]);
    } elseif ($action === 'delete') {
        $pdo->prepare('DELETE FROM enquiries WHERE id=?')->execute([$id]);
        $flash = 'Enquiry deleted.';
    }
}

$rows = $pdo->query('SELECT * FROM enquiries ORDER BY handled ASC, id DESC')->fetchAll();
$admin_title = 'Enquiries';
require __DIR__ . '/_head.php';
?>
<h1 style="font-size:2.2rem;margin-bottom:1.2rem">Enquiries</h1>
<?php if ($flash): ?><div class="flash"><?= e($flash) ?></div><?php endif; ?>

<div class="card">
  <?php if (!$rows): ?>
    <p class="muted">No enquiries yet. Submissions from the contact form land here.</p>
  <?php else: ?>
  <table>
    <tr><th>Name</th><th>Contact</th><th>Project</th><th>Message</th><th>When</th><th></th></tr>
    <?php foreach ($rows as $r): ?>
      <tr style="<?= $r['handled'] ? 'opacity:.55' : '' ?>">
        <td><?= e($r['name']) ?> <?= $r['handled'] ? '' : '<span class="pill on">new</span>' ?></td>
        <td>
          <?php if ($r['email']): ?><a href="mailto:<?= e($r['email']) ?>"><?= e($r['email']) ?></a><br><?php endif; ?>
          <?php if ($r['phone']): ?><a class="muted" href="tel:<?= e(preg_replace('/\s+/', '', $r['phone'])) ?>"><?= e($r['phone']) ?></a><?php endif; ?>
        </td>
        <td class="muted"><?= e($r['plot']) ?></td>
        <td class="muted" style="max-width:280px"><?= nl2br(e($r['message'])) ?></td>
        <td class="muted"><?= e(date('j M Y H:i', strtotime($r['created_at']))) ?></td>
        <td class="actions">
          <form method="post"><input type="hidden" name="csrf" value="<?= e(admin_token()) ?>"><input type="hidden" name="action" value="toggle"><input type="hidden" name="id" value="<?= (int)$r['id'] ?>"><button class="btn btn-sm btn-ghost"><?= $r['handled'] ? 'Mark new' : 'Mark done' ?></button></form>
          <form method="post" onsubmit="return confirm('Delete this enquiry?')"><input type="hidden" name="csrf" value="<?= e(admin_token()) ?>"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= (int)$r['id'] ?>"><button class="btn btn-sm btn-danger">Delete</button></form>
        </td>
      </tr>
    <?php endforeach; ?>
  </table>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/_foot.php'; ?>
