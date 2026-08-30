<?php
declare(strict_types=1);
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/layout.php';

$projects = all_projects();
$count = count($projects);

head_open('Work — RapidStudio',
  'Every project, start to finish. Search, paid media, social, brand, film and photography.',
  'work');
?>
<main id="main" class="work">
  <header class="work-hero">
    <p class="work-k">The full index · <?= str_pad((string) $count, 2, '0', STR_PAD_LEFT) ?> projects</p>
    <h1 class="work-h">Everything,<br>start to finish.</h1>
    <p class="work-lead">
      Six trades, one room. Every job below was strategised, made and measured
      by the same people — scroll the lot, or jump straight into one.
    </p>
  </header>

  <?php if (!$count): ?>
    <p class="work-empty">Nothing published yet. Check back soon.</p>
  <?php else: ?>
    <ul class="work-grid">
      <?php foreach ($projects as $i => $p):
        $disc = array_values(array_filter(array_map('trim', explode(',', $p['disciplines'])))); ?>
        <li class="wg-item reveal-sec">
          <a class="wg-card" href="<?= e(url('/projects/' . $p['slug'])) ?>" aria-label="Open <?= e($p['client']) ?>">
            <div class="wg-shot">
              <img src="<?= e(url($p['cover'])) ?>" alt="<?= e($p['client'] . ', ' . $p['title']) ?>"
                   <?= $i < 3 ? '' : 'loading="lazy"' ?> decoding="async">
              <span class="wg-ref"><?= e($p['ref']) ?></span>
              <span class="wg-go" aria-hidden="true">View project <em>&rarr;</em></span>
            </div>
            <div class="wg-foot">
              <h2 class="wg-title"><?= e($p['client']) ?></h2>
              <p class="wg-line"><?= e($p['line'] ?: $p['title']) ?></p>
              <div class="wg-meta">
                <span><?= e(implode(' · ', array_slice($disc, 0, 3))) ?></span>
                <span><?= e($p['year']) ?></span>
              </div>
            </div>
          </a>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>

  <div class="work-back">
    <a href="<?= e(url('/')) ?>" class="work-back-btn"><span aria-hidden="true">&larr;</span> Back to the studio</a>
  </div>

  <?php site_footer(); ?>
</main>
<?php foot_close('projects.js'); ?>
