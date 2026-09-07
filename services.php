<?php
require_once __DIR__ . '/inc/helpers.php';
$page_title = 'Services';
$page_desc  = 'The land-to-handover lifecycle, service by service. Everything under one roof.';
require __DIR__ . '/inc/head.php';
require __DIR__ . '/inc/nav.php';
$stages = [
  ['01','Land & Real Estate','We find and read the plot before you commit: setbacks, soil, access, services, and the honest cost of building on it. The right piece of land is the first design decision.'],
  ['02','Architecture','Homes and buildings designed around how you live and work, drawn to be built, not just to be admired. Every line is checked against how it will actually stand.'],
  ['03','Interior Design','The inside and the outside drawn by one hand, in one language, so nothing feels bolted on.'],
  ['04','Engineering','Structure and services designed in-house and tested against the design before the ground is broken.'],
  ['05','Construction','Our own site teams build what we drew, on one contract, to the drawing, on the schedule.'],
  ['06','Project Management','One schedule, one budget, one person who answers the phone, from the first survey to the keys.'],
];
?>
<main>
  <section class="page-hero panel-cream">
    <?= flower('tr') ?>
    <div class="wrap">
      <p class="eyebrow rv rv-up">Everything under one roof</p>
      <h1 class="display word-rv" style="max-width:10ch">One team, every stage.</h1>
      <p class="lead muted rv rv-up" style="max-width:54ch;margin-top:1.2rem">From the land purchase to the front door, the same team carries your project. No handoffs, no gaps, no one to blame but us.</p>
    </div>
  </section>

  <div class="kinetic panel-sky"><div class="kw" data-kinetic="-14">LAND · DESIGN · ENGINEERING · BUILD · <span class="outline">HANDOVER</span> ·</div></div>

  <section class="section panel-cream">
    <div class="wrap">
      <div class="tl" id="lifecycle">
        <span class="tl-line"></span>
        <?php foreach ($stages as $s): ?>
          <div class="tl-item rv rv-up"><div class="tl-num"><?= e($s[0]) ?> — Stage</div><h3><?= e($s[1]) ?></h3><p><?= e($s[2]) ?></p></div>
        <?php endforeach; ?>
      </div>
      <div class="center rv rv-up" style="margin-top:clamp(3rem,6vw,5rem)"><a class="btn btn-solid" href="<?= url('contact.php') ?>">Start your project</a></div>
    </div>
  </section>
</main>
<?php require __DIR__ . '/inc/footer.php'; ?>
