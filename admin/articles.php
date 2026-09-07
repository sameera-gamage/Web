<?php
require_once __DIR__ . '/auth.php';
require_admin();
$pdo = db();
$flash = '';

function slugify(string $s): string
{
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    return trim($s, '-');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && admin_check_token()) {
    $action = $_POST['action'] ?? '';
    if ($action === 'delete') {
        $pdo->prepare('DELETE FROM articles WHERE id=?')->execute([(int)$_POST['id']]);
        $flash = 'Article deleted.';
    } elseif ($action === 'save') {
        $id = (int)($_POST['id'] ?? 0);
        $cover = handle_cover_upload(trim($_POST['cover'] ?? ''));
        $title = trim($_POST['title'] ?? '');
        $pub = trim($_POST['published_at'] ?? '') ?: date('Y-m-d');
        $data = [
            $title, slugify($title), trim($_POST['category'] ?? 'Notes'), $cover,
            trim($_POST['excerpt'] ?? ''), trim($_POST['body'] ?? ''),
            ($_POST['status'] ?? 'live') === 'draft' ? 'draft' : 'live', $pub,
        ];
        if ($id) {
            $data[] = $id;
            $pdo->prepare('UPDATE articles SET title=?,slug=?,category=?,cover=?,excerpt=?,body=?,status=?,published_at=? WHERE id=?')->execute($data);
            $flash = 'Article updated.';
        } else {
            $pdo->prepare('INSERT INTO articles (title,slug,category,cover,excerpt,body,status,published_at) VALUES (?,?,?,?,?,?,?,?)')->execute($data);
            $flash = 'Article added.';
        }
    }
}

$editing = null;
if (isset($_GET['edit'])) {
    $st = $pdo->prepare('SELECT * FROM articles WHERE id=?');
    $st->execute([(int)$_GET['edit']]);
    $editing = $st->fetch() ?: null;
}
$new = isset($_GET['new']);
$rows = $pdo->query('SELECT * FROM articles ORDER BY published_at DESC, id DESC')->fetchAll();

$admin_title = 'Articles';
require __DIR__ . '/_head.php';
?>
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem">
  <h1 style="font-size:2.2rem">Articles</h1>
  <?php if (!$editing && !$new): ?><a class="btn" href="?new=1">+ New article</a><?php endif; ?>
</div>
<?php if ($flash): ?><div class="flash"><?= e($flash) ?></div><?php endif; ?>

<?php if ($editing || $new): $a = $editing ?: []; ?>
<div class="card">
  <h2 style="font-size:1.5rem;margin-bottom:1rem"><?= $editing ? 'Edit article' : 'New article' ?></h2>
  <form method="post" enctype="multipart/form-data">
    <input type="hidden" name="csrf" value="<?= e(admin_token()) ?>">
    <input type="hidden" name="action" value="save">
    <input type="hidden" name="id" value="<?= (int)($a['id'] ?? 0) ?>">
    <div class="field"><label>Title</label><input name="title" required value="<?= e($a['title'] ?? '') ?>"></div>
    <div class="row">
      <div class="field"><label>Category</label><input name="category" placeholder="Notes / Guides / Press" value="<?= e($a['category'] ?? 'Notes') ?>"></div>
      <div class="field"><label>Published date</label><input name="published_at" type="date" value="<?= e($a['published_at'] ?? date('Y-m-d')) ?>"></div>
    </div>
    <div class="field"><label>Excerpt</label><input name="excerpt" value="<?= e($a['excerpt'] ?? '') ?>"></div>
    <div class="field"><label>Body</label><textarea name="body" style="min-height:200px"><?= e($a['body'] ?? '') ?></textarea></div>
    <div class="row">
      <div class="field"><label>Cover filename (in assets/img/)</label><input name="cover" placeholder="chapter-03.jpg" value="<?= e($a['cover'] ?? '') ?>"></div>
      <div class="field"><label>…or upload a cover image</label><input type="file" name="cover_file" accept="image/*"></div>
    </div>
    <div class="field"><label>Status</label>
      <select name="status">
        <option value="live"<?= ($a['status'] ?? 'live') === 'live' ? ' selected' : '' ?>>Live</option>
        <option value="draft"<?= ($a['status'] ?? '') === 'draft' ? ' selected' : '' ?>>Draft</option>
      </select>
    </div>
    <div class="actions" style="margin-top:.6rem">
      <button class="btn" type="submit">Save article</button>
      <a class="btn btn-ghost" href="<?= admin_url('articles.php') ?>">Cancel</a>
    </div>
  </form>
</div>
<?php else: ?>
<div class="card">
  <table>
    <tr><th></th><th>Title</th><th>Category</th><th>Date</th><th>Status</th><th></th></tr>
    <?php foreach ($rows as $r): ?>
      <tr>
        <td><img class="thumb" src="<?= cover_src($r['cover'], 'chapter-03.jpg') ?>" alt=""></td>
        <td><?= e($r['title']) ?></td>
        <td class="muted"><?= e($r['category']) ?></td>
        <td class="muted"><?= e(date('j M Y', strtotime($r['published_at'] ?: $r['created_at']))) ?></td>
        <td><span class="pill <?= $r['status'] === 'live' ? 'on' : '' ?>"><?= e($r['status']) ?></span></td>
        <td class="actions">
          <a class="btn btn-sm btn-ghost" href="?edit=<?= (int)$r['id'] ?>">Edit</a>
          <form method="post" onsubmit="return confirm('Delete this article?')">
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
