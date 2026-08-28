<?php
declare(strict_types=1);
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/layout.php';

$projects = all_projects();
$count = count($projects);

head_open('Work — RapidStudio',
  'Six jobs, start to finish. Search, paid media, social, brand, film and photography.',
  'projects');
?>
<main id="main">
  <!--
    The stack. Scroll drives the whole rig, and the picture and the name travel
    at different rates so an outgoing name is still mid-screen when the next one
    arrives — that crossover is the effect. The ladder on the right is not
    decoration: hovering a rung drives the page's own scroll to that project.
  -->
  <section id="stack" class="relative" style="height:<?= $count * 100 + 40 ?>vh">
    <div class="stage">

      <div class="pj-chrome">
        <span class="pj-rule-l" aria-hidden="true"></span>
        <span class="pj-kicker">Selected work</span>
        <span class="pj-count"><em id="pj-n">01</em> / <?= str_pad((string) $count, 2, '0', STR_PAD_LEFT) ?></span>

        <div class="ladder" id="ladder" aria-label="Jump to a project">
          <?php foreach ($projects as $i => $p): ?>
            <button type="button" class="rung" data-rung="<?= $i ?>"
                    aria-label="Go to <?= e($p['client']) ?>">
              <span class="rung-bar" aria-hidden="true"></span>
              <span class="rung-tip"><?= e($p['client']) ?></span>
            </button>
          <?php endforeach; ?>
        </div>
      </div>

      <div id="pj-stack" class="pj-stack">
        <?php foreach ($projects as $i => $p): ?>
          <article class="pj" data-pj="<?= $i ?>">
            <a class="pj-shot" href="<?= e(url('/projects/' . $p['slug'])) ?>"
               aria-label="Open <?= e($p['client']) ?>">
              <img src="<?= e(url($p['cover'])) ?>" alt="<?= e($p['client'] . ', ' . $p['title']) ?>"
                   <?= $i < 2 ? '' : 'loading="lazy"' ?> decoding="async">
              <span class="pj-go"><em>View project</em></span>
            </a>
            <div class="pj-name">
              <span class="pj-idx"><?= e($p['ref']) ?></span>
              <h2 class="pj-title"><?= e($p['client']) ?></h2>
              <p class="pj-line"><?= e($p['line']) ?></p>
              <div class="pj-meta">
                <span><?= e(implode(' · ', array_map('trim', explode(',', $p['disciplines'])))) ?></span>
                <span><?= e($p['year']) ?></span>
              </div>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <?php site_footer(); ?>
</main>
<?php foot_close('projects.js'); ?>
