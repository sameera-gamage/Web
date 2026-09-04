<?php
declare(strict_types=1);
require_once __DIR__ . '/../inc/auth.php';
require_once __DIR__ . '/../inc/db.php';
require_once __DIR__ . '/_head.php';
require_admin();

ensure_leads();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $id = (int) ($_POST['id'] ?? 0);
    $do = (string) ($_POST['do'] ?? '');
    if ($do === 'seen' && $id) {
        db()->prepare('UPDATE leads SET seen = 1 - seen WHERE id = ?')->execute([$id]);
    } elseif ($do === 'delete' && $id) {
        db()->prepare('DELETE FROM leads WHERE id = ?')->execute([$id]);
        flash('Enquiry deleted.');
    }
    header('Location: ' . url('/admin/leads.php'));
    exit;
}

$leads = db()->query('SELECT * FROM leads ORDER BY created_at DESC, id DESC')->fetchAll();
admin_head('Enquiries');
admin_bar('leads');
?>
<main class="awrap">
  <?php show_flash(); ?>
  <div class="ahead">
    <h1>Enquiries</h1>
    <span class="sub"><?= count($leads) ?> total</span>
  </div>

  <?php if (!$leads): ?>
    <p class="empty">No enquiries yet. They&rsquo;ll show up here when the form on the home page is used.</p>
  <?php else: ?>
    <div class="leads">
      <?php foreach ($leads as $l): ?>
        <article class="lead<?= $l['seen'] ? ' is-seen' : '' ?>">
          <div class="lead-top">
            <div>
              <strong><?= e($l['name']) ?></strong>
              <a class="lnk" href="mailto:<?= e($l['email']) ?>"><?= e($l['email']) ?></a>
            </div>
            <div class="lead-meta">
              <?php if ($l['budget'] !== ''): ?><span class="pill"><?= e($l['budget']) ?></span><?php endif; ?>
              <time><?= e(date('j M Y, g:ia', strtotime((string) $l['created_at']))) ?></time>
            </div>
          </div>
          <?php if (trim((string) $l['message']) !== ''): ?>
            <p class="lead-msg"><?= nl2br(e($l['message'])) ?></p>
          <?php endif; ?>
          <div class="lead-act">
            <form method="post"><?= csrf_field() ?>
              <input type="hidden" name="id" value="<?= (int) $l['id'] ?>">
              <input type="hidden" name="do" value="seen">
              <button class="lnk"><?= $l['seen'] ? 'Mark unread' : 'Mark read' ?></button>
            </form>
            <form method="post" onsubmit="return confirm('Delete this enquiry?')">
              <?= csrf_field() ?>
              <input type="hidden" name="id" value="<?= (int) $l['id'] ?>">
              <input type="hidden" name="do" value="delete">
              <button class="lnk bad">Delete</button>
            </form>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</main>
</body></html>
