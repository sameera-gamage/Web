<?php
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/helpers.php';

$projects = db()->query("SELECT * FROM projects ORDER BY featured DESC, sort_order ASC, id DESC")->fetchAll();
$types = ['all' => 'All', 'villa' => 'Villas', 'house' => 'Houses', 'hotel' => 'Hotels', 'commercial' => 'Commercial'];

$page_title = 'Projects';
$page_desc  = 'Villas, houses, hotels, and commercial work, each carried from the land to the keys. Sea Esta leads.';
require __DIR__ . '/inc/head.php';
require __DIR__ . '/inc/nav.php';
?>
<main>
  <section class="page-hero">
    <div class="wrap">
      <p class="eyebrow reveal">Selected work</p>
      <h1 class="display reveal d1">Projects, land to keys.</h1>
      <p class="lead muted reveal d2" style="max-width:52ch;margin-top:1rem">Every project here was carried by one team from the plot to the handover. Filter by type, or start with Sea Esta, our lead development.</p>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="filters reveal">
        <?php foreach ($types as $k => $label): ?>
          <button class="filter<?= $k === 'all' ? ' is-on' : '' ?>" data-filter="<?= e($k) ?>"><?= e($label) ?></button>
        <?php endforeach; ?>
      </div>

      <div class="project-grid">
        <?php foreach ($projects as $p): ?>
          <article class="project reveal<?= $p['featured'] ? ' is-lead' : '' ?>" data-type="<?= e($p['type']) ?>" id="p<?= (int)$p['id'] ?>">
            <a class="tile" href="<?= url('contact.php') ?>?about=<?= rawurlencode($p['title']) ?>">
              <?php if ($p['featured']): ?><span class="tag-lead">Lead development</span><?php endif; ?>
              <img class="tile-img" src="<?= cover_src($p['cover']) ?>" alt="<?= e($p['title']) ?>" loading="lazy">
              <div class="tile-body">
                <span class="tile-type"><?= e(ucfirst($p['type'])) ?></span>
                <h3 class="tile-title"><?= e($p['title']) ?></h3>
                <p class="tile-meta"><?= e($p['location']) ?> · <?= e($p['status']) ?></p>
                <?php if (!empty($p['excerpt'])): ?><p class="tile-meta" style="margin-top:.5rem;color:var(--muted)"><?= e($p['excerpt']) ?></p><?php endif; ?>
              </div>
            </a>
          </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
</main>
<?php require __DIR__ . '/inc/footer.php'; ?>
