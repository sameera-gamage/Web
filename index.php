<?php
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/helpers.php';

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

<!-- ===== MIDDLE 1 : the line — land to handover, drawn as you arrive ===== -->
<section class="lineup">
  <div class="orbs">
    <span class="orb" style="width:340px;height:340px;left:-60px;top:10%"></span>
    <span class="orb" style="width:220px;height:220px;right:4%;bottom:8%;animation-duration:22s"></span>
  </div>
  <div class="wrap">
    <p class="eyebrow reveal">One line of accountability</p>
    <h2 class="lineup-head reveal">Most projects break in the gaps. <span style="color:var(--bronze-hi)">We hold the line</span> from land to handover.</h2>
    <div class="stageline reveal" id="stageline">
      <span class="stbar"></span>
      <div class="nodes">
        <?php
        $stages = [['01','Land'],['02','Design'],['03','Engineering'],['04','Construction'],['05','Handover']];
        foreach ($stages as $s): ?>
          <div class="node">
            <span class="node-dot"></span>
            <div><div class="node-num"><?= e($s[0]) ?></div><div class="node-name"><?= e($s[1]) ?></div></div>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>

<?php chapter(2, 'Chapter 02 — The plan rises', 'We shape it before we<br>pour a single stone.',
    'The flat plan rises into a clean model as the camera cranes from above to a low angle.'); ?>

<!-- ===== MIDDLE 2 : floating discipline cards + marquee ===== -->
<div class="marquee" aria-hidden="true">
  <div class="marquee-row">
    <?php $disc = ['Land &amp; Real Estate','Architecture','Interior Design','Construction','Project Management','Branding'];
    for ($k = 0; $k < 2; $k++) foreach ($disc as $d) echo '<span class="marquee-item">' . $d . '</span>'; ?>
  </div>
</div>

<section class="floatsec">
  <div class="orbs"><span class="orb" style="width:300px;height:300px;right:-40px;top:20%;animation-duration:20s"></span></div>
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">Everything under one roof</p>
      <h2>One team, every stage.</h2>
    </div>
    <div class="float-cards">
      <?php
      $cards = [
        ['01','Land &amp; Real Estate','We read the plot before you commit: setbacks, soil, access, and the honest cost to build.'],
        ['02','Architecture','Homes designed around how you live, drawn to be built, not just admired.'],
        ['03','Interior Design','The inside and outside drawn by one hand, in one language.'],
        ['04','Construction','Our own teams build what we drew, on one contract, to the drawing.'],
        ['05','Project Management','One schedule, one budget, one person who answers the phone.'],
        ['06','Branding','For the developments and hospitality projects that need an identity.'],
      ];
      foreach ($cards as $c): ?>
        <div class="float-card reveal">
          <div class="fc-num"><?= e($c[0]) ?></div>
          <h3><?= $c[1] ?></h3>
          <p><?= e($c[2]) ?></p>
        </div>
      <?php endforeach; ?>
    </div>
    <div class="reveal" style="margin-top:2.6rem">
      <a class="btn btn-ghost" href="<?= url('services.php') ?>">See the lifecycle</a>
    </div>
  </div>
</section>

<?php chapter(3, 'Chapter 03 — It becomes real', 'Design, engineering,<br>construction. <em>One team.</em>',
    'A wave of light sweeps the model and materials appear: timber, concrete, glass, water, a golden-hour sky.'); ?>

<!-- ===== MIDDLE 3 : kinetic promise (replaces the slider) ===== -->
<section class="promise">
  <div class="orbs">
    <span class="orb" style="width:260px;height:260px;left:8%;top:16%"></span>
    <span class="orb" style="width:180px;height:180px;right:12%;top:30%;animation-duration:24s"></span>
    <span class="orb" style="width:120px;height:120px;left:22%;bottom:14%;animation-duration:19s"></span>
  </div>
  <div class="wrap">
    <p class="eyebrow reveal">The promise</p>
    <div class="promise-big reveal">
      <span class="row">A finished home.</span>
      <span class="row"><em>Not a to-do list.</em></span>
    </div>
    <p class="promise-sub reveal d1">When one team owns land, design, engineering, and construction, the keys arrive with nothing left undone.</p>
    <a class="btn btn-lg reveal d1" href="<?= url('projects.php') ?>">See the work</a>
  </div>
</section>

<?php chapter(4, 'Chapter 04 — The handover', 'Then we hand<br>you the <em>keys.</em>',
    'The door opens and the camera glides inside, resting on the ocean through the glass.'); ?>

<?php require __DIR__ . '/inc/footer.php'; ?>
