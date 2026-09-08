<?php
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/helpers.php';

$work = db()->query("SELECT * FROM projects ORDER BY featured DESC, sort_order ASC LIMIT 6")->fetchAll();

$page_title = 'From the ground to the keys';
$page_desc  = 'A cinematic journey through an Excello home — land, design, materials, construction, and the keys.';
$navlight = true;
require __DIR__ . '/inc/head.php';
?>
<div class="preloader" aria-hidden="true"><div class="pl-word">EXCELLO</div><div class="pl-bar"></div></div>
<?php require __DIR__ . '/inc/nav.php'; ?>

<main>

<!-- ========= ACT I — scroll-scrubbed video (the arrival) ========= -->
<section class="vhero" id="vhero">
  <div class="vhero-stage">
    <video class="vhero-vid" muted playsinline preload="auto" poster="<?= asset('video/hero-poster.jpg') ?>"><source src="<?= asset('video/hero.mp4') ?>" type="video/mp4"></video>
    <img class="vhero-poster" src="<?= asset('video/hero-poster.jpg') ?>" alt="An Excello residence">
    <div class="vhero-loader"></div>
    <div class="vhero-copy hero-copy"><p class="eyebrow">Excello — Mount Lavinia, Sri Lanka</p></div>
    <div class="vhero-cap cap-1 hero-copy"><h1 class="hero-title"><span class="mask"><span>From the ground</span></span><span class="mask"><span class="script">to the keys.</span></span></h1></div>
    <div class="vhero-cap cap-2 hero-copy"><h2 class="hero-title" style="font-size:clamp(2.4rem,7vw,6rem)">A home, carried<br><span class="script">the whole way.</span></h2></div>
    <div class="hero-cue"><span class="l"></span>Scroll to play</div>
  </div>
</section>

<!-- ========= ACT II — the cinematic film ========= -->
<?php
$scenes = [
  ['Chapter 01 — The land',   'rimg', 'site.jpg',            'It starts with<br>the land.'],
  ['Chapter 02 — The design', 'cover','chapter-02.jpg',      'We draw it before<br>we build it.'],
  ['Chapter 03 — The making', 'rimg', 'hero-exterior.jpg',   'Then we raise it,<br><span class="script">brick by brick.</span>'],
  ['Chapter 04 — The light',  'rimg', 'living-3.jpg',        'Light finds<br>its rooms.'],
  ['Chapter 05 — The calm',   'rimg', 'bedroom-1.jpg',       'Calm, in<br>every corner.'],
  ['Chapter 06 — Together',   'rimg', 'dining-1.jpg',        'A place<br>to gather.'],
  ['Chapter 07 — The rooftop','rimg', 'rooftop-garden.jpg',  'A rooftop<br>to share.'],
  ['Chapter 08 — The keys',   'rimg', 'view-living.jpg',     'Then we hand<br>you the <span class="script">keys.</span>'],
];
$n = count($scenes);
?>
<section class="cfilm" id="cfilm" style="height:<?= $n * 90 ?>vh">
  <div class="cfilm-stage">
    <div class="cfilm-bars"></div>
    <?php foreach ($scenes as $i => $s): $src = $s[1] === 'rimg' ? rimg($s[2]) : cover_src($s[2]); ?>
      <div class="cscene" data-scene="<?= $i ?>">
        <img src="<?= $src ?>" alt="<?= strip_tags($s[3]) ?>" <?= $i === 0 ? '' : 'loading="lazy"' ?>>
        <div class="cscene-cap"><p class="ceyebrow"><?= e($s[0]) ?></p><h2 class="ctitle"><?= $s[3] ?></h2></div>
      </div>
    <?php endforeach; ?>
    <div class="cfilm-index"><b id="cfilmNow">01</b> / <?= str_pad((string)$n, 2, '0', STR_PAD_LEFT) ?></div>
  </div>
</section>

<!-- ========= ACT III — the outro (a real page beneath the film) ========= -->
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

<!-- selected work — quiet strip -->
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

<!-- promise + surprise -->
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
