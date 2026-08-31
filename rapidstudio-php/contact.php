<?php
declare(strict_types=1);
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/helpers.php';

/*
  The contact form handler.

  Enquiries are stored in the `leads` table (created on first use, so nobody
  has to touch SQL) and can be read back in the admin. A hidden "website"
  field is a honeypot: real people never see it, bots fill everything. The
  chosen services are stored in the `budget` column so no schema change is
  needed — the admin just shows them as tags.
*/

function back(string $flag): void
{
    header('Location: ' . url('/#say') . '?' . $flag . '=1');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . url('/'));
    exit;
}

check_csrf();

// honeypot — a filled "website" means a bot; pretend it worked and drop it
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    back('sent');
}

$name    = trim((string) ($_POST['name'] ?? ''));
$email   = trim((string) ($_POST['email'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

// which trades they ticked
$allowed = ['Search', 'Paid media', 'Social', 'Brand', 'Film', 'Photography'];
$picked = array_values(array_intersect($allowed, (array) ($_POST['services'] ?? [])));
$services = implode(', ', $picked);

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $message === '') {
    back('err');
}

ensure_leads();

$st = db()->prepare('INSERT INTO leads (name, email, budget, message) VALUES (?, ?, ?, ?)');
$st->execute([
    mb_substr($name, 0, 160),
    mb_substr($email, 0, 200),
    mb_substr($services, 0, 200),
    mb_substr($message, 0, 4000),
]);

@mail(
    'info@rapidsolutions.live',
    'New enquiry from ' . $name,
    "Name: $name\nEmail: $email\nServices: $services\n\n$message",
    'From: RapidStudio site <info@rapidsolutions.live>' . "\r\n" . 'Reply-To: ' . $email
);

back('sent');
