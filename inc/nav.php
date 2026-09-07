<?php require_once __DIR__ . '/helpers.php'; $cur = current_page(); ?>
<header class="nav" id="nav">
  <div class="nav-inner">
    <a class="nav-logo" href="<?= url('') ?>" aria-label="<?= e(SITE_NAME) ?> home">
      <span class="nav-logo-mark">E</span>
      <span class="nav-logo-word"><?= e(SITE_NAME) ?></span>
    </a>

    <button class="nav-burger" aria-label="Menu" aria-expanded="false">
      <span></span><span></span>
    </button>

    <nav class="nav-pill" aria-label="Primary">
      <?php foreach (nav_items() as $slug => [$label, $href]): ?>
        <a href="<?= e($href) ?>"<?= $cur === $slug ? ' class="is-active"' : '' ?>><?= e($label) ?></a>
      <?php endforeach; ?>
      <a class="nav-cta" href="<?= url('contact.php') ?>">Start your project</a>
    </nav>
  </div>
</header>
