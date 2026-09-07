<?php require_once __DIR__ . '/helpers.php'; ?>
<footer class="footer" id="footer">
  <div class="footer-cta reveal">
    <p class="eyebrow">Ready when you are</p>
    <h2 class="footer-head">Start your project.</h2>
    <p class="footer-sub">One team, from the land to the keys. Tell us about your plot or your idea.</p>
    <a class="btn btn-lg" href="<?= url('contact.php') ?>">Start your project</a>
  </div>

  <div class="footer-grid">
    <div class="footer-col">
      <div class="nav-logo">
        <span class="nav-logo-mark">E</span>
        <span class="nav-logo-word"><?= e(SITE_NAME) ?></span>
      </div>
      <p class="footer-tag"><?= e(SITE_TAGLINE) ?></p>
    </div>

    <div class="footer-col">
      <p class="footer-label">Pages</p>
      <?php foreach (nav_items() as [$label, $href]): ?>
        <a href="<?= e($href) ?>"><?= e($label) ?></a>
      <?php endforeach; ?>
    </div>

    <div class="footer-col">
      <p class="footer-label">Studio</p>
      <a href="https://maps.google.com/?q=<?= rawurlencode(SITE_ADDRESS) ?>" target="_blank" rel="noopener"><?= e(SITE_ADDRESS) ?></a>
      <a href="tel:<?= e(SITE_PHONE_RAW) ?>"><?= e(SITE_PHONE) ?></a>
      <a href="mailto:<?= e(SALES_EMAIL) ?>"><?= e(SALES_EMAIL) ?></a>
    </div>

    <div class="footer-col">
      <p class="footer-label">Connect</p>
      <a href="https://wa.me/<?= e(SITE_PHONE_RAW) ?>" target="_blank" rel="noopener">WhatsApp</a>
      <a href="tel:<?= e(SITE_PHONE_RAW) ?>">Call sales</a>
      <a href="#" target="_blank" rel="noopener">Instagram</a>
      <a href="#" target="_blank" rel="noopener">LinkedIn</a>
    </div>
  </div>

  <div class="footer-base">
    <span>© <?= date('Y') ?> <?= e(SITE_NAME) ?>. Mount Lavinia, Sri Lanka.</span>
    <span><a href="<?= url('admin/') ?>">Admin</a></span>
  </div>
</footer>

<a class="fab fab-wa" href="https://wa.me/<?= e(SITE_PHONE_RAW) ?>" target="_blank" rel="noopener" aria-label="WhatsApp">
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.7-3.3-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.8-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15l-1.3 4.7L7 20.4A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>
</a>

<script src="<?= asset('js/lenis.min.js') ?>"></script>
<script src="<?= asset('js/app.js') ?>"></script>
</body>
</html>
