<?php
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/helpers.php';

$featured = db()->query(
    "SELECT * FROM projects ORDER BY featured DESC, sort_order ASC LIMIT 6"
)->fetchAll();

$page_title = 'From the ground to the keys';
$page_desc  = 'Excello is a design-build firm in Mount Lavinia that carries a project the whole way: land, design, engineering, construction, handover.';
require __DIR__ . '/inc/head.php';
?>
<div class="progress" id="progress"></div>
<?php require __DIR__ . '/inc/nav.php'; ?>

<?php
/* one continuous film; chapter 01 doubles as the opening hero */
function chapter(int $n, string $index, string $title, string $sub, bool $hero = false): void { ?>
  <section class="chapter<?= $hero ? ' is-hero' : '' ?>" id="ch<?= $n ?>">
    <div class="chapter-stage">
      <div class="chapter-media"><?= film_media($n, strip_tags($title)) ?></div>
      <div class="chapter-copy">
        <div class="wrap">
          <span class="chapter-index"><?= e($index) ?></span>
          <?php if ($hero): ?><h1 class="chapter-title"><?= $title ?></h1>
          <?php else: ?><h2 class="chapter-title"><?= $title ?></h2><?php endif; ?>
          <p class="chapter-sub"><?= e($sub) ?></p>
        </div>
      </div>
      <?php if ($hero): ?><div class="scroll-cue"><span class="line"></span>Scroll to begin</div><?php endif; ?>
    </div>
  </section>
<?php }

/* ---- CH 01 : the land (hero) ---- */
chapter(1, 'Chapter 01 — The land', 'From the ground<br><em>to the keys.</em>',
    'It starts with the land. An aerial descent onto a bare coastal plot, where a sweep of light draws the plan across the earth.', true);
?>

<!-- ===== Manifesto + figures (modern, original) ===== -->
<section class="manifesto">
  <div class="wrap">
    <p class="eyebrow reveal">Why Excello</p>
    <p class="manifesto-lead reveal">Most projects break in the gaps between the architect, the engineer, and the builder. <span class="hl">We hold all three</span>, so nothing falls through.</p>
    <p class="manifesto-body reveal d1">One team carries your project from the plot you buy to the door you open. One contract. One line of accountability. A finished home, not a to-do list.</p>
    <div class="stats reveal d1">
      <div class="stat"><div class="fig">5</div><div class="lbl">Stages, one team — land to handover</div></div>
      <div class="stat"><div class="fig">6</div><div class="lbl">Disciplines in-house</div></div>
      <div class="stat"><div class="fig">1</div><div class="lbl">Contract, one point of contact</div></div>
      <div class="stat"><div class="fig">0</div><div class="lbl">Gaps to fall through</div></div>
    </div>
  </div>
</section>

<?php chapter(2, 'Chapter 02 — The plan rises', 'We shape it before we<br>pour a single stone.',
    'The flat plan rises into a clean model as the camera cranes from above to a low angle.'); ?>

<!-- ===== Discipline marquee + approach list (modern, original) ===== -->
<div class="marquee" aria-hidden="true">
  <div class="marquee-row">
    <?php $disc = ['Land &amp; Real Estate','Architecture','Interior Design','Construction','Project Management','Branding'];
    for ($k = 0; $k < 2; $k++) foreach ($disc as $d) echo '<span class="marquee-item">' . $d . '</span>'; ?>
  </div>
</div>

<section class="approach section">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">Everything under one roof</p>
      <h2>One team, every stage.</h2>
    </div>
    <div class="approach-list">
      <?php
      $items = [
        ['01', 'Land &amp; Real Estate', 'We read the plot before you commit: setbacks, soil, access, and the honest cost to build.'],
        ['02', 'Architecture', 'Homes designed around how you live, drawn to be built, not just admired.'],
        ['03', 'Interior Design', 'The inside and outside drawn by one hand, in one language.'],
        ['04', 'Construction', 'Our own teams build what we drew, on one contract, to the drawing.'],
        ['05', 'Project Management', 'One schedule, one budget, one person who answers the phone.'],
        ['06', 'Branding', 'For the developments and hospitality projects that need an identity.'],
      ];
      foreach ($items as $it): ?>
        <div class="approach-item reveal">
          <span class="approach-num"><?= e($it[0]) ?></span>
          <span class="approach-name"><?= $it[1] ?></span>
          <span class="approach-desc"><?= e($it[2]) ?></span>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<?php chapter(3, 'Chapter 03 — It becomes real', 'Design, engineering,<br>construction. <em>One team.</em>',
    'A wave of light sweeps the model and materials appear: timber, concrete, glass, water, a golden-hour sky.'); ?>

<!-- ===== Selected work — draggable showcase slider (modern, original) ===== -->
<section class="showcase">
  <div class="wrap">
    <div class="showcase-head">
      <div class="reveal">
        <p class="eyebrow">Selected work</p>
        <h2>The work, land to keys.</h2>
      </div>
      <div class="slider-nav reveal d1">
        <span class="slider-hint">Drag, or</span>
        <button class="slider-btn" data-dir="-1" aria-label="Previous">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 5l-7 7 7 7"/></svg>
        </button>
        <button class="slider-btn" data-dir="1" aria-label="Next">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  </div>

  <div class="slider" id="workSlider">
    <div class="slider-track">
      <?php foreach ($featured as $p): ?>
        <a class="slide" href="<?= url('projects.php') ?>#p<?= (int)$p['id'] ?>">
          <?php if ($p['featured']): ?><span class="slide-tag">Lead development</span><?php endif; ?>
          <img class="slide-img" data-slide-parallax src="<?= cover_src($p['cover']) ?>" alt="<?= e($p['title']) ?>" loading="lazy">
          <div class="slide-body">
            <span class="slide-type"><?= e(ucfirst($p['type'])) ?></span>
            <h3 class="slide-title"><?= e($p['title']) ?></h3>
            <p class="slide-meta"><?= e($p['location']) ?> · <?= e($p['status']) ?></p>
          </div>
        </a>
      <?php endforeach; ?>
    </div>
  </div>

  <div class="wrap" style="margin-top:2.6rem">
    <a class="btn btn-ghost reveal" href="<?= url('projects.php') ?>">All projects</a>
  </div>
</section>

<?php chapter(4, 'Chapter 04 — The handover', 'Then we hand<br>you the <em>keys.</em>',
    'The door opens and the camera glides inside, resting on the ocean through the glass.'); ?>

<?php require __DIR__ . '/inc/footer.php'; ?>
