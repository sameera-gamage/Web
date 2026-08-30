<?php
declare(strict_types=1);
// The work now lives on the home page. Keep this URL alive by sending it there.
require_once __DIR__ . '/inc/helpers.php';
header('Location: ' . url('/#work'), true, 301);
exit;
