<?php
declare(strict_types=1);
require_once __DIR__ . '/../inc/auth.php';
require_once __DIR__ . '/../inc/db.php';
require_once __DIR__ . '/../inc/upload.php';
require_once __DIR__ . '/_head.php';
require_admin();

// the media forms carry the id in the body as well as the query string, so an
// upload can never land on a page that has quietly forgotten which project it is
$id = (int) ($_GET['id'] ?? $_POST['id'] ?? 0);
$p = null;
if ($id) {
    $st = db()->prepare('SELECT * FROM projects WHERE id = ?');
    $st->execute([$id]);
    $p = $st->fetch() ?: null;
    if (!$p) { http_response_code(404); exit('No such project.'); }
}
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $do = (string) ($_POST['do'] ?? 'save');

    // ---- media actions, which only make sense once the project exists ----
    if ($do === 'addmedia' && $id) {
        $files = $_FILES['media'] ?? null;
        $added = 0;
        if ($files && is_array($files['name'])) {
            $n = count($files['name']);
            $st = db()->prepare('INSERT INTO media (project_id, kind, src, cap, sort) VALUES (?,?,?,?,?)');
            $sortBase = (int) db()->query('SELECT COALESCE(MAX(sort),0) FROM media WHERE project_id = ' . $id)->fetchColumn();
            for ($i = 0; $i < $n; $i++) {
                if ((int) $files['error'][$i] === UPLOAD_ERR_NO_FILE) { continue; }
                $one = [
                    'name' => $files['name'][$i], 'type' => $files['type'][$i],
                    'tmp_name' => $files['tmp_name'][$i], 'error' => $files['error'][$i],
                    'size' => $files['size'][$i],
                ];
                $res = store_upload($one);
                if (!$res['ok']) { $errors[] = $files['name'][$i] . ': ' . $res['error']; continue; }
                $st->execute([$id, $res['kind'], $res['url'], '', $sortBase + (++$added) * 10]);
            }
        }
        if ($added) { flash("$added file" . ($added === 1 ? '' : 's') . ' added.'); }
        if (!$errors) { header('Location: ' . url('/admin/edit.php?id=' . $id)); exit; }
    }

    if ($do === 'delmedia' && $id) {
        $mid = (int) ($_POST['media_id'] ?? 0);
        $st = db()->prepare('SELECT * FROM media WHERE id = ? AND project_id = ?');
        $st->execute([$mid, $id]);
        if ($m = $st->fetch()) {
            drop_upload($m['src']); drop_upload($m['poster']);
            db()->prepare('DELETE FROM media WHERE id = ?')->execute([$mid]);
            flash('Picture removed.');
        }
        header('Location: ' . url('/admin/edit.php?id=' . $id)); exit;
    }

    if ($do === 'capmedia' && $id) {
        $st = db()->prepare('UPDATE media SET cap = ?, sort = ? WHERE id = ? AND project_id = ?');
        foreach ((array) ($_POST['cap'] ?? []) as $mid => $cap) {
            $st->execute([mb_substr(trim((string) $cap), 0, 240), (int) ($_POST['msort'][$mid] ?? 0), (int) $mid, $id]);
        }
        flash('Captions saved.');
        header('Location: ' . url('/admin/edit.php?id=' . $id)); exit;
    }

    // ---- the project itself ----
    if ($do === 'save') {
        $client = trim((string) ($_POST['client'] ?? ''));
        if ($client === '') { $errors[] = 'A client name is needed — it is the headline on the page.'; }

        $fields = [
            'client'      => $client,
            'ref'         => mb_substr(trim((string) ($_POST['ref'] ?? '')), 0, 12),
            'title'       => mb_substr(trim((string) ($_POST['title'] ?? '')), 0, 200),
            'line'        => mb_substr(trim((string) ($_POST['line'] ?? '')), 0, 240),
            'disciplines' => mb_substr(trim((string) ($_POST['disciplines'] ?? '')), 0, 240),
            'year'        => mb_substr(trim((string) ($_POST['year'] ?? '')), 0, 8),
            'brief'       => trim((string) ($_POST['brief'] ?? '')),
            'did'         => trim((string) ($_POST['did'] ?? '')),
            'results'     => trim((string) ($_POST['results'] ?? '')),
            'status'      => ($_POST['status'] ?? 'draft') === 'live' ? 'live' : 'draft',
        ];

        // a new cover replaces the old file as well as the row
        $cover = $p['cover'] ?? '';
        if (!empty($_FILES['cover']['name'])) {
            $res = store_upload($_FILES['cover'], 'image');
            if ($res['ok']) {
                if ($cover) { drop_upload($cover); }
                $cover = $res['url'];
            } else {
                $errors[] = 'Cover: ' . $res['error'];
            }
        }
        if ($cover === '') { $errors[] = 'A cover picture is needed — it is what the roll shows.'; }

        if (!$errors) {
            if ($p) {
                $slug = unique_slug((string) ($_POST['slug'] ?: $client), (int) $p['id']);
                $sql = 'UPDATE projects SET slug=?, ref=?, client=?, title=?, line=?, disciplines=?, year=?,
                        cover=?, brief=?, did=?, results=?, status=? WHERE id=?';
                db()->prepare($sql)->execute([
                    $slug, $fields['ref'], $fields['client'], $fields['title'], $fields['line'],
                    $fields['disciplines'], $fields['year'], $cover, $fields['brief'],
                    $fields['did'], $fields['results'], $fields['status'], (int) $p['id'],
                ]);
                flash('Saved.');
                header('Location: ' . url('/admin/edit.php?id=' . (int) $p['id'])); exit;
            }
            $slug = unique_slug((string) ($_POST['slug'] ?: $client));
            $sort = (int) db()->query('SELECT COALESCE(MAX(sort),0)+10 FROM projects')->fetchColumn();
            $sql = 'INSERT INTO projects (slug, ref, client, title, line, disciplines, year, cover, brief, did, results, status, sort)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)';
            db()->prepare($sql)->execute([
                $slug, $fields['ref'], $fields['client'], $fields['title'], $fields['line'],
                $fields['disciplines'], $fields['year'], $cover, $fields['brief'],
                $fields['did'], $fields['results'], $fields['status'], $sort,
            ]);
            $newId = (int) db()->lastInsertId();
            flash('Project created. Now add its pictures.');
            header('Location: ' . url('/admin/edit.php?id=' . $newId)); exit;
        }
        $p = array_merge($p ?? [], $fields, ['id' => $id, 'cover' => $cover, 'slug' => $_POST['slug'] ?? '']);
    }
}

$media = $id ? project_media($id) : [];
$v = fn(string $k, string $d = '') => e((string) ($p[$k] ?? $d));

admin_head($id ? 'Edit project' : 'Add a project');
admin_bar($id ? '' : 'new');
?>
<main class="awrap">
  <?php show_flash(); ?>
  <?php if ($errors): ?>
    <div class="note note-bad"><?php foreach ($errors as $er): ?><p><?= e($er) ?></p><?php endforeach; ?></div>
  <?php endif; ?>

  <div class="ahead">
    <h1><?= $id ? 'Edit project' : 'Add a project' ?></h1>
    <?php if ($id): ?><a class="lnk" href="<?= e(url('/projects/' . ($p['slug'] ?? ''))) ?>" target="_blank" rel="noopener">View page &nearr;</a><?php endif; ?>
  </div>

  <form method="post" enctype="multipart/form-data" class="aform">
    <?= csrf_field() ?><input type="hidden" name="do" value="save">
    <input type="hidden" name="id" value="<?= $id ?>">

    <div class="grid2">
      <label>Client <span class="hint">the big name on the page</span>
        <input type="text" name="client" required value="<?= $v('client') ?>"></label>
      <label>Reference <span class="hint">the small number, e.g. 001</span>
        <input type="text" name="ref" value="<?= $v('ref') ?>"></label>
    </div>

    <label>What the job was <span class="hint">one short phrase</span>
      <input type="text" name="title" value="<?= $v('title') ?>"></label>

    <label>One line under the name
      <input type="text" name="line" value="<?= $v('line') ?>"></label>

    <div class="grid2">
      <label>Disciplines <span class="hint">separated by commas</span>
        <input type="text" name="disciplines" value="<?= $v('disciplines') ?>" placeholder="Brand, Social, Photography"></label>
      <label>Year <input type="text" name="year" value="<?= $v('year') ?>" placeholder="2025"></label>
    </div>

    <label>Web address <span class="hint">leave blank to make one from the client name</span>
      <input type="text" name="slug" value="<?= $v('slug') ?>" placeholder="marrow-and-co"></label>

    <label>The brief <textarea name="brief" rows="4"><?= $v('brief') ?></textarea></label>

    <label>What we did <span class="hint">one per line</span>
      <textarea name="did" rows="4"><?= $v('did') ?></textarea></label>

    <label>Where it landed <span class="hint">one per line, as <code>figure | label</code></span>
      <textarea name="results" rows="4" placeholder="9 wks | brief to launch"><?= $v('results') ?></textarea></label>

    <div class="grid2">
      <label>Cover picture <span class="hint">what the roll shows</span>
        <input type="file" name="cover" accept="image/*">
        <?php if (!empty($p['cover'])): ?>
          <img class="thumb" src="<?= e(url($p['cover'])) ?>" alt="">
        <?php endif; ?>
      </label>
      <label>Status
        <select name="status">
          <option value="draft" <?= ($p['status'] ?? 'draft') === 'draft' ? 'selected' : '' ?>>Draft — only you can see it</option>
          <option value="live"  <?= ($p['status'] ?? '') === 'live' ? 'selected' : '' ?>>Live — on the site</option>
        </select>
      </label>
    </div>

    <button class="btn" type="submit"><?= $id ? 'Save changes' : 'Create project' ?></button>
  </form>

  <?php if ($id): ?>
    <section class="amedia">
      <h2>Pictures and clips</h2>
      <p class="hint">These stack below the writing on the project page. Images and MP4/WebM clips.</p>

      <form method="post" enctype="multipart/form-data" class="aupload">
        <?= csrf_field() ?><input type="hidden" name="do" value="addmedia">
        <input type="hidden" name="id" value="<?= $id ?>">
        <input type="file" name="media[]" multiple accept="image/*,video/mp4,video/webm">
        <button class="btn" type="submit">Upload</button>
      </form>

      <?php if ($media): ?>
        <form method="post" class="agrid">
          <?= csrf_field() ?><input type="hidden" name="do" value="capmedia">
          <input type="hidden" name="id" value="<?= $id ?>">
          <?php foreach ($media as $m): ?>
            <figure class="acard-m">
              <?php if ($m['kind'] === 'video'): ?>
                <video src="<?= e(url($m['src'])) ?>" muted playsinline preload="metadata"></video>
              <?php else: ?>
                <img src="<?= e(url($m['src'])) ?>" alt="">
              <?php endif; ?>
              <input type="text" name="cap[<?= (int) $m['id'] ?>]" value="<?= e($m['cap']) ?>" placeholder="Caption">
              <div class="row">
                <input type="number" name="msort[<?= (int) $m['id'] ?>]" value="<?= (int) $m['sort'] ?>" step="10" aria-label="Order">
                <span class="kind"><?= e($m['kind']) ?></span>
              </div>
            </figure>
          <?php endforeach; ?>
          <div class="agrid-actions"><button class="btn" type="submit">Save captions and order</button></div>
        </form>

        <div class="agrid agrid-del">
          <?php foreach ($media as $m): ?>
            <form method="post" onsubmit="return confirm('Remove this file?')">
              <?= csrf_field() ?>
              <input type="hidden" name="do" value="delmedia">
              <input type="hidden" name="id" value="<?= $id ?>">
              <input type="hidden" name="media_id" value="<?= (int) $m['id'] ?>">
              <button class="lnk bad">Remove <?= e(basename($m['src'])) ?></button>
            </form>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </section>
  <?php endif; ?>
</main>
</body></html>
