<?php
/*
  Puts the six sample projects in, with their pictures, so there is something to
  look at before you have added your own. Safe to run more than once — it skips
  a project whose slug is already there.

  Run it from a terminal:

      php sql/seed.php

  or, if you would rather not open one, sign in at /admin/ first and then visit
  this file in the browser. It is behind the same login as the admin, so it can
  be reached over the web without being something a stranger can set off.
*/
declare(strict_types=1);
require_once __DIR__ . '/../inc/db.php';
require_once __DIR__ . '/../inc/helpers.php';

$cli = PHP_SAPI === 'cli';
if (!$cli) {
    require_once __DIR__ . '/../inc/auth.php';
    header('Content-Type: text/plain; charset=utf-8');
    if (!is_admin()) {
        http_response_code(403);
        exit("Sign in at /admin/ first, then reload this page.\n");
    }
}

$seed = require __DIR__ . '/seed_data.php';

$ins = db()->prepare('INSERT INTO projects (slug, ref, client, title, line, disciplines, year, cover, brief, did, results, status, sort)
                      VALUES (?,?,?,?,?,?,?,?,?,?,?,\'live\',?)');
$insM = db()->prepare('INSERT INTO media (project_id, kind, src, cap, sort) VALUES (?,?,?,?,?)');
$added = 0;

foreach ($seed as $k => $s) {
    [$slug,$ref,$client,$title,$line,$disc,$year,$cover,$brief,$did,$res,$more] = $s;
    $chk = db()->prepare('SELECT id FROM projects WHERE slug = ?');
    $chk->execute([$slug]);
    if ($chk->fetch()) { echo "skip  $slug (already there)\n"; continue; }

    $ins->execute([$slug,$ref,$client,$title,$line,$disc,$year,"/uploads/seed/$cover.webp",$brief,$did,$res,$k*10]);
    $pid = (int) db()->lastInsertId();
    foreach ($more as $i => $m) {
        $insM->execute([$pid, 'image', "/uploads/seed/$m.webp", '', ($i + 1) * 10]);
    }
    echo "added $slug\n";
    $added++;
}
echo "\n$added project(s) added.\n";
if (!$cli) { echo "\nDone. Go back to /admin/ to see them.\n"; }
