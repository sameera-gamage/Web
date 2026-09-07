<?php
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/helpers.php';

$featured = db()->query(
    "SELECT * FROM projects WHERE featured = 1 OR sort_order <= 4 ORDER BY featured DESC, sort_order ASC LIMIT 4"
)->fetchAll();

$page_title = 'From the ground to the keys';
$page_desc  = 'Excello is a design-build firm in Mount Lavinia that carries a project the whole way: land, design, engineering, construction, handover.';
require __DIR__ . '/inc/head.php';
require __DIR__ . '/inc/nav.php';

/* the four film chapters */
$chapters = [
  1 => ['idx' => 'Chapter 01', 'title' => 'It starts with the land.',
        'sub' => 'An aerial descent onto a bare coastal plot. A sweep of light draws the plan across the earth.'],
  2 => ['idx' => 'Chapter 02', 'title' => 'We shape it before we pour a single stone.',
        'sub' => 'The flat plan rises into a clean model as the camera cranes from above to a low angle.'],
  3 => ['idx' => 'Chapter 03', 'title' => 'Design, engineering, construction. One team.',
        'sub' => 'A wave of light sweeps the model and materials appear: timber, concrete, glass, water, a golden sky.'],
  4 => ['idx' => 'Chapter 04', 'title' => 'Then we hand you the keys.',
        'sub' => 'The door opens and the camera glides inside, resting on the ocean through the glass.'],
];

function render_chapter(int $n, array $c, bool $intro = false): void { ?>
  <section class="chapter" id="ch<?= $n ?>">
    <div class="chapter-stage">
      <div class="chapter-media"><?= film_media($n, $c['title']) ?></div>
      <?php if ($intro): ?>
        <div class="film-intro">
          <p class="eyebrow"><?= e(SITE_NAME) ?> · Mount Lavinia</p>
          <h1 class="display">From the ground<br><em>to the keys.</em></h1>
        </div>
        <div class="scroll-cue"><span class="line"></span>Scroll to begin</div>
      <?php endif; ?>
      <div class="chapter-copy">
        <div class="wrap">
          <span class="chapter-index"><?= e($c['idx']) ?></span>
          <h2 class="chapter-title"><?= e($c['title']) ?></h2>
          <p class="chapter-sub"><?= e($c['sub']) ?></p>
        </div>
      </div>
    </div>
  </section>
<?php }

render_chapter(1, $chapters[1], true);
?>

<!-- ===== Our process (from the current site) ===== -->
<section class="band section" id="process">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">Our process</p>
      <h2>One line of accountability, land to handover.</h2>
      <p class="lead muted">Most projects break in the gaps between the architect, the engineer, and the builder. We hold all three, so the story never drops between hands.</p>
    </div>
    <div class="process reveal">
      <?php
      $steps = [
        ['01', 'Land & feasibility', 'We read the plot before you commit: setbacks, soil, access, and what it will really cost to build.'],
        ['02', 'Design', 'Architecture and interiors drawn together, so the home you picture is the home that gets built.'],
        ['03', 'Engineering', 'Structure and services designed in-house, tested against the design before the ground is broken.'],
        ['04', 'Construction', 'Our own site teams build what we drew. One contract, one point of contact, no finger-pointing.'],
        ['05', 'Handover', 'A finished home, not a to-do list. We hand you the keys and everything works.'],
      ];
      foreach ($steps as $s): ?>
        <div class="process-step">
          <div class="process-num"><?= e($s[0]) ?></div>
          <div><h3><?= e($s[1]) ?></h3><p><?= e($s[2]) ?></p></div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<?php render_chapter(2, $chapters[2]); ?>

<!-- ===== What we do (from the current site) ===== -->
<section class="band alt section" id="what-we-do">
  <div class="wrap">
    <div class="section-head center reveal">
      <p class="eyebrow">What we do</p>
      <h2>Everything under one roof.</h2>
    </div>
    <div class="grid-3">
      <?php
      $svc = [
        ['Land &amp; Real Estate', 'Finding, reading, and securing the right plot, coast to city.'],
        ['Architecture', 'Homes and buildings designed around how you actually live and work.'],
        ['Interior Design', 'The inside drawn with the outside, one hand, one language.'],
        ['Construction', 'Our own teams build it, on one contract, to the drawing.'],
        ['Project Management', 'One schedule, one budget, one person who answers the phone.'],
        ['Branding', 'For the developments and hospitality projects that need an identity.'],
      ];
      foreach ($svc as $i => $s): ?>
        <div class="card reveal d<?= ($i % 3) + 1 ?>">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>
          <h3><?= $s[0] ?></h3>
          <p><?= e($s[1]) ?></p>
        </div>
      <?php endforeach; ?>
    </div>
    <div class="center reveal" style="margin-top:2.6rem">
      <a class="btn btn-ghost" href="<?= url('services.php') ?>">See the full lifecycle</a>
    </div>
  </div>
</section>

<?php render_chapter(3, $chapters[3]); ?>

<!-- ===== Selected Projects (from the current site) ===== -->
<section class="band section" id="projects">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">Selected projects</p>
      <h2>The work, land to keys.</h2>
    </div>
    <div class="project-grid">
      <?php foreach ($featured as $i => $p): ?>
        <article class="project reveal<?= $p['featured'] ? ' is-lead' : '' ?>" data-type="<?= e($p['type']) ?>">
          <a class="tile" href="<?= url('projects.php') ?>#p<?= (int)$p['id'] ?>">
            <?php if ($p['featured']): ?><span class="tag-lead">Lead development</span><?php endif; ?>
            <img class="tile-img" src="<?= cover_src($p['cover']) ?>" alt="<?= e($p['title']) ?>" loading="lazy">
            <div class="tile-body">
              <span class="tile-type"><?= e(ucfirst($p['type'])) ?></span>
              <h3 class="tile-title"><?= e($p['title']) ?></h3>
              <p class="tile-meta"><?= e($p['location']) ?> · <?= e($p['status']) ?></p>
            </div>
          </a>
        </article>
      <?php endforeach; ?>
    </div>
    <div class="center reveal" style="margin-top:2.6rem">
      <a class="btn btn-ghost" href="<?= url('projects.php') ?>">All projects</a>
    </div>
  </div>
</section>

<?php render_chapter(4, $chapters[4]); ?>

<?php require __DIR__ . '/inc/footer.php'; ?>
