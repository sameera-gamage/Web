<?php
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/helpers.php';
$projects = db()->query("SELECT * FROM projects ORDER BY featured DESC, sort_order ASC, id DESC")->fetchAll();
$types = ['all'=>'All','villa'=>'Villas','house'=>'Houses','hotel'=>'Hotels','commercial'=>'Commercial'];
$page_title = 'Projects';
$page_desc  = 'Villas, houses, hotels, and commercial work, each carried from the land to the keys. Sea Esta leads.';
require __DIR__ . '/inc/head.php';
require __DIR__ . '/inc/nav.php';
?>
<main>
  <section class="page-hero panel-sky">
    <div class="wrap">
      <p class="eyebrow rv rv-up">Selected work</p>
      <h1 class="display word-rv" style="max-width:14ch">Projects, land to keys.</h1>
      <p class="lead muted rv rv-up" style="max-width:52ch;margin-top:1.2rem">Every project here was carried by one team from the plot to the handover. Filter by type, or start with Sea Esta, our lead development.</p>
    </div>
  </section>

  <section class="section panel-cream">
    <div class="wrap">
      <div class="filters rv rv-up">
        <?php foreach ($types as $k=>$label): ?><button class="filter<?= $k==='all'?' is-on':'' ?>" data-filter="<?= e($k) ?>"><?= e($label) ?></button><?php endforeach; ?>
      </div>
      <div class="prows">
        <?php foreach ($projects as $i=>$p): $rev = $i%2; ?>
          <article class="prow<?= $rev?' rev':'' ?>" data-type="<?= e($p['type']) ?>" id="p<?= (int)$p['id'] ?>">
            <a class="prow-media <?= $rev?'clip-r':'clip-l' ?>" data-cursor="View" href="<?= url('contact.php') ?>?about=<?= rawurlencode($p['title']) ?>">
              <img src="<?= cover_src($p['cover']) ?>" alt="<?= e($p['title']) ?>" loading="lazy">
            </a>
            <div>
              <div class="prow-num rv <?= $rev?'rv-l':'rv-r' ?>"><?= str_pad((string)($i+1),2,'0',STR_PAD_LEFT) ?></div>
              <?php if ($p['featured']): ?><span class="prow-lead-tag rv <?= $rev?'rv-l':'rv-r' ?>">Lead development</span><?php endif; ?>
              <div class="prow-type rv <?= $rev?'rv-l':'rv-r' ?>"><?= e(ucfirst($p['type'])) ?></div>
              <h2 class="rv <?= $rev?'rv-l':'rv-r' ?>"><?= e($p['title']) ?></h2>
              <p class="prow-meta rv <?= $rev?'rv-l':'rv-r' ?>"><?= e($p['location']) ?> · <?= e($p['status']) ?></p>
              <?php if (!empty($p['excerpt'])): ?><p class="muted rv <?= $rev?'rv-l':'rv-r' ?>" style="max-width:46ch"><?= e($p['excerpt']) ?></p><?php endif; ?>
              <p class="rv <?= $rev?'rv-l':'rv-r' ?>" style="margin-top:1.2rem"><a class="btn" href="<?= url('contact.php') ?>?about=<?= rawurlencode($p['title']) ?>">Enquire</a></p>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
</main>
<?php require __DIR__ . '/inc/footer.php'; ?>
