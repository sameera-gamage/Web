<?php
declare(strict_types=1);
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/layout.php';
require_once __DIR__ . '/inc/auth.php';

// start the session before any HTML is sent, so the form's CSRF token can be
// issued without "headers already sent" warnings
session_boot();

$projects = all_projects();
$count = count($projects);
// the home reel shows at most five; the rest live on the full work page
$FEATURED = 5;
$featured = array_slice($projects, 0, $FEATURED);
$fcount = count($featured);
$more = $count > $FEATURED;
$trades = ['Search', 'Paid media', 'Social', 'Brand', 'Film', 'Photography'];

// what the aperture opens onto, and everything below it, lives on this one page
$services = [
    ['k' => 'Search',      't' => 'SEO & content that earns the click',        'd' => 'Technical fixes, pages worth ranking, and the writing to back them. We chase demand that already exists before we try to make more.'],
    ['k' => 'Paid media',  't' => 'Ads that pay for themselves',                'd' => 'Google, Meta, TikTok. Built around a number you care about — a sale, a lead, a booking — not impressions nobody counts.'],
    ['k' => 'Social',      't' => 'A feed people actually follow',              'd' => 'Planned, shot and posted in-house. One voice across every channel, so the brand sounds like one company, not five freelancers.'],
    ['k' => 'Brand',       't' => 'Identity that holds up everywhere',         'd' => 'Logo, type, colour and the rules that keep them consistent — from a business card to a billboard to the app icon.'],
    ['k' => 'Film',        't' => 'Video from script to final cut',            'd' => 'Concept, shoot and edit under one roof. Adverts, explainers, event films — delivered in every crop each platform wants.'],
    ['k' => 'Photography', 't' => 'Stills that sell the thing',                'd' => 'Product, people and place. Lit and retouched so the picture does the work long before the caption has to.'],
];

$faqs = [
    ['q' => 'Do I have to hire you for everything?',
     'a' => 'No. Most clients start with one thing — usually paid media or a film — and add the rest once they can see it working. You are never locked in to the full six.'],
    ['q' => 'How fast can you start?',
     'a' => 'A first call this week, a plan the next, and work moving inside two weeks for most projects. Rush jobs we will tell you honestly whether we can hit.'],
    ['q' => 'What does it cost?',
     'a' => 'Projects start around a few thousand; retainers scale with the work. We quote a fixed number before anything begins, so there is no meter running in the background.'],
    ['q' => 'Who actually does the work?',
     'a' => 'The people you meet. We are a studio, not a middleman — nothing gets quietly sent offshore. The strategist in your kickoff is the one writing the plan.'],
    ['q' => 'Do you work with businesses like mine?',
     'a' => 'Probably. We are built for owners who would rather brief one team than manage five. Industry matters less than whether you want it done properly.'],
];

$sent = ($_GET['sent'] ?? '') === '1';
$err  = ($_GET['err'] ?? '') === '1';

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
    ══ the reveal target ══
    The hero's aperture opens onto this. It is pulled up under the hero card
    (.gate-under) and covered until the hole is punched, so it must sit first.
  -->
  <section id="gate" class="gate gate-under">
    <!-- cursor-lit glow over the constellation; canvas is injected behind this -->
    <div class="gate-glow" aria-hidden="true"></div>

    <div class="gate-say">
      <span class="gate-edge" aria-hidden="true">Est. 2019 — Independent studio</span>
      <span class="gate-ghost" aria-hidden="true"><?= str_pad((string) $count, 2, '0', STR_PAD_LEFT) ?></span>

      <div class="gate-head">
        <p class="gate-k"><span class="gate-k-dot"></span>Selected work — <?= str_pad((string) $count, 2, '0', STR_PAD_LEFT) ?> projects</p>
        <h2 class="gate-h"><span>This is what</span><span>we made.</span></h2>
        <p class="gate-p">
          A handful of jobs, start to finish, with the numbers attached. Scroll
          to move through them one at a time.
        </p>
      </div>

      <!-- unique smooth-scrolling band that fills the open space -->
      <div class="gate-marquee" aria-hidden="true">
        <div class="gate-marquee-row">
          <?php for ($r = 0; $r < 2; $r++): foreach ($trades as $t): ?>
            <span class="gm-word"><?= e($t) ?></span><span class="gm-dot">&bull;</span>
          <?php endforeach; endfor; ?>
        </div>
      </div>

      <!-- rotating seal that also drives the page down into the work -->
      <a href="#work" class="seal" aria-label="Scroll to the work">
        <svg class="seal-ring" viewBox="0 0 120 120" aria-hidden="true">
          <defs>
            <path id="sealpath" d="M60,60 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0"></path>
          </defs>
          <text><textPath href="#sealpath" xlink:href="#sealpath">
            Scroll to explore &bull; the selected work &bull;
          </textPath></text>
        </svg>
        <span class="seal-core" aria-hidden="true">
          <span class="seal-arrow">&darr;</span>
        </span>
      </a>
    </div>
  </section>

  <?php if ($fcount): ?>
  <!-- ══ the work — a vertical reel: title over the picture, meta beneath ══ -->
  <section id="work" class="anchor"></section>
  <section id="stack" class="reel-wrap">
    <div class="reel-rail" id="reel-rail">
      <?php foreach ($featured as $i => $p): ?>
        <button class="reel-tick" data-tick="<?= $i ?>" aria-label="Go to <?= e($p['client']) ?>">
          <span class="reel-tick-n"><?= str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) ?></span>
          <span class="reel-tick-bar" aria-hidden="true"></span>
        </button>
      <?php endforeach; ?>
    </div>

    <div class="reel" id="reel">
      <?php foreach ($featured as $i => $p):
        $num  = sprintf('00.%02d', $i + 1);
        $disc = strtoupper(implode(' + ', array_filter(array_map('trim', explode(',', (string) $p['disciplines'])))));
      ?>
        <article class="reel-item" data-reel="<?= $i ?>"
                 data-name="<?= e($p['client']) ?>" data-href="<?= e(url('/projects/' . $p['slug'])) ?>">
          <div class="reel-card">
            <div class="reel-depth">
              <div class="reel-frame">
                <span class="reel-idx"><span class="reel-idx-line"></span><?= $num ?></span>
                <a class="reel-shot" href="<?= e(url('/projects/' . $p['slug'])) ?>" aria-label="Open <?= e($p['client']) ?>">
                  <img class="reel-img" src="<?= e(url($p['cover'])) ?>"
                       alt="<?= e($p['client'] . ', ' . $p['title']) ?>"
                       <?= $i < 2 ? '' : 'loading="lazy"' ?> decoding="async">
                </a>
                <span class="reel-title-mask">
                  <a class="reel-title" href="<?= e(url('/projects/' . $p['slug'])) ?>"><?= e($p['client']) ?></a>
                </span>
              </div>
              <div class="reel-meta">
                <div class="reel-meta-col">
                  <span><?= e($p['title'] ?: $p['client']) ?></span>
                  <?php if (trim((string) $p['line']) !== ''): ?><span class="dim"><?= e($p['line']) ?></span><?php endif; ?>
                </div>
                <div class="reel-meta-col reel-meta-r">
                  <span><?= e($disc !== '' ? $disc : 'ART DIRECTION + DESIGN') ?></span>
                  <span class="dim"><?= e($p['year']) ?></span>
                </div>
              </div>
            </div>
          </div>
        </article>
      <?php endforeach; ?>
    </div>

    <!-- one fixed caption: the active project's name, rolled in and out in place -->
    <a class="reel-caption" id="reel-caption" href="#" aria-hidden="true">
      <span class="reel-caption-mask"><span class="reel-caption-line" id="reel-caption-line"></span></span>
    </a>

    <?php if ($more): ?>
      <div class="work-more">
        <a href="<?= e(url('/projects')) ?>" class="work-more-btn">
          <span>View all <?= $count ?> projects</span>
          <span class="work-more-x" aria-hidden="true">&rarr;</span>
        </a>
      </div>
    <?php endif; ?>
  </section>
  <?php endif; ?>

  <!-- ══ what we do all day ══ -->
  <section id="do" class="sec sec-do reveal-sec">
    <div class="sec-in">
      <header class="sec-head">
        <p class="sec-k">What we do all day</p>
        <h2 class="sec-h">Six trades, and the<br>reason they sit together.</h2>
        <p class="sec-lead">
          Hire six agencies and you spend half your week keeping them in step.
          Hire one room and the strategy, the words, the pictures and the media
          buy already agree — because the people making them share a wall.
        </p>
      </header>

      <!-- six trades, one room. Each panel is a wall; open one and the others
           step aside. -->
      <div class="rooms" id="rooms">
        <?php foreach ($services as $i => $s): $n = str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT); ?>
          <article class="room<?= $i === 0 ? ' is-open' : '' ?>" data-room="<?= $i ?>" tabindex="0">
            <span class="room-num"><?= $n ?></span>
            <span class="room-spine" aria-hidden="true"><?= e($s['k']) ?></span>
            <div class="room-body">
              <h3 class="room-k"><?= e($s['k']) ?></h3>
              <p class="room-t"><?= e($s['t']) ?></p>
              <p class="room-d"><?= e($s['d']) ?></p>
              <span class="room-ghost" aria-hidden="true"><?= $n ?></span>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- ══ straight answers ══ -->
  <section id="answers" class="sec sec-faq reveal-sec">
    <div class="sec-in faq-in">
      <header class="sec-head faq-head">
        <p class="sec-k">Straight answers</p>
        <h2 class="sec-h">The things you were<br>about to email us.</h2>
        <p class="sec-lead">No sales dance. Here is how it actually works.</p>
      </header>

      <div class="faq-list">
        <?php foreach ($faqs as $i => $f): ?>
          <details class="faq" <?= $i === 0 ? 'open' : '' ?>>
            <summary class="faq-q">
              <span><?= e($f['q']) ?></span>
              <span class="faq-mark" aria-hidden="true"></span>
            </summary>
            <div class="faq-a"><p><?= e($f['a']) ?></p></div>
          </details>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- ══ let's connect — the form unfolds from the button ══ -->
  <section id="say" class="sec sec-say reveal-sec">
    <div class="connect<?= ($sent || $err) ? ' is-open' : '' ?>" id="connect">
      <!-- resting face -->
      <div class="connect-face">
        <p class="connect-k">Got a project in mind?</p>
        <h2 class="connect-h">Let&rsquo;s connect</h2>
        <button type="button" class="connect-btn" id="connect-open" aria-label="Write a message">
          <span>Write a<br>message</span>
        </button>
      </div>

      <!-- the form that grows out of the button -->
      <form class="connect-form" method="post" action="<?= e(url('/contact.php')) ?>">
        <?= csrf_field() ?>
        <button type="button" class="connect-close" id="connect-close" aria-label="Close">&larr; back</button>
        <p class="connect-form-k">Tell us what&rsquo;s on your desk</p>

        <?php if ($sent): ?>
          <p class="say-note say-ok">Got it — thanks. We&rsquo;ll be in touch within a working day.</p>
        <?php elseif ($err): ?>
          <p class="say-note say-bad">Please add your name, a valid email and a short message.</p>
        <?php endif; ?>

        <div class="say-hp" aria-hidden="true">
          <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
        </div>

        <div class="say-row">
          <label class="say-line"><span class="say-n">01</span><span class="say-lab">My name is</span>
            <input type="text" name="name" required autocomplete="name" placeholder="Jordan Rivera"></label>
          <label class="say-line"><span class="say-n">02</span><span class="say-lab">Reach me at</span>
            <input type="email" name="email" required autocomplete="email" placeholder="you@company.com"></label>
        </div>

        <fieldset class="say-chips">
          <legend><span class="say-n">03</span><span class="say-lab">I need</span></legend>
          <div class="chips">
            <?php foreach ($trades as $t): ?>
              <label class="chip">
                <input type="checkbox" name="services[]" value="<?= e($t) ?>">
                <span><?= e($t) ?></span>
              </label>
            <?php endforeach; ?>
          </div>
        </fieldset>

        <label class="say-line say-line-full"><span class="say-n">04</span><span class="say-lab">Here&rsquo;s the gist</span>
          <textarea name="message" rows="2" required placeholder="A line or two about the project, the goal, and when you'd like it live."></textarea></label>

        <button type="submit" class="say-send"><span>Send the brief</span><span class="say-arrow" aria-hidden="true">&rarr;</span></button>
      </form>

      <!-- social bar -->
      <div class="connect-foot">
        <span>Feel free to reach us</span>
        <div class="connect-social">
          <a href="mailto:info@rapidsolutions.live">Email</a>
          <a href="#" rel="noopener">Instagram</a>
          <a href="#" rel="noopener">LinkedIn</a>
        </div>
      </div>
    </div>
  </section>

  <?php site_footer(); ?>
</main>
<?php foot_close('home.js'); ?>
