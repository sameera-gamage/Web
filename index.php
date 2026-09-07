<?php
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/helpers.php';

$work = db()->query("SELECT * FROM projects ORDER BY featured DESC, sort_order ASC LIMIT 6")->fetchAll();

$page_title = 'From the ground to the keys';
$page_desc  = 'Excello is a design-build firm in Mount Lavinia that carries a project the whole way: land, survey, design, engineering, brick by brick, to the keys.';
require __DIR__ . '/inc/head.php';
?>
<div class="preloader" aria-hidden="true">
  <div class="pl-word">EXCELLO</div>
  <div class="pl-bar"></div>
</div>
<div class="progress" id="progress"></div>
<?php require __DIR__ . '/inc/nav.php'; ?>

<?php
function chapter(int $n, string $index, string $title, string $sub): void { ?>
  <section class="chapter" id="ch<?= $n ?>">
    <div class="chapter-stage">
      <div class="chapter-media"><?= film_media($n, strip_tags($title)) ?></div>
      <div class="chapter-copy"><div class="wrap">
        <span class="chapter-index"><?= e($index) ?></span>
        <h2 class="chapter-title"><?= $title ?></h2>
        <p class="chapter-sub"><?= e($sub) ?></p>
      </div></div>
    </div>
  </section>
<?php }
?>

<!-- ===== CH 01 — the land (hero, masked reveal) ===== -->
<section class="chapter is-hero" id="ch1">
  <div class="chapter-stage">
    <div class="chapter-media"><?= film_media(1, 'A bare coastal plot') ?></div>
    <div class="chapter-copy"><div class="wrap">
      <span class="chapter-index">Chapter 01 — The land</span>
      <h1 class="chapter-title">
        <span class="mask"><span>From the ground</span></span>
        <span class="mask"><span><em>to the keys.</em></span></span>
      </h1>
      <p class="chapter-sub">It starts with a bare coastal plot. One team will carry it, brick by brick, all the way to the day you open the door.</p>
    </div></div>
    <div class="scroll-cue"><span class="line"></span>Scroll to build</div>
  </div>
</section>

<!-- ===== The land — what we read before you commit ===== -->
<div class="marquee" aria-hidden="true">
  <div class="marquee-row">
    <?php $chk = ['Setbacks','Soil','Access','Water table','Orientation','Services','Cost to build'];
    for ($k=0;$k<2;$k++) foreach ($chk as $c) echo '<span class="marquee-item">' . e($c) . '</span>'; ?>
  </div>
</div>

<!-- ===== ACT — Survey (self-drawing plot) ===== -->
<section class="survey">
  <div class="orbs"><span class="orb" style="width:320px;height:320px;left:-40px;bottom:6%"></span></div>
  <div class="wrap">
    <div>
      <p class="eyebrow reveal">Before a single stone</p>
      <h2 class="reveal">We read the land<br>before you commit.</h2>
      <p class="lead muted reveal d1" style="max-width:44ch;margin-top:1.2rem">Setbacks, soil, access, the water table, the way the light lands. The right piece of land is the first design decision, so we survey it, plot it, and price the real cost of building on it.</p>
    </div>
    <div class="survey-plot reveal d1">
      <svg viewBox="0 0 400 400" fill="none">
        <path class="s-fill" d="M70,120 L322,92 L350,318 L98,350 Z"/>
        <path class="s-draw" d="M70,120 L322,92 L350,318 L98,350 Z"/>
        <path class="s-draw" style="stroke-width:1;stroke-dasharray:6 6" d="M96,148 L300,124 L324,296 L122,322 Z"/>
        <path class="s-draw" style="opacity:.7" d="M70,120 L350,318"/>
        <path class="s-draw" style="opacity:.7" d="M322,92 L98,350"/>
        <circle class="survey-dot" cx="70" cy="120" r="5"/>
        <circle class="survey-dot" cx="322" cy="92" r="5"/>
        <circle class="survey-dot" cx="350" cy="318" r="5"/>
        <circle class="survey-dot" cx="98" cy="350" r="5"/>
      </svg>
    </div>
  </div>
</section>

<!-- ===== CH 02 — the plan rises ===== -->
<?php chapter(2, 'Chapter 02 — The plan', 'We shape it before we<br>pour a single stone.',
    'The flat plan rises into a model. Structure and services drawn in-house, tested against the design, so what we draw is what we can build.'); ?>

<!-- ===== SIGNATURE — brick by brick ===== -->
<section class="build">
  <div class="build-stage">
    <div class="build-count">The build · foundation to finish</div>
    <div class="build-house">
      <div class="build-real"><img src="<?= cover_src('chapter-03.jpg') ?>" alt="The finished villa"></div>
      <div class="roofslab"></div>
      <div class="wall"><?php for ($i=0;$i<144;$i++) echo '<span class="brick"></span>'; ?></div>
      <span class="win w1"></span><span class="win w2"></span><span class="win w3"></span>
    </div>
    <div class="build-cap">
      <span class="bc bc-1">We lay it, <em>brick by brick.</em></span>
      <span class="bc bc-2">Structure, then <em>shelter.</em></span>
      <span class="bc bc-3">Light finds <em>its rooms.</em></span>
      <span class="bc bc-4">And it <em>becomes real.</em></span>
    </div>
  </div>
</section>

<!-- ===== ACT — Materials ===== -->
<section class="materials">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">Real materials, real hands</p>
      <h2>Timber, concrete, glass, water, green.</h2>
    </div>
    <div class="mat-row">
      <?php
      $mats = ['Timber','Concrete','Glass','Water','Greenery'];
      foreach ($mats as $m): ?>
        <div class="mat reveal">
          <svg class="mat-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/></svg>
          <span><?= e($m) ?></span>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ===== CH 03 handled by the brick reveal; now: everything we do (horizontal) ===== -->
<section class="hsec">
  <div class="wrap hsec-head reveal">
    <p class="eyebrow">Everything under one roof</p>
    <h2>One team, every stage.</h2>
  </div>
  <div class="htrack">
    <div class="hpanel intro"><h2>We do<br><em>all of it.</em></h2></div>
    <?php
    $disc = [
      ['01','Land & Real Estate','We find and read the plot, coast to city, before you commit.'],
      ['02','Architecture','Homes drawn around how you live, built to stand, not just to admire.'],
      ['03','Interior Design','Inside and outside drawn by one hand, in one language.'],
      ['04','Engineering','Structure and services designed in-house and tested against the design.'],
      ['05','Construction','Our own teams build what we drew, on one contract, to the drawing.'],
      ['06','Project Management','One schedule, one budget, one person who answers the phone.'],
      ['07','Branding','For the developments and hospitality projects that need an identity.'],
    ];
    foreach ($disc as $d): ?>
      <div class="hpanel">
        <span class="hp-num"><?= e($d[0]) ?></span>
        <h3><?= e($d[1]) ?></h3>
        <p><?= e($d[2]) ?></p>
      </div>
    <?php endforeach; ?>
  </div>
</section>

<!-- ===== The numbers ===== -->
<section class="proof">
  <div class="wrap">
    <div class="section-head center reveal" style="margin-inline:auto">
      <p class="eyebrow">Why it holds</p>
      <h2>One line of accountability.</h2>
    </div>
    <div class="metrics reveal">
      <div class="metric"><div class="m-fig"><span data-count="5">5</span></div><div class="m-lbl">Stages, land to keys</div></div>
      <div class="metric"><div class="m-fig"><span data-count="7">7</span></div><div class="m-lbl">Disciplines in-house</div></div>
      <div class="metric"><div class="m-fig"><span data-count="1">1</span></div><div class="m-lbl">Contract, one contact</div></div>
      <div class="metric"><div class="m-fig"><span data-count="0">0</span></div><div class="m-lbl">Gaps to fall through</div></div>
    </div>
  </div>
</section>

<!-- ===== Selected work — cursor-reveal list ===== -->
<section class="worklist">
  <div class="work-float"><?php foreach ($work as $p): ?><img data-img="<?= (int)$p['id'] ?>" src="<?= cover_src($p['cover']) ?>" alt=""><?php endforeach; ?></div>
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">Selected work</p>
      <h2>The proof, land to keys.</h2>
    </div>
    <div class="work-items">
      <?php foreach ($work as $p): ?>
        <a class="work-item" data-img="<?= (int)$p['id'] ?>" href="<?= url('projects.php') ?>#p<?= (int)$p['id'] ?>">
          <span class="work-name"><?= e($p['title']) ?></span>
          <span class="work-tag"><?= e(ucfirst($p['type'])) ?> · <?= e($p['location']) ?></span>
        </a>
      <?php endforeach; ?>
    </div>
    <div class="reveal" style="margin-top:2.4rem"><a class="btn btn-ghost" href="<?= url('projects.php') ?>">All projects</a></div>
  </div>
</section>

<!-- ===== CH 04 — the handover ===== -->
<?php chapter(4, 'Chapter 04 — The handover', 'Then we hand<br>you the <em>keys.</em>',
    'The door opens onto the ocean through the glass. A finished home, not a to-do list. That is the whole point.'); ?>

<?php require __DIR__ . '/inc/footer.php'; ?>
