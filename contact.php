<?php
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/helpers.php';
session_start();

$sent = false; $error = '';
$about = isset($_GET['about']) ? trim($_GET['about']) : '';
if (!isset($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals($_SESSION['csrf'], $_POST['csrf'] ?? '')) {
        $error = 'Your session expired. Please send the form again.';
    } else {
        $name = trim($_POST['name'] ?? ''); $email = trim($_POST['email'] ?? '');
        $phone = trim($_POST['phone'] ?? ''); $plot = trim($_POST['plot'] ?? ''); $msg = trim($_POST['message'] ?? '');
        if ($name === '' || ($email === '' && $phone === '')) {
            $error = 'Please add your name and either an email or a phone number.';
        } elseif ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'That email address does not look right.';
        } else {
            db()->prepare('INSERT INTO enquiries (name,email,phone,plot,message) VALUES (?,?,?,?,?)')->execute([$name,$email,$phone,$plot,$msg]);
            $body = "New enquiry from the website\n\nName: $name\nEmail: $email\nPhone: $phone\nPlot / project: $plot\n\n$msg\n";
            $headers = 'From: website@excello.lk' . "\r\n" . ($email !== '' ? 'Reply-To: ' . $email . "\r\n" : '');
            @mail(SALES_EMAIL, 'Website enquiry — ' . $name, $body, $headers);
            $sent = true;
        }
    }
}

$page_title = 'Contact';
$page_desc  = 'Have a plot, or looking for one? Tell us about your project.';
require __DIR__ . '/inc/head.php';
require __DIR__ . '/inc/nav.php';
?>
<main>
  <section class="page-hero panel-sky">
    <?= flower('tr') ?>
    <div class="wrap">
      <p class="eyebrow rv rv-up">Contact</p>
      <h1 class="display word-rv" style="max-width:16ch">Have a plot, or looking for one?</h1>
      <p class="lead muted rv rv-up" style="max-width:52ch;margin-top:1.2rem">Tell us where you are in the journey. We answer every message ourselves, from Sales in Mount Lavinia.</p>
    </div>
  </section>

  <section class="section panel-cream">
    <div class="wrap">
      <div class="contact-grid">
        <div class="rv rv-up">
          <?php if ($sent): ?><div class="alert alert-ok">Thank you. Your enquiry is with our Sales team and we will be in touch shortly.</div>
          <?php elseif ($error): ?><div class="alert alert-err"><?= e($error) ?></div><?php endif; ?>
          <form class="form" method="post" action="<?= url('contact.php') ?>">
            <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
            <div class="form-row">
              <div class="field"><label for="f-name">Name</label><input id="f-name" name="name" required value="<?= e($_POST['name'] ?? '') ?>"></div>
              <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" value="<?= e($_POST['email'] ?? '') ?>"></div>
            </div>
            <div class="form-row">
              <div class="field"><label for="f-phone">Phone</label><input id="f-phone" name="phone" value="<?= e($_POST['phone'] ?? '') ?>"></div>
              <div class="field"><label for="f-plot">Plot / project</label><input id="f-plot" name="plot" placeholder="e.g. beachfront plot in Ahangama" value="<?= e($_POST['plot'] ?? $about) ?>"></div>
            </div>
            <div class="field"><label for="f-msg">Message</label><textarea id="f-msg" name="message" placeholder="Tell us what you are planning."><?= e($_POST['message'] ?? '') ?></textarea></div>
            <div style="margin-top:1.4rem"><button class="btn btn-solid" type="submit">Send enquiry</button></div>
          </form>
        </div>
        <aside class="rv rv-up">
          <div class="contact-detail">
            <div><span class="k">Studio</span><a href="https://maps.google.com/?q=<?= rawurlencode(SITE_ADDRESS) ?>" target="_blank" rel="noopener"><?= e(SITE_ADDRESS) ?></a></div>
            <div><span class="k">Phone</span><a href="tel:<?= e(SITE_PHONE_RAW) ?>"><?= e(SITE_PHONE) ?></a></div>
            <div><span class="k">Sales</span><a href="mailto:<?= e(SALES_EMAIL) ?>"><?= e(SALES_EMAIL) ?></a></div>
            <div><span class="k">WhatsApp</span><a href="https://wa.me/<?= e(SITE_PHONE_RAW) ?>" target="_blank" rel="noopener">Message us on WhatsApp</a></div>
          </div>
          <div class="map"><iframe title="Map to Excello" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=<?= rawurlencode(SITE_ADDRESS . ', Sri Lanka') ?>&output=embed"></iframe></div>
        </aside>
      </div>
    </div>
  </section>
</main>
<?php require __DIR__ . '/inc/footer.php'; ?>
