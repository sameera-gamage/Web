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
  <?php else: $tot = str_pad((string) $count, 2, '0', STR_PAD_LEFT); ?>
    <div class="wx-list">
      <?php foreach ($projects as $i => $p):
        $disc = array_values(array_filter(array_map('trim', explode(',', $p['disciplines']))));
        $num  = str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT); ?>
        <a class="wx-row reveal-sec" href="<?= e(url('/projects/' . $p['slug'])) ?>" aria-label="Open <?= e($p['client']) ?>">
          <div class="wx-media" data-frame>
            <img data-inner src="<?= e(url($p['cover'])) ?>" alt="<?= e($p['client'] . ', ' . $p['title']) ?>"
                 <?= $i < 3 ? '' : 'loading="lazy"' ?> decoding="async">
            <span class="wx-tag"><?= e($p['ref']) ?></span>
          </div>
          <div class="wx-read">
            <span class="wx-num"><?= $num ?><span class="dim"> / <?= $tot ?></span></span>
            <h2 class="wx-title"><?= e($p['client']) ?></h2>
            <p class="wx-line"><?= e($p['line'] ?: $p['title']) ?></p>
            <?php if ($disc): ?>
              <div class="wx-tags"><?php foreach (array_slice($disc, 0, 4) as $d): ?><span><?= e($d) ?></span><?php endforeach; ?></div>
            <?php endif; ?>
            <div class="wx-foot">
              <span class="wx-year"><?= e($p['year']) ?></span>
              <span class="wx-go">View project <em class="wx-arrow" aria-hidden="true">&rarr;</em></span>
            </div>
          </div>
        </a>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>

  <div class="work-back">
    <a href="<?= e(url('/')) ?>" class="work-back-btn"><span aria-hidden="true">&larr;</span> Back to the studio</a>
  </div>

  <?php site_footer(); ?>
</main>
<?php foot_close('projects.js'); ?>
