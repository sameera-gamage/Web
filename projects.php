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
    <div class="orbs"><span class="orb" style="width:320px;height:320px;right:2%;top:8%"></span></div>
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

      <div class="prows">
        <?php foreach ($projects as $i => $p): ?>
          <article class="prow<?= $i % 2 ? ' rev' : '' ?> reveal" data-type="<?= e($p['type']) ?>" id="p<?= (int)$p['id'] ?>">
            <a class="prow-media" data-cursor="View" href="<?= url('contact.php') ?>?about=<?= rawurlencode($p['title']) ?>">
              <img data-parallax="0.05" src="<?= cover_src($p['cover']) ?>" alt="<?= e($p['title']) ?>" loading="lazy">
            </a>
            <div>
              <div class="prow-num"><?= str_pad((string)($i + 1), 2, '0', STR_PAD_LEFT) ?></div>
              <?php if ($p['featured']): ?><span class="prow-lead-tag">Lead development</span><?php endif; ?>
              <div class="prow-type"><?= e(ucfirst($p['type'])) ?></div>
              <h2><?= e($p['title']) ?></h2>
              <p class="prow-meta"><?= e($p['location']) ?> · <?= e($p['status']) ?></p>
              <?php if (!empty($p['excerpt'])): ?><p class="muted" style="max-width:48ch"><?= e($p['excerpt']) ?></p><?php endif; ?>
              <p style="margin-top:1.2rem"><a class="btn btn-ghost" href="<?= url('contact.php') ?>?about=<?= rawurlencode($p['title']) ?>">Enquire about this</a></p>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
</main>
<?php require __DIR__ . '/inc/footer.php'; ?>
