<?php
declare(strict_types=1);
require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/helpers.php';

/*
  The contact form handler.

  Enquiries are stored in the `leads` table (created on first use, so nobody
  has to touch SQL) and can be read back in the admin. A hidden "company"
  field is a honeypot: real people never see it, bots fill everything.
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

// honeypot — a filled "company" means a bot; pretend it worked and drop it
if (trim((string) ($_POST['company'] ?? '')) !== '') {
    back('sent');
}

$name    = trim((string) ($_POST['name'] ?? ''));
$email   = trim((string) ($_POST['email'] ?? ''));
$budget  = trim((string) ($_POST['budget'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $message === '') {
    back('err');
}

ensure_leads();

$st = db()->prepare('INSERT INTO leads (name, email, budget, message) VALUES (?, ?, ?, ?)');
$st->execute([
    mb_substr($name, 0, 160),
    mb_substr($email, 0, 200),
    mb_substr($budget, 0, 60),
    mb_substr($message, 0, 4000),
]);

// best-effort email; XAMPP often has no mailer, so a failure here is not an
// error the visitor should ever see — the enquiry is already saved
@mail(
    'info@rapidsolutions.live',
    'New enquiry from ' . $name,
    "Name: $name\nEmail: $email\nBudget: $budget\n\n$message",
    'From: RapidStudio site <info@rapidsolutions.live>' . "\r\n" . 'Reply-To: ' . $email
);

back('sent');
