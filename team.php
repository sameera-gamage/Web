<?php
require_once __DIR__ . '/inc/helpers.php';
$page_title = 'Team';
$page_desc  = 'The people who hold each stage, from the land to the keys.';
require __DIR__ . '/inc/head.php';
require __DIR__ . '/inc/nav.php';

$people = [
  ['Founder &amp; Principal Architect', 'Sets the design direction and holds the line from the first sketch to the handover.', 'team-1.jpg'],
  ['Head of Engineering', 'Structure and services, drawn in-house so the design is always buildable.', 'team-2.jpg'],
  ['Construction Director', 'Runs the site teams and the schedule, one contract, one point of contact.', 'team-3.jpg'],
  ['Lead Interior Designer', 'Draws the inside with the outside, so nothing feels bolted on.', 'team-1.jpg'],
  ['Land &amp; Real Estate Lead', 'Reads every plot before a client commits, coast to city.', 'team-2.jpg'],
  ['Project Manager', 'Keeps the budget, the schedule, and the promises in one place.', 'team-3.jpg'],
];
?>
<main>
  <section class="page-hero">
    <div class="wrap">
      <p class="eyebrow reveal">The studio</p>
      <h1 class="display reveal d1">The people behind each stage.</h1>
      <p class="lead muted reveal d2" style="max-width:52ch;margin-top:1rem">A design-build studio is only as good as the hands that hold it. These are the people who carry your project, land to keys.</p>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="team-grid">
        <?php foreach ($people as $i => $p): ?>
          <article class="person reveal d<?= ($i % 3) + 1 ?>">
            <div class="person-photo">
              <img data-parallax="0.06" src="<?= cover_src($p[2]) ?>" alt="<?= strip_tags($p[0]) ?>" loading="lazy">
            </div>
            <h3>Excello</h3>
            <div class="role"><?= $p[0] ?></div>
            <p><?= e($p[1]) ?></p>
          </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="band alt section">
    <div class="wrap section-narrow center" style="margin-inline:auto">
      <p class="eyebrow reveal">Join us</p>
      <h2 class="reveal d1">We are always looking for people who build carefully.</h2>
      <p class="lead muted reveal d2" style="margin:1rem auto 2rem">Architects, engineers, site leads, and designers who want to see a project the whole way through.</p>
      <a class="btn btn-ghost reveal d2" href="<?= url('contact.php') ?>?about=<?= rawurlencode('Careers') ?>">Get in touch</a>
    </div>
  </section>
</main>
<?php require __DIR__ . '/inc/footer.php'; ?>
