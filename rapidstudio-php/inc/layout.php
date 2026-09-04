<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers.php';

function head_open(string $title, string $description = '', string $here = 'index'): void
{
    $b = base_url();
    ?><!doctype html>
<html lang="en" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($title) ?></title>
  <meta name="description" content="<?= e($description) ?>">
  <meta name="theme-color" content="#0A0A0A">
  <meta name="color-scheme" content="dark">
  <meta property="og:title" content="<?= e($title) ?>">
  <meta property="og:description" content="<?= e($description) ?>">
  <meta property="og:type" content="website">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230A0A0A'/%3E%3Ccircle cx='16' cy='16' r='9' fill='none' stroke='%23FF5A1F' stroke-width='2.6'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%23FF9142'/%3E%3C/svg%3E">
  <link rel="stylesheet" href="<?= e($b) ?>/assets/fonts/fonts.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&display=swap">
  <link rel="stylesheet" href="<?= e(asset_url('/assets/site.css')) ?>">
  <script>document.documentElement.classList.remove('no-js');</script>
</head>
<body class="bg-ink text-chalk">
  <a href="#main" class="skip">Skip to content</a>
  <?php if ($here !== 'index'): ?>
  <div class="curtain" id="curtain" aria-hidden="true">
    <span class="curtain-l"></span>
    <span class="curtain-dot"></span>
    <span class="curtain-r"></span>
  </div>
  <?php endif; ?>
  <div class="marks" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<?php
    nav_bar($here);
}

function nav_bar(string $here = 'index'): void
{
    $links = [
        ['k' => 'index',    'label' => 'Studio',  'href' => url('/')],
        ['k' => 'work',     'label' => 'Work',    'href' => url('/#work')],
        ['k' => 'answers',  'label' => 'Answers', 'href' => url('/#answers')],
    ];
    ?>
  <header class="nav" id="nav">
    <div class="nav-in">
      <a href="<?= e(url('/')) ?>" class="nav-mark" aria-label="RapidStudio, home">
        <span class="nav-dot" aria-hidden="true"></span>
        <span>Rapid<span class="nav-sep">&bull;</span>Studio</span>
      </a>
      <button class="nav-burger" id="nav-burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav-pill">
        <span></span><span></span>
      </button>
      <nav class="nav-pill" id="nav-pill" aria-label="Primary">
        <?php foreach ($links as $i => $l): ?>
          <a href="<?= e($l['href']) ?>"
             class="nav-link<?= $here === $l['k'] ? ' is-here' : '' ?>"
             <?= $here === $l['k'] ? 'aria-current="page"' : '' ?>>
            <span class="nav-num"><?= str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) ?></span>
            <span><?= e($l['label']) ?></span>
          </a>
        <?php endforeach; ?>
        <a href="<?= e(url('/#say')) ?>" class="nav-cta">Start a brief</a>
      </nav>
    </div>
  </header>
  <script>
    (function () {
      var nav = document.getElementById('nav'),
          burger = document.getElementById('nav-burger'),
          pill = document.getElementById('nav-pill');
      if (!nav || !burger || !pill) return;
      function set(open) {
        nav.classList.toggle('nav-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      burger.addEventListener('click', function () { set(!nav.classList.contains('nav-open')); });
      // a tap on any menu item closes the sheet
      pill.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
    })();
  </script>
<?php
}

function site_footer(): void
{
    ?>
  <footer class="foot">
    <div class="foot-tape-wrap" aria-hidden="true">
      <div class="foot-tape">
        <span>Strategy</span><span class="foot-sep">&bull;</span>
        <span>Design</span><span class="foot-sep">&bull;</span>
        <span>Development</span><span class="foot-sep">&bull;</span>
        <span>Paid Media</span><span class="foot-sep">&bull;</span>
        <span>Film</span><span class="foot-sep">&bull;</span>
        <span>Photography</span><span class="foot-sep">&bull;</span>
        <span>Strategy</span><span class="foot-sep">&bull;</span>
        <span>Design</span><span class="foot-sep">&bull;</span>
        <span>Development</span><span class="foot-sep">&bull;</span>
        <span>Paid Media</span><span class="foot-sep">&bull;</span>
        <span>Film</span><span class="foot-sep">&bull;</span>
        <span>Photography</span><span class="foot-sep">&bull;</span>
      </div>
    </div>
    <div class="foot-body">
      <p class="foot-k">Got a project in mind?</p>
      <h2 class="foot-h">Let&rsquo;s build<br>something great.</h2>
      <a href="mailto:info@rapidsolutions.live" class="foot-mail">
        <span>info@rapidsolutions.live</span>
        <span class="foot-arrow" aria-hidden="true">&rarr;</span>
      </a>
    </div>
    <div class="foot-bar">
      <span>&copy; <?= date('Y') ?> RapidStudio</span>
      <span>Built in-house</span>
    </div>
  </footer>
<?php
}

function foot_close(string $script = ''): void
{
    $b = base_url();
    ?>
  <script>
    (function(){var c=document.getElementById('curtain');if(!c)return;
    /* Chrome/Edge get the smooth shrink/expand view transition instead, so the
       curtain would just double it — only run it where transitions are absent */
    if('startViewTransition' in document){c.remove();return;}
    requestAnimationFrame(function(){c.classList.add('open');
    setTimeout(function(){c.remove()},900)});})();
  </script>
<?php
    if ($script !== '') {
        echo '  <script type="module" src="' . e(asset_url('/assets/' . $script)) . '"></script>' . "\n";
    }
    echo "</body>\n</html>\n";
}
