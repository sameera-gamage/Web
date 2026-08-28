<?php
declare(strict_types=1);
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/layout.php';

$projects = all_projects();
$first = $projects[0] ?? null;
$trades = ['Search', 'Paid media', 'Social', 'Brand', 'Film', 'Photography'];

head_open(
  'RapidStudio, an independent studio for search, media, film and stills',
  'An independent studio running search, paid media, social, brand, film and photography for businesses that would rather hire one team than five.',
  'index');
?>
<!--
  ══ loader ══
  The hero is a megabyte and a half of film. Without this the page shows a
  poster, then jumps when the clip takes over, and nothing tells you it is
  working. It holds on the wordmark with a real progress read and clears only
  once the footage can actually be scrubbed.
-->
<div id="boot" class="boot">
  <div class="boot-in">
    <span class="boot-mark">Rapid<span class="text-flame">&bull;</span>Studio</span>
    <span class="boot-iris" aria-hidden="true"><i id="boot-fill"></i></span>
    <span class="boot-read"><em id="boot-pct">0</em>%<span class="boot-what" id="boot-what">loading the film</span></span>
  </div>
</div>

<main id="main">
  <!-- ══ the rig ══ -->
  <section id="top" class="relative" style="height:300vh">
    <div id="hero-bed" class="hero-bed" aria-hidden="true"></div>
    <div id="hero-mat" class="hero-mat" aria-hidden="true"></div>
    <div id="hero-frame" class="hero-frame bg-ink">
      <div class="hero-stage absolute inset-0">
        <video id="cam" class="hero-vid h-full w-full"
               poster="<?= e(url('/assets/media/hero-poster.jpg')) ?>"
               preload="none" muted playsinline disablepictureinpicture aria-hidden="true">
          <!-- VP9 first: smaller, and it covers Chromium builds with no H.264
               decoder. The URLs sit in data-src so nothing is fetched during
               parse — preload="none" is only a hint. -->
          <source data-src="<?= e(url('/assets/media/hero-camera-720.webm')) ?>" type="video/webm">
          <source data-src="<?= e(url('/assets/media/hero-camera-720.mp4')) ?>" type="video/mp4">
        </video>
      </div>

      <div id="hero-smoke" class="hero-smoke pointer-events-none absolute inset-0">
        <span class="smoke smoke-warm"></span>
        <span class="smoke smoke-cool"></span>
      </div>

      <div class="pointer-events-none absolute inset-0 hero-vig"></div>
      <div id="hero-scrim" class="hero-scrim pointer-events-none absolute inset-0"></div>
      <div id="hero-well" class="hero-well pointer-events-none absolute inset-0 opacity-0"></div>

      <div id="hero-a" class="hero-copy">
        <div class="hero-copy-in">
          <p class="label">Est. 2019 · Independent</p>
          <h1 class="hero-h1">
            <span class="block overflow-hidden"><span class="ln inline-block">Six trades.</span></span>
            <span class="block overflow-hidden"><span class="ln inline-block text-flame">One room.</span></span>
          </h1>
          <p class="hero-sub">
            Search, paid media, social, brand, film and stills. Run by the same
            people, in the same building, on the same plan.
          </p>
        </div>
      </div>

      <div id="hero-m" class="hero-mid opacity-0">
        <ul class="hero-trades">
          <?php foreach ($trades as $i => $t): ?>
            <li><span class="text-flame"><?= str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) ?></span><?= e($t) ?></li>
          <?php endforeach; ?>
        </ul>
      </div>

      <div id="hero-b" class="hero-land opacity-0">
        <div class="hero-land-in">
          <p class="label">Now look properly</p>
          <p class="hero-land-h">This is what we&nbsp;made.</p>
        </div>
      </div>

      <div id="scroll-cue" class="hero-cue">
        <span class="label">Scroll</span><span class="hero-cue-bar"></span>
      </div>
    </div>
  </section>

  <!--
    ══ the way in ══
    Two beats, and the split is structural. The first screen is what the hero's
    aperture opens onto, so it is pulled up under the hero and the hero card
    covers it until the hole is punched — which means nothing in it can be
    clicked. So the link lives in the second screen, below the card's reach.
  -->
  <section id="gate" class="gate gate-under">
    <div class="gate-say">
      <p class="gate-k">Six trades, one room</p>
      <h2 class="gate-h"><span>Everything we</span><span>have made.</span></h2>
    </div>

    <div class="gate-do">
      <p class="gate-p">
        Search, paid media, social, brand, film and stills. Run by the same
        people, in the same building, on the same plan.
        <?= $projects ? 'Every job below, start to finish, with the numbers attached.' : '' ?>
      </p>

      <a href="<?= e(url('/projects')) ?>" class="gate-go">
        <?php if ($first): ?>
          <span class="gate-go-plate">
            <img src="<?= e(url($first['cover'])) ?>" alt="" aria-hidden="true" loading="lazy" decoding="async">
          </span>
        <?php endif; ?>
        <span class="gate-go-t">
          <em>Open the work</em>
          <b><?= str_pad((string) count($projects), 2, '0', STR_PAD_LEFT) ?> projects</b>
        </span>
        <span class="gate-go-x" aria-hidden="true">&rarr;</span>
      </a>
    </div>
  </section>

  <?php site_footer(); ?>
</main>
<?php foot_close('home.js'); ?>
