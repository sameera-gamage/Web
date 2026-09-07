<?php
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/helpers.php';

$articles = db()->query("SELECT * FROM articles WHERE status='live' ORDER BY published_at DESC, id DESC")->fetchAll();
$feature = $articles[0] ?? null;
$rest = array_slice($articles, 1);

$page_title = 'Insights';
$page_desc  = 'Articles, press, and notes from the studio, plus a construction cost calculator.';
require __DIR__ . '/inc/head.php';
require __DIR__ . '/inc/nav.php';
?>
<main>
  <section class="page-hero">
    <div class="wrap">
      <p class="eyebrow reveal">Insights</p>
      <h1 class="display reveal d1">Notes from the studio.</h1>
      <p class="lead muted reveal d2" style="max-width:52ch;margin-top:1rem">Guides, press, and the thinking behind the way we build. Plus a quick calculator to size a project before you call.</p>
    </div>
  </section>

  <?php if ($feature): ?>
  <section class="section" style="padding-top:0">
    <div class="wrap">
      <article class="feature reveal">
        <div class="feature-media"><img data-parallax="0.08" src="<?= cover_src($feature['cover']) ?>" alt="<?= e($feature['title']) ?>"></div>
        <div>
          <span class="article-cat"><?= e($feature['category']) ?></span>
          <h2 style="margin:.5rem 0"><?= e($feature['title']) ?></h2>
          <p class="lead muted"><?= e($feature['excerpt']) ?></p>
          <p class="date" style="margin-top:1rem"><?= e(date('j M Y', strtotime($feature['published_at'] ?: $feature['created_at']))) ?></p>
        </div>
      </article>
    </div>
  </section>
  <?php endif; ?>

  <!-- ===== Construction Cost Calculator ===== -->
  <section class="band alt section" id="calculator">
    <div class="wrap">
      <div class="section-head reveal">
        <p class="eyebrow">Tools</p>
        <h2>Construction cost calculator.</h2>
        <p class="lead muted">An indicative range from a rate table our team keeps current. For an exact figure, we quote after we see the plot.</p>
      </div>

      <div class="calc reveal" id="calc" data-rates='<?= e(json_encode($COST_RATES)) ?>'>
        <div class="calc-grid">
          <div class="field range-wrap">
            <label for="calc-area">Built area — <span id="calc-area-out">2,500 sq ft</span></label>
            <input type="range" id="calc-area" min="500" max="12000" step="100" value="2500">
          </div>
          <div class="field">
            <label for="calc-floors">Floors</label>
            <select id="calc-floors">
              <option value="1">Single storey</option>
              <option value="2" selected>Two storeys</option>
              <option value="3">Three storeys</option>
            </select>
          </div>
          <div class="field">
            <label for="calc-tier">Finish level</label>
            <select id="calc-tier">
              <?php foreach ($COST_RATES as $k => $r): ?>
                <option value="<?= e($k) ?>"<?= $k === 'premium' ? ' selected' : '' ?>><?= e($r['label']) ?> — LKR <?= number_format($r['rate']) ?>/sq ft</option>
              <?php endforeach; ?>
            </select>
          </div>
          <div class="field" style="align-self:end">
            <a class="btn" href="<?= url('contact.php') ?>?about=<?= rawurlencode('Cost estimate') ?>">Get an exact quote</a>
          </div>
        </div>
        <div class="calc-out">
          <div>
            <p class="calc-note">Indicative build cost, excluding land, statutory fees, and furniture.</p>
          </div>
          <div class="calc-figure" id="calc-figure">LKR —</div>
        </div>
      </div>
    </div>
  </section>

  <?php if ($rest): ?>
  <section class="section">
    <div class="wrap">
      <div class="section-head reveal"><p class="eyebrow">More reading</p><h2>Articles &amp; press.</h2></div>
      <div class="article-grid">
        <?php foreach ($rest as $i => $a): ?>
          <a class="article reveal d<?= ($i % 3) + 1 ?>" href="#">
            <div class="article-media"><img src="<?= cover_src($a['cover']) ?>" alt="<?= e($a['title']) ?>" loading="lazy"></div>
            <span class="article-cat"><?= e($a['category']) ?></span>
            <h3><?= e($a['title']) ?></h3>
            <p class="muted" style="font-size:.95rem"><?= e($a['excerpt']) ?></p>
            <p class="date"><?= e(date('j M Y', strtotime($a['published_at'] ?: $a['created_at']))) ?></p>
          </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
  <?php endif; ?>
</main>
<?php require __DIR__ . '/inc/footer.php'; ?>
