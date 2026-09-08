<?php
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/helpers.php';

$work = db()->query("SELECT * FROM projects ORDER BY featured DESC, sort_order ASC LIMIT 6")->fetchAll();

$page_title = 'From the ground to the keys';
$page_desc  = 'Excello is a design-build studio in Mount Lavinia. Scroll the story from the land to the keys.';
$navlight = true;
require __DIR__ . '/inc/head.php';

/* full-bleed video moment */
function vband(int $n, string $eyebrow, string $title, string $num): void { ?>
  <section class="vband">
    <video muted playsinline loop preload="none" poster="<?= asset('video/scene-'.$n.'.jpg') ?>"><source src="<?= asset('video/scene-'.$n.'.mp4') ?>" type="video/mp4"></video>
    <img class="vband-poster" src="<?= asset('video/scene-'.$n.'.jpg') ?>" alt="">
    <div class="vband-cap"><p class="veyebrow"><?= e($eyebrow) ?></p><h2 class="vtitle"><?= $title ?></h2></div>
    <div class="vband-num"><?= e($num) ?></div>
  </section>
<?php }
?>
<div class="preloader" aria-hidden="true"><div class="pl-word">EXCELLO</div><div class="pl-bar"></div></div>
<?php require __DIR__ . '/inc/nav.php'; ?>

<main>

<!-- ===== HERO — one video ===== -->
<section class="hero">
  <div class="hero-media">
    <video muted playsinline loop autoplay preload="auto" poster="<?= asset('video/scene-1.jpg') ?>"><source src="<?= asset('video/scene-1.mp4') ?>" type="video/mp4"></video>
  </div>
  <div class="hero-copy">
    <p class="eyebrow">Excello — Mount Lavinia, Sri Lanka</p>
    <h1 class="hero-title"><span class="mask"><span>From the ground</span></span><span class="mask"><span class="script">to the keys.</span></span></h1>
    <p class="hero-sub">A design-build studio that carries a home the whole way — the land you buy, the plan we draw, the walls we raise, the door you open.</p>
  </div>
  <div class="hero-cue"><span class="l"></span>Scroll the story</div>
</section>

<!-- ===== CONCEPT ===== -->
<section class="section panel-cream center">
  <div class="wrap">
    <p class="tinylabel rv rv-up">The concept</p>
    <p class="lead word-rv" style="max-width:22ch;margin:1.4rem auto 2.6rem;font-size:clamp(1.8rem,4vw,3.2rem);line-height:1.2">One team holds the line from land to handover, so nothing falls through the gaps.</p>
    <div class="rv rv-up" style="display:flex;justify-content:center">
      <a class="circ" href="<?= url('projects.php') ?>" aria-label="View our work">
        <svg viewBox="0 0 100 100"><defs><path id="cb" d="M50,50 m-34,0 a34,34 0 1,1 68,0 a34,34 0 1,1 -68,0"/></defs><text font-size="7.5"><textPath href="#cb" startOffset="0">VIEW OUR WORK · VIEW OUR WORK · </textPath></text></svg>
        <span class="circ-mid"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 17L17 7M17 7H9M17 7V15"/></svg></span>
      </a>
    </div>
  </div>
</section>

<div class="kinetic panel-sky"><div class="kw" data-kinetic="-16"><span class="outline">FROM LAND</span> TO KEYS — <span class="outline">FROM LAND</span> TO KEYS —</div></div>

<!-- ===== 01 THE LAND ===== -->
<section class="section panel-sky">
  <div class="wrap edit">
    <div class="edit-media wide clip-l"><img src="<?= rimg('site.jpg') ?>" alt="The site, from the air" loading="lazy"></div>
    <div>
      <div class="edit-num rv rv-r">01</div><p class="eyebrow rv rv-r">The land</p>
      <h2 class="rv rv-r">It starts with<br>a piece of ground.</h2>
      <p class="rv rv-r">We read the plot before you commit: the setbacks, the soil, the access, the way the light lands. The right land is the first design decision.</p>
    </div>
  </div>
</section>

<!-- ===== 02 THE DESIGN ===== -->
<section class="section panel-cream">
  <div class="wrap edit rev">
    <div class="edit-media clip-r"><img src="<?= cover_src('chapter-02.jpg') ?>" alt="The plan, drawn" loading="lazy"></div>
    <div>
      <div class="edit-num rv rv-l">02</div><p class="eyebrow rv rv-l">The design</p>
      <h2 class="rv rv-l">We shape it before<br>we pour a stone.</h2>
      <p class="rv rv-l">Architecture, interiors, structure and services drawn together, in-house, and tested against each other. What we draw is what we build.</p>
    </div>
  </div>
</section>

<!-- ===== VIDEO MOMENT — the building rises ===== -->
<?php vband(2, 'The making', 'The building rises<br>from the coast.', 'Chapter 03'); ?>

<div class="kinetic panel-cream"><div class="kw outline" data-kinetic="16">BRICK BY BRICK — BRICK BY BRICK — BRICK BY BRICK —</div></div>

<!-- ===== 03 IT BECOMES REAL ===== -->
<section class="section panel-cream">
  <div class="wrap edit">
    <div class="edit-media wide clip-b"><img src="<?= rimg('living-3.jpg') ?>" alt="A finished living room" loading="lazy"></div>
    <div>
      <div class="edit-num rv rv-r">04</div><p class="eyebrow rv rv-r">It becomes real</p>
      <h2 class="rv rv-r">Timber, stone,<br>light and air.</h2>
      <p class="rv rv-r">Materials arrive and the drawing becomes a place you can live in. Light finds its rooms; the windows frame the coast.</p>
    </div>
  </div>
</section>

<!-- ===== STEP INSIDE — interiors carousel ===== -->
<section class="section panel-ink">
  <div class="wrap"><div class="shead rv rv-up"><p class="eyebrow">Step inside</p><h2 style="color:var(--cream)">A home you can<br>feel before it exists.</h2></div></div>
  <div class="carousel rv rv-up" id="insideCar" style="padding-inline:var(--edge)">
    <div class="car-track">
      <?php foreach (['living-1.jpg'=>'Living','dining-1.jpg'=>'Dining','bedroom-1.jpg'=>'Bedroom','kitchen.jpg'=>'Kitchen','bath.jpg'=>'Bath','living-2.jpg'=>'Lounge','dining-2.jpg'=>'Dining, evening'] as $img=>$cap): ?>
        <div class="car-slide" data-cursor="Look" style="flex-basis:min(72vw,520px);aspect-ratio:4/5;position:relative">
          <img src="<?= rimg($img) ?>" alt="<?= e($cap) ?>" loading="lazy">
          <span style="position:absolute;left:0;bottom:0;padding:1.2rem;color:#fff;z-index:2;background:linear-gradient(transparent,rgba(0,0,0,.55))"><span class="tinylabel" style="color:#fff"><?= e($cap) ?></span></span>
        </div>
      <?php endforeach; ?>
    </div>
    <div class="car-nav"><button class="car-btn" data-dir="-1" aria-label="Previous"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 5l-7 7 7 7"/></svg></button><span class="car-count" style="color:var(--cream)"><span id="insideNow">1</span> — 7</span><button class="car-btn" data-dir="1" aria-label="Next"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5l7 7-7 7"/></svg></button></div>
  </div>
</section>

<!-- ===== VIDEO MOMENT — the balcony ===== -->
<?php vband(4, 'The balconies', 'Room to<br><span class="script">breathe.</span>', 'Chapter 05'); ?>

<!-- ===== AMENITIES ===== -->
<section class="section panel-cream">
  <div class="wrap">
    <div class="shead rv rv-up"><p class="eyebrow">More than a home</p><h2>A rooftop to share.</h2></div>
    <div class="amen">
      <a class="amen-card clip-l" data-cursor="View"><img src="<?= rimg('rooftop-garden.jpg') ?>" alt="Rooftop garden" loading="lazy"><span class="amen-cap"><span class="tinylabel">The garden</span><h3>Where neighbours become a community.</h3></span></a>
      <a class="amen-card clip-r" data-cursor="View"><img src="<?= rimg('rooftop-gym.jpg') ?>" alt="Rooftop gym" loading="lazy"><span class="amen-cap"><span class="tinylabel">The gym</span><h3>Open air, above the palms.</h3></span></a>
    </div>
  </div>
</section>

<!-- ===== DISCIPLINES ===== -->
<div class="marquee panel-cream" aria-hidden="true"><div class="marquee-row"><?php $disc=['Land & Real Estate','Architecture','Interior Design','Engineering','Construction','Project Management','Branding']; for($k=0;$k<2;$k++) foreach($disc as $d) echo '<span class="marquee-item">'.e($d).'</span>'; ?></div></div>

<section class="section panel-cream">
  <div class="wrap">
    <div class="shead rv rv-up"><p class="eyebrow">Everything under one roof</p><h2>One team, every stage.</h2></div>
    <div class="tl" id="disciplines"><span class="tl-line"></span>
      <?php foreach ([['01','Land & Real Estate','We find and read the plot, coast to city, before you commit.'],['02','Architecture','Homes drawn around how you live, built to stand, not just to admire.'],['03','Interior Design','Inside and outside drawn by one hand, in one language.'],['04','Engineering','Structure and services designed in-house and tested against the design.'],['05','Construction','Our own teams build what we drew, on one contract, to the drawing.'],['06','Project Management','One schedule, one budget, one person who answers the phone.']] as $r): ?>
        <div class="tl-item rv rv-up"><div class="tl-num"><?= e($r[0]) ?> — Stage</div><h3><?= e($r[1]) ?></h3><p><?= e($r[2]) ?></p></div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ===== SELECTED WORK ===== -->
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

<!-- ===== VIDEO MOMENT — the handover ===== -->
<?php vband(5, 'The handover', 'Then we hand<br>you the <span class="script">keys.</span>', 'Chapter 06'); ?>

<!-- ===== PROMISE ===== -->
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
