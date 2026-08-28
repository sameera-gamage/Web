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
      <a href="<?= e(url('/projects')) ?>" class="case-cta">See all the work</a>
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
<main id="main" class="case">
  <div class="case-grid">
    <div class="case-media">
      <figure class="case-plate">
        <img src="<?= e(url($p['cover'])) ?>" alt="<?= e($p['client'] . ', ' . $p['title']) ?>" decoding="async">
      </figure>
    </div>

    <div class="case-read">
      <p class="case-eyebrow">
        <em><?= e($p['ref']) ?></em>
        <span><?= e(implode(' · ', $disc)) ?></span>
        <span><?= e($p['year']) ?></span>
      </p>
      <h1 class="case-h1"><?= e($p['client']) ?></h1>
      <p class="case-line"><?= e($p['title']) ?><?= $p['line'] !== '' ? ' — ' . e($p['line']) : '' ?></p>

      <?php if (trim((string) $p['brief']) !== ''): ?>
        <div class="case-block">
          <p class="case-k">The brief</p>
          <p class="case-p"><?= nl2br(e($p['brief'])) ?></p>
        </div>
      <?php endif; ?>

      <?php if ($did): ?>
        <div class="case-block">
          <p class="case-k">What we did</p>
          <ul class="case-list"><?php foreach ($did as $d): ?><li><?= e($d) ?></li><?php endforeach; ?></ul>
        </div>
      <?php endif; ?>

      <?php if ($results): ?>
        <div class="case-block">
          <p class="case-k">Where it landed</p>
          <dl class="case-result">
            <?php foreach ($results as [$fig, $lab]): ?>
              <div><dt><?= e($fig) ?></dt><dd><?= e($lab) ?></dd></div>
            <?php endforeach; ?>
          </dl>
        </div>
      <?php endif; ?>

      <a href="mailto:info@rapidsolutions.live" class="case-cta">Start a brief like this</a>
    </div>
  </div>

  <?php if ($media): ?>
    <section class="case-roll" aria-label="More from this project">
      <?php foreach ($media as $i => $m): ?>
        <figure class="case-frame rv">
          <?php if ($m['kind'] === 'video'): ?>
            <video src="<?= e(url($m['src'])) ?>"
                   <?= $m['poster'] !== '' ? 'poster="' . e(url($m['poster'])) . '"' : '' ?>
                   muted loop playsinline preload="none"></video>
          <?php else: ?>
            <img src="<?= e(url($m['src'])) ?>" alt="<?= e($m['cap'] ?: $p['client']) ?>"
                 loading="lazy" decoding="async">
          <?php endif; ?>
          <figcaption><em><?= str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) ?></em><?= e($m['cap']) ?></figcaption>
        </figure>
      <?php endforeach; ?>
    </section>
  <?php endif; ?>

  <nav class="case-step" aria-label="Other projects">
    <?php if ($nb['prev']): ?>
      <a href="<?= e(url('/projects/' . $nb['prev']['slug'])) ?>" class="step step-prev">
        <span class="step-k">Previous</span>
        <span class="step-t"><?= e($nb['prev']['client']) ?></span>
      </a>
    <?php endif; ?>
    <a href="<?= e(url('/projects')) ?>" class="step-all">All work</a>
    <?php if ($nb['next']): ?>
      <a href="<?= e(url('/projects/' . $nb['next']['slug'])) ?>" class="step step-next">
        <span class="step-k">Next</span>
        <span class="step-t"><?= e($nb['next']['client']) ?></span>
      </a>
    <?php endif; ?>
  </nav>
</main>
<?php foot_close('project.js'); ?>
