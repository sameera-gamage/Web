<?php
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/helpers.php';

$work = db()->query("SELECT * FROM projects ORDER BY featured DESC, sort_order ASC LIMIT 6")->fetchAll();

$page_title = 'From the ground to the keys';
$page_desc  = 'A cinematic film of an Excello home — the building, the balconies, the light, the rooms.';
$navlight = true;
require __DIR__ . '/inc/head.php';

/* the video film, in story order */
$film = [
  ['Excello — Mount Lavinia, Sri Lanka', 'From the ground<br><span class="script">to the keys.</span>'],
  ['The building',   'Rising from<br>the coast.'],
  ['The craft',      'Crafted,<br>floor by floor.'],
  ['The balconies',  'Room to<br><span class="script">breathe.</span>'],
  ['The rooms',      'A home that\'s<br>ready for you.'],
];
$fn = count($film);
?>
<div class="preloader" aria-hidden="true"><div class="pl-word">EXCELLO</div><div class="pl-bar"></div></div>
<?php require __DIR__ . '/inc/nav.php'; ?>

<main>

<!-- ========= THE MIST VIDEO FILM ========= -->
<section class="vfilm" id="vfilm" style="height:<?= $fn * 100 ?>vh">
  <div class="vfilm-stage">
    <?php foreach ($film as $i => $s): $n = $i + 1; ?>
      <div class="vscene" data-scene="<?= $i ?>">
        <video muted playsinline loop preload="<?= $i === 0 ? 'auto' : 'none' ?>" poster="<?= asset('video/scene-'.$n.'.jpg') ?>">
          <source src="<?= asset('video/scene-'.$n.'.mp4') ?>" type="video/mp4">
        </video>
        <img class="vscene-poster" src="<?= asset('video/scene-'.$n.'.jpg') ?>" alt="">
        <div class="vcap"><?php if ($i === 0): ?><p class="veyebrow"><?= e($s[0]) ?></p><h1 class="vtitle"><?= $s[1] ?></h1><?php else: ?><p class="veyebrow"><?= e($s[0]) ?></p><h2 class="vtitle"><?= $s[1] ?></h2><?php endif; ?></div>
      </div>
    <?php endforeach; ?>
    <div class="mist" id="mist"></div>
    <div class="vfilm-bars"></div>
    <div class="vfilm-index"><b id="vfilmNow">01</b> / <?= str_pad((string)$fn, 2, '0', STR_PAD_LEFT) ?></div>
    <div class="vfilm-cue"><span class="l"></span>Scroll</div>
  </div>
</section>

<!-- ========= OUTRO — a real page beneath the film ========= -->
<section class="section panel-cream center">
  <div class="wrap">
    <p class="tinylabel rv rv-up">The studio</p>
    <p class="lead word-rv" style="max-width:24ch;margin:1.4rem auto 2.4rem;font-size:clamp(1.8rem,4vw,3rem);line-height:1.22">
      One team holds the line from land to handover, so nothing falls through the gaps.
    </p>
    <div class="rv rv-up" style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
      <a class="btn btn-solid" href="<?= url('projects.php') ?>">See the work</a>
      <a class="btn" href="<?= url('services.php') ?>">What we do</a>
    </div>
  </div>
</section>

<section class="section panel-sky">
  <div class="wrap"><div class="shead rv rv-up"><p class="eyebrow">Selected work</p><h2>The proof, land to keys.</h2></div></div>
  <div class="carousel rv rv-up" id="workCar" style="padding-inline:var(--edge)">
    <div class="car-track">
      <?php foreach ($work as $p): ?>
        <a class="car-slide" data-cursor="View" href="<?= url('projects.php') ?>#p<?= (int)$p['id'] ?>" style="flex-basis:min(80vw,620px);aspect-ratio:4/5;position:relative">
          <img src="<?= cover_src($p['cover']) ?>" alt="<?= e($p['title']) ?>" loading="lazy">
          <span style="position:absolute;left:0;right:0;bottom:0;padding:1.4rem;background:linear-gradient(transparent,rgba(23,38,46,.7));color:var(--cream);z-index:2"><span class="tinylabel" style="color:var(--gold-hi)"><?= e(ucfirst($p['type'])) ?></span><br><span style="font-family:var(--f-disp);font-size:1.8rem"><?= e($p['title']) ?></span></span>
        </a>
      <?php endforeach; ?>
    </div>
    <div class="car-nav"><button class="car-btn" data-dir="-1" aria-label="Previous"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 5l-7 7 7 7"/></svg></button><span class="car-count"><span id="workNow">1</span> — <?= count($work) ?></span><button class="car-btn" data-dir="1" aria-label="Next"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5l7 7-7 7"/></svg></button></div>
  </div>
</section>

<section class="section panel-ink center" id="promise" style="overflow:hidden;position:relative">
  <?= flower('tl') ?><?= flower('br') ?>
  <div class="petals" id="petals" aria-hidden="true"></div>
  <div class="wrap">
    <span class="script rv rv-up" style="font-size:clamp(2rem,5vw,3.4rem);color:var(--gold-hi)">the promise</span>
    <h2 class="rv rv-up" style="color:var(--cream);font-size:clamp(2.4rem,7vw,5.4rem);margin:.4rem 0 1.4rem">A finished home.<br>Not a to-do list.</h2>
    <p class="lead muted rv rv-up" style="max-width:40ch;margin:0 auto 2.2rem">When one team owns every stage, the keys arrive with nothing left undone.</p>
    <a class="btn rv rv-up" href="<?= url('contact.php') ?>">Start your project</a>
  </div>
</section>

</main>
<?php require __DIR__ . '/inc/footer.php'; ?>
