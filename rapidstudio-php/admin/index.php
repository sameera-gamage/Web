<?php
declare(strict_types=1);
require_once __DIR__ . '/../inc/auth.php';
require_once __DIR__ . '/../inc/db.php';
require_once __DIR__ . '/_head.php';
require_admin();

// reorder / delete / publish all arrive here
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $id = (int) ($_POST['id'] ?? 0);
    $do = (string) ($_POST['do'] ?? '');

    if ($do === 'delete' && $id) {
        $st = db()->prepare('SELECT cover FROM projects WHERE id = ?');
        $st->execute([$id]);
        $row = $st->fetch();
        require_once __DIR__ . '/../inc/upload.php';
        foreach (project_media($id) as $m) {
            drop_upload($m['src']);
            drop_upload($m['poster']);
        }
        if ($row) { drop_upload($row['cover']); }
        db()->prepare('DELETE FROM projects WHERE id = ?')->execute([$id]);
        flash('Project deleted.');
    } elseif ($do === 'status' && $id) {
        $to = ($_POST['to'] ?? 'draft') === 'live' ? 'live' : 'draft';
        db()->prepare('UPDATE projects SET status = ? WHERE id = ?')->execute([$to, $id]);
        flash($to === 'live' ? 'Project is now live.' : 'Project moved back to draft.');
    } elseif ($do === 'move' && $id) {
        $dir = ((int) ($_POST['dir'] ?? 0)) < 0 ? -1 : 1;
        $all = all_projects(true);
        $i = null;
        foreach ($all as $k => $p) { if ((int) $p['id'] === $id) { $i = $k; break; } }
        $j = $i === null ? null : $i + $dir;
        if ($i !== null && $j !== null && isset($all[$j])) {
            // rewrite the whole order, so gaps and ties can never accumulate
            [$all[$i], $all[$j]] = [$all[$j], $all[$i]];
            $st = db()->prepare('UPDATE projects SET sort = ? WHERE id = ?');
            foreach ($all as $k => $p) { $st->execute([$k * 10, (int) $p['id']]); }
        }
    }
    header('Location: ' . url('/admin/'));
    exit;
}

$projects = all_projects(true);
admin_head('Projects');
admin_bar('list');
?>
<main class="awrap">
  <?php show_flash(); ?>
  <div class="ahead">
    <h1>Projects</h1>
    <a class="btn" href="<?= e(url('/admin/edit.php')) ?>">Add a project</a>
  </div>

  <?php if (!$projects): ?>
    <p class="empty">Nothing here yet. <a href="<?= e(url('/admin/edit.php')) ?>">Add the first project.</a></p>
  <?php else: ?>
    <table class="atable">
      <thead><tr><th>Order</th><th>Project</th><th>Pictures</th><th>Status</th><th></th></tr></thead>
      <tbody>
      <?php foreach ($projects as $i => $p): $n = count(project_media((int) $p['id'])); ?>
        <tr>
          <td class="ord">
            <form method="post"><?= csrf_field() ?>
              <input type="hidden" name="id" value="<?= (int) $p['id'] ?>">
              <input type="hidden" name="do" value="move">
              <button name="dir" value="-1" <?= $i === 0 ? 'disabled' : '' ?> aria-label="Move up">&uarr;</button>
              <button name="dir" value="1" <?= $i === count($projects) - 1 ? 'disabled' : '' ?> aria-label="Move down">&darr;</button>
            </form>
          </td>
          <td>
            <a class="tt" href="<?= e(url('/admin/edit.php?id=' . (int) $p['id'])) ?>"><?= e($p['client']) ?></a>
            <span class="sub"><?= e($p['ref']) ?> · <?= e($p['title']) ?></span>
          </td>
          <td><?= $n ?></td>
          <td>
            <form method="post"><?= csrf_field() ?>
              <input type="hidden" name="id" value="<?= (int) $p['id'] ?>">
              <input type="hidden" name="do" value="status">
              <input type="hidden" name="to" value="<?= $p['status'] === 'live' ? 'draft' : 'live' ?>">
              <button class="pill pill-<?= e($p['status']) ?>"><?= $p['status'] === 'live' ? 'Live' : 'Draft' ?></button>
            </form>
          </td>
          <td class="right">
            <a class="lnk" href="<?= e(url('/projects/' . $p['slug'])) ?>" target="_blank" rel="noopener">View</a>
            <form method="post" onsubmit="return confirm('Delete <?= e(addslashes($p['client'])) ?> and its pictures? This cannot be undone.')">
              <?= csrf_field() ?>
              <input type="hidden" name="id" value="<?= (int) $p['id'] ?>">
              <input type="hidden" name="do" value="delete">
              <button class="lnk bad">Delete</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>
</main>
</body></html>
