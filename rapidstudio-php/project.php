<?php
declare(strict_types=1);
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/layout.php';

$slug = (string) ($_GET['slug'] ?? '');
$p = $slug === '' ? null : project_by_slug($slug);

if (!$p) {
    http_response_code(404);
    head_open('Not found — RapidStudio', '', 'projects');
    ?>
    <main id="main" class="miss">
      <p class="case-k">404</p>
      <h1 class="case-h1">No such project.</h1>
      <p class="case-line">It may have been renamed, or it may not be published yet.</p>
      <a href="<?= e(url('/#work')) ?>" class="case-cta">See all the work</a>
    </main>
    <?php
    site_footer();
    foot_close();
    exit;
}

$media = project_media((int) $p['id']);
$nb = project_neighbours($p['slug']);
$did = lines($p['did']);
$results = pairs($p['results']);
$disc = array_values(array_filter(array_map('trim', explode(',', $p['disciplines']))));

head_open($p['client'] . ' — RapidStudio', $p['brief'] ?? '', 'projects');
?>
<main id="main" class="cs">
  <!-- ══ hero: a full-bleed cover that parallaxes under the title ══ -->
  <header class="cs-hero">
    <div class="cs-hero-media" id="cs-hero-media">
      <img class="cs-hero-img" id="cs-hero-img" src="<?= e(url($p['cover'])) ?>"
           alt="<?= e($p['client'] . ', ' . $p['title']) ?>" decoding="async">
      <span class="cs-hero-scrim" aria-hidden="true"></span>
    </div>
    <div class="cs-hero-in">
      <a href="<?= e(url('/#work')) ?>" class="cs-back"><span aria-hidden="true">&larr;</span> Selected work</a>
      <p class="cs-eyebrow">
        <em><?= e($p['ref']) ?></em><span><?= e(implode(' · ', $disc)) ?></span><span><?= e($p['year']) ?></span>
      </p>
      <h1 class="cs-title" data-splitup><?= e($p['client']) ?></h1>
      <p class="cs-tagline"><?= e($p['title']) ?><?= $p['line'] !== '' ? ' &mdash; ' . e($p['line']) : '' ?></p>
    </div>
    <span class="cs-cue" aria-hidden="true"><i></i></span>
  </header>

  <!-- ══ the read: sticky meta rail beside a big brief + results ══ -->
  <section class="cs-intro">
    <aside class="cs-meta">
      <div class="cs-meta-row"><span class="cs-meta-k">Client</span><span class="cs-meta-v"><?= e($p['client']) ?></span></div>
      <?php if ($disc): ?><div class="cs-meta-row"><span class="cs-meta-k">Disciplines</span><span class="cs-meta-v"><?= e(implode(', ', $disc)) ?></span></div><?php endif; ?>
      <div class="cs-meta-row"><span class="cs-meta-k">Year</span><span class="cs-meta-v"><?= e($p['year']) ?></span></div>
      <div class="cs-meta-row"><span class="cs-meta-k">Reference</span><span class="cs-meta-v"><?= e($p['ref']) ?></span></div>
      <a href="mailto:info@rapidsolutions.live" class="case-cta">Start a brief like this</a>
    </aside>

    <div class="cs-read">
      <?php if (trim((string) $p['brief']) !== ''): ?>
        <div class="cs-block rv"><p class="cs-k">The brief</p>
          <p class="cs-lead"><?= nl2br(e($p['brief'])) ?></p></div>
      <?php endif; ?>

      <?php if ($did): ?>
        <div class="cs-block rv"><p class="cs-k">What we did</p>
          <ul class="cs-list"><?php foreach ($did as $d): ?><li><?= e($d) ?></li><?php endforeach; ?></ul></div>
      <?php endif; ?>

      <?php if ($results): ?>
        <div class="cs-block rv"><p class="cs-k">Where it landed</p>
          <dl class="cs-result">
            <?php foreach ($results as [$fig, $lab]): ?>
              <div class="cs-result-row"><dt><?= e($fig) ?></dt><dd><?= e($lab) ?></dd></div>
            <?php endforeach; ?>
          </dl></div>
      <?php endif; ?>
    </div>
  </section>

  <?php if ($media): ?>
    <section class="cs-roll" aria-label="More from this project">
      <?php foreach ($media as $i => $m): $wide = ($i % 3 === 0); ?>
        <figure class="cs-frame rv<?= $wide ? ' is-wide' : '' ?>">
          <div class="cs-frame-media" data-frame>
            <?php if ($m['kind'] === 'video'): ?>
              <video data-inner src="<?= e(url($m['src'])) ?>"
                     <?= $m['poster'] !== '' ? 'poster="' . e(url($m['poster'])) . '"' : '' ?>
                     muted loop playsinline preload="none"></video>
            <?php else: ?>
              <img data-inner src="<?= e(url($m['src'])) ?>" alt="<?= e($m['cap'] ?: $p['client']) ?>"
                   loading="lazy" decoding="async">
            <?php endif; ?>
          </div>
          <figcaption><em><?= str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) ?></em><?= e($m['cap']) ?></figcaption>
        </figure>
      <?php endforeach; ?>
    </section>
  <?php endif; ?>

  <!-- ══ next: a full-bleed teaser of the next project ══ -->
  <?php if ($nb['next']): $nx = $nb['next']; ?>
    <a class="cs-next" href="<?= e(url('/projects/' . $nx['slug'])) ?>" aria-label="Next project: <?= e($nx['client']) ?>">
      <div class="cs-next-media" id="cs-next-media">
        <img class="cs-next-img" src="<?= e(url($nx['cover'])) ?>" alt="" loading="lazy" decoding="async">
        <span class="cs-next-scrim" aria-hidden="true"></span>
      </div>
      <span class="cs-next-k">Next project</span>
      <span class="cs-next-t" data-splitup><?= e($nx['client']) ?></span>
      <span class="cs-next-go"><span>View</span><span class="cs-next-arrow" aria-hidden="true">&rarr;</span></span>
    </a>
  <?php endif; ?>

  <nav class="cs-foot" aria-label="Other projects">
    <?php if ($nb['prev']): ?>
      <a href="<?= e(url('/projects/' . $nb['prev']['slug'])) ?>" class="cs-foot-link">
        <span class="cs-foot-k"><span aria-hidden="true">&larr;</span> Previous</span>
        <span class="cs-foot-t"><?= e($nb['prev']['client']) ?></span>
      </a>
    <?php endif; ?>
    <a href="<?= e(url('/#work')) ?>" class="cs-foot-all">All work</a>
  </nav>
</main>
<?php foot_close('project.js'); ?>
