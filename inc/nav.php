<?php require_once __DIR__ . '/helpers.php'; $cur = current_page(); $navlight = $navlight ?? false; ?>
<!-- rotating badge = home -->
<a class="badge" href="<?= url('') ?>" aria-label="<?= e(SITE_NAME) ?> home">
  <svg class="ring" viewBox="0 0 100 100">
    <defs><path id="badgeArc" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"/></defs>
    <text font-size="7"><textPath href="#badgeArc" startOffset="0">EXCELLO · MOUNT LAVINIA · </textPath></text>
  </svg>
  <span class="mark">E</span>
</a>

<!-- scroll odometer rail -->
<div class="rail" aria-hidden="true">
  <span class="odo" id="odo">00</span>
  <span class="tick"></span>
  <span class="word">Scroll</span>
</div>

<header class="nav<?= $navlight ? ' light-nav' : '' ?>" id="nav">
  <div class="nav-inner">
    <nav class="nav-links" aria-label="Primary">
      <?php foreach (nav_items() as $slug => [$label, $href]) { if ($slug === 'index') continue; ?>
        <a href="<?= e($href) ?>"<?= $cur === $slug ? ' class="is-active"' : '' ?>><?= e($label) ?></a>
      <?php } ?>
      <a class="nav-cta" href="<?= url('contact.php') ?>">Start your project</a>
    </nav>
    <button class="nav-burger" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>
  </div>
</header>
