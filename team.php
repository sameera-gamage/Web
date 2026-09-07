<?php
require_once __DIR__ . '/inc/helpers.php';
$page_title = 'Team';
$page_desc  = 'The people who hold each stage, from the land to the keys.';
require __DIR__ . '/inc/head.php';
require __DIR__ . '/inc/nav.php';
$people = [
  ['Founder & Principal Architect','Sets the design direction and holds the line from the first sketch to the handover.','portrait-1.svg'],
  ['Head of Engineering','Structure and services, drawn in-house so the design is always buildable.','portrait-2.svg'],
  ['Construction Director','Runs the site teams and the schedule, one contract, one point of contact.','portrait-3.svg'],
  ['Lead Interior Designer','Draws the inside with the outside, so nothing feels bolted on.','portrait-2.svg'],
  ['Land & Real Estate Lead','Reads every plot before a client commits, coast to city.','portrait-3.svg'],
  ['Project Manager','Keeps the budget, the schedule, and the promises in one place.','portrait-1.svg'],
];
?>
<main>
  <section class="page-hero panel-sky">
    <div class="wrap">
      <p class="eyebrow rv rv-up">The studio</p>
      <h1 class="display word-rv" style="max-width:16ch">The people behind each stage.</h1>
      <p class="lead muted rv rv-up" style="max-width:52ch;margin-top:1.2rem">A design-build studio is only as good as the hands that hold it. These are the people who carry your project, land to keys.</p>
    </div>
  </section>

  <section class="section panel-cream">
    <div class="wrap">
      <div class="team-grid">
        <?php foreach ($people as $i=>$p): ?>
          <article class="person">
            <div class="person-photo <?= $i%3===1?'clip-r':($i%3===2?'clip-b':'clip-l') ?>"><img src="<?= ph($p[2]) ?>" alt="<?= strip_tags($p[0]) ?>" loading="lazy"></div>
            <h3 class="rv rv-up">Excello</h3>
            <div class="role rv rv-up"><?= e($p[0]) ?></div>
            <p class="rv rv-up"><?= e($p[1]) ?></p>
          </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="section panel-ink center" style="position:relative;overflow:hidden">
    <?= flower('bl') ?>
    <div class="wrap">
      <span class="script rv rv-up" style="font-size:clamp(2rem,5vw,3rem);color:var(--gold-hi)">join us</span>
      <h2 class="rv rv-up" style="color:var(--cream);margin:.3rem 0 1rem">People who build carefully.</h2>
      <p class="lead muted rv rv-up" style="max-width:44ch;margin:0 auto 2rem">Architects, engineers, site leads and designers who want to see a project the whole way through.</p>
      <a class="btn rv rv-up" href="<?= url('contact.php') ?>?about=<?= rawurlencode('Careers') ?>">Get in touch</a>
    </div>
  </section>
</main>
<?php require __DIR__ . '/inc/footer.php'; ?>
