<?php
require_once __DIR__ . '/inc/helpers.php';
$page_title = 'Services';
$page_desc  = 'The land-to-handover lifecycle, service by service. Everything under one roof.';
require __DIR__ . '/inc/head.php';
require __DIR__ . '/inc/nav.php';

$services = [
  ['Land &amp; Real Estate', 'We find and read the plot before you commit: setbacks, soil, access, services, and the honest cost of building on it.'],
  ['Architecture', 'Homes and buildings designed around how you live and work, drawn to be built, not just to be admired.'],
  ['Interior Design', 'The inside and the outside drawn by one hand, in one language, so nothing feels bolted on.'],
  ['Construction', 'Our own site teams build what we drew, on one contract, to the drawing, on the schedule.'],
  ['Project Management', 'One schedule, one budget, one person who answers the phone. We hold the whole thing together.'],
  ['Branding', 'For developments and hospitality projects that need a name, a mark, and a story to sell.'],
];

$timeline = [
  ['01', 'Land', 'Feasibility, survey, and the real cost to build.'],
  ['02', 'Design', 'Architecture and interiors, drawn together.'],
  ['03', 'Engineering', 'Structure and services, tested in-house.'],
  ['04', 'Construction', 'Our teams build it, one contract.'],
  ['05', 'Handover', 'The keys, and a home that works.'],
];
?>
<main>
  <section class="page-hero">
    <div class="wrap">
      <p class="eyebrow reveal">Everything under one roof</p>
      <h1 class="display reveal d1">One team, every stage.</h1>
      <p class="lead muted reveal d2" style="max-width:54ch;margin-top:1rem">From the land purchase to the front door, the same team carries your project. No handoffs, no gaps, no one to blame but us.</p>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="grid-3">
        <?php foreach ($services as $i => $s): ?>
          <div class="card reveal d<?= ($i % 3) + 1 ?>">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>
            <h3><?= $s[0] ?></h3>
            <p><?= e($s[1]) ?></p>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="band alt section">
    <div class="wrap">
      <div class="section-head reveal">
        <p class="eyebrow">The lifecycle</p>
        <h2>Land to handover, in five moves.</h2>
      </div>
      <div class="process reveal">
        <?php foreach ($timeline as $t): ?>
          <div class="process-step">
            <div class="process-num"><?= e($t[0]) ?></div>
            <div><h3><?= e($t[1]) ?></h3><p><?= e($t[2]) ?></p></div>
          </div>
        <?php endforeach; ?>
      </div>
      <div class="center reveal" style="margin-top:2.6rem">
        <a class="btn" href="<?= url('contact.php') ?>">Start your project</a>
      </div>
    </div>
  </section>
</main>
<?php require __DIR__ . '/inc/footer.php'; ?>
