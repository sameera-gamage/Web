<?php
require_once __DIR__ . '/auth.php';
require_admin();
$pdo = db();
$flash = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && admin_check_token()) {
    $action = $_POST['action'] ?? '';
    if ($action === 'delete') {
        $pdo->prepare('DELETE FROM projects WHERE id=?')->execute([(int)$_POST['id']]);
        $flash = 'Project deleted.';
    } elseif ($action === 'save') {
        $id = (int)($_POST['id'] ?? 0);
        $cover = handle_cover_upload(trim($_POST['cover'] ?? ''));
        $data = [
            trim($_POST['title'] ?? ''),
            trim($_POST['type'] ?? 'villa'),
            trim($_POST['location'] ?? ''),
            trim($_POST['status'] ?? ''),
            $cover,
            trim($_POST['excerpt'] ?? ''),
            trim($_POST['body'] ?? ''),
            isset($_POST['featured']) ? 1 : 0,
            (int)($_POST['sort_order'] ?? 0),
        ];
        if ($id) {
            $data[] = $id;
            $pdo->prepare('UPDATE projects SET title=?,type=?,location=?,status=?,cover=?,excerpt=?,body=?,featured=?,sort_order=? WHERE id=?')->execute($data);
            $flash = 'Project updated.';
        } else {
            $pdo->prepare('INSERT INTO projects (title,type,location,status,cover,excerpt,body,featured,sort_order) VALUES (?,?,?,?,?,?,?,?,?)')->execute($data);
            $flash = 'Project added.';
        }
    }
}

$editing = null;
if (isset($_GET['edit'])) {
    $st = $pdo->prepare('SELECT * FROM projects WHERE id=?');
    $st->execute([(int)$_GET['edit']]);
    $editing = $st->fetch() ?: null;
}
$new = isset($_GET['new']);
$rows = $pdo->query('SELECT * FROM projects ORDER BY featured DESC, sort_order ASC, id DESC')->fetchAll();
$types = ['villa', 'house', 'hotel', 'commercial'];

$admin_title = 'Projects';
require __DIR__ . '/_head.php';
?>
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem">
  <h1 style="font-size:2.2rem">Projects</h1>
  <?php if (!$editing && !$new): ?><a class="btn" href="?new=1">+ New project</a><?php endif; ?>
</div>
<?php if ($flash): ?><div class="flash"><?= e($flash) ?></div><?php endif; ?>

<?php if ($editing || $new): $p = $editing ?: []; ?>
<div class="card">
  <h2 style="font-size:1.5rem;margin-bottom:1rem"><?= $editing ? 'Edit project' : 'New project' ?></h2>
  <form method="post" enctype="multipart/form-data">
    <input type="hidden" name="csrf" value="<?= e(admin_token()) ?>">
    <input type="hidden" name="action" value="save">
    <input type="hidden" name="id" value="<?= (int)($p['id'] ?? 0) ?>">
    <div class="row">
      <div class="field"><label>Title</label><input name="title" required value="<?= e($p['title'] ?? '') ?>"></div>
      <div class="field"><label>Type</label><select name="type"><?php foreach ($types as $t): ?><option value="<?= $t ?>"<?= ($p['type'] ?? '') === $t ? ' selected' : '' ?>><?= ucfirst($t) ?></option><?php endforeach; ?></select></div>
    </div>
    <div class="row">
      <div class="field"><label>Location</label><input name="location" value="<?= e($p['location'] ?? '') ?>"></div>
      <div class="field"><label>Status</label><input name="status" placeholder="Completed / In construction / In design" value="<?= e($p['status'] ?? '') ?>"></div>
    </div>
    <div class="field"><label>Short description</label><input name="excerpt" value="<?= e($p['excerpt'] ?? '') ?>"></div>
    <div class="field"><label>Body (optional)</label><textarea name="body"><?= e($p['body'] ?? '') ?></textarea></div>
    <div class="row">
      <div class="field"><label>Cover filename (in assets/img/)</label><input name="cover" placeholder="chapter-04.jpg" value="<?= e($p['cover'] ?? '') ?>"></div>
      <div class="field"><label>…or upload a cover image</label><input type="file" name="cover_file" accept="image/*"></div>
    </div>
    <div class="row">
      <div class="field"><label>Sort order</label><input name="sort_order" type="number" value="<?= (int)($p['sort_order'] ?? 0) ?>"></div>
      <div class="field" style="display:flex;align-items:end;gap:.5rem"><label style="margin:0"><input type="checkbox" name="featured" style="width:auto" <?= !empty($p['featured']) ? 'checked' : '' ?>> Featured on home</label></div>
    </div>
    <div class="actions" style="margin-top:.6rem">
      <button class="btn" type="submit">Save project</button>
      <a class="btn btn-ghost" href="<?= admin_url('projects.php') ?>">Cancel</a>
    </div>
  </form>
</div>
<?php else: ?>
<div class="card">
  <table>
    <tr><th></th><th>Title</th><th>Type</th><th>Location</th><th>Status</th><th></th></tr>
    <?php foreach ($rows as $r): ?>
      <tr>
        <td><img class="thumb" src="<?= cover_src($r['cover']) ?>" alt=""></td>
        <td><?= e($r['title']) ?><?= $r['featured'] ? ' <span class="pill on">lead</span>' : '' ?></td>
        <td class="muted"><?= e(ucfirst($r['type'])) ?></td>
        <td class="muted"><?= e($r['location']) ?></td>
        <td class="muted"><?= e($r['status']) ?></td>
        <td class="actions">
          <a class="btn btn-sm btn-ghost" href="?edit=<?= (int)$r['id'] ?>">Edit</a>
          <form method="post" onsubmit="return confirm('Delete this project?')">
            <input type="hidden" name="csrf" value="<?= e(admin_token()) ?>">
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
            <button class="btn btn-sm btn-danger">Delete</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
  </table>
</div>
<?php endif; ?>
<?php require __DIR__ . '/_foot.php'; ?>
