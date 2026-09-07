<?php
require_once __DIR__ . '/inc/helpers.php';
$page_title = 'Services';
$page_desc  = 'The land-to-handover lifecycle, service by service. Everything under one roof.';
require __DIR__ . '/inc/head.php';
require __DIR__ . '/inc/nav.php';

$stages = [
  ['01', 'Land & Real Estate', 'We find and read the plot before you commit: setbacks, soil, access, services, and the honest cost of building on it. The right piece of land is the first design decision.'],
  ['02', 'Architecture', 'Homes and buildings designed around how you live and work, drawn to be built, not just to be admired. Every line is checked against how it will actually stand.'],
  ['03', 'Interior Design', 'The inside and the outside drawn by one hand, in one language, so nothing feels bolted on. Materials, light, and furniture planned with the architecture, not after it.'],
  ['04', 'Engineering', 'Structure and services designed in-house and tested against the design before the ground is broken, so what we draw is what we can pour.'],
  ['05', 'Construction', 'Our own site teams build what we drew, on one contract, to the drawing, on the schedule. One team on site means one standard held.'],
  ['06', 'Project Management', 'One schedule, one budget, one person who answers the phone. We hold the whole thing together, from the first survey to the day you get the keys.'],
];
?>
<main>
  <section class="page-hero">
    <div class="orbs">
      <span class="orb" style="width:300px;height:300px;left:-40px;top:20%"></span>
      <span class="orb" style="width:180px;height:180px;right:8%;top:12%;animation-duration:22s"></span>
    </div>
    <div class="wrap">
      <p class="eyebrow reveal">Everything under one roof</p>
      <h1 class="display reveal d1">One team,<br>every stage.</h1>
      <p class="lead muted reveal d2" style="max-width:54ch;margin-top:1rem">From the land purchase to the front door, the same team carries your project. No handoffs, no gaps, no one to blame but us.</p>
    </div>
  </section>

  <section class="section" style="padding-top:clamp(1rem,3vw,3rem)">
    <div class="wrap">
      <div class="tl" id="lifecycle">
        <span class="tl-line"></span>
        <?php foreach ($stages as $s): ?>
          <div class="tl-item reveal">
            <div class="tl-num"><?= e($s[0]) ?> — Stage</div>
            <h3><?= e($s[1]) ?></h3>
            <p><?= e($s[2]) ?></p>
          </div>
        <?php endforeach; ?>
      </div>

      <div class="center reveal" style="margin-top:clamp(3rem,6vw,5rem)">
        <a class="btn btn-lg" href="<?= url('contact.php') ?>">Start your project</a>
      </div>
    </div>
  </section>
</main>
<?php require __DIR__ . '/inc/footer.php'; ?>
