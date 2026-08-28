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

$seed = [
  ['marrow-and-co','001','Marrow & Co','Launch, start to finish','A paper mill going direct','Brand, Social, Photography','2025','w1',
   'A hundred-year-old mill had been selling through three wholesalers and wanted its own front door. No brand to speak of, no photography, no list.',
   "Identity, palette and the type system\nA stills library, shot over two days\nLaunch campaign across paid social and search",
   "9 wks | brief to launch\n1,240 | first-month orders\n£0 | left on wholesale margin", ['w5','w3']],
  ['ridgeway-tools','002','Ridgeway Tools','A film for a founder','Ninety seconds in the workshop','Film, Direction','2025','w2',
   'The founder could hold a room and could not hold a camera. Everything on the site had been written by someone who had never used the product.',
   "Two days on location in the workshop\nA ninety-second cut and six verticals\nGrade matched to the existing brand",
   "92s | the main cut\n6 | verticals, one shoot\n3.1× | time on the product page", ['w6','w4']],
  ['halden-home','003','Halden Home','Spend that paid back','Four platforms down to two','Paid media, Analytics','2024','w3',
   'Eleven thousand a month going out across four platforms, and nobody in the building could say which of them was earning.',
   "Rebuilt tracking so the numbers could be trusted\nCut two platforms in the first fortnight\nRewrote the creative around what survived",
   "−38% | spend\n+21% | revenue\n2 of 4 | platforms kept", ['w1','w6']],
  ['peel-and-stone','004','Peel & Stone','Ranking for the hard one','Page four to position three','Search, Content','2024','w4',
   'One search term the whole business depended on, and page four for two years running.',
   "Technical audit and a rebuild of the templates\nEleven pages written properly, not spun\nCleared a decade of redirect debt",
   "#3 | from page four\n7 mo | to get there\n+64% | non-brand traffic", ['w2','w5']],
  ['ambit-skincare','005','Ambit Skincare','Shelf to screen','Forty-two SKUs, one setup','Photography, Retouch','2024','w5',
   'Product frames shot on a phone against a bedsheet. The listing was fine. Nobody was buying.',
   "Studio days for forty-two SKUs\nOne lighting setup, held across the range\nA retouch spec the client can hand to anyone",
   "42 | SKUs\n+28% | conversion\n1 | setup, reused since", ['w4','w1']],
  ['the-fold-bakery','006','The Fold Bakery','A year of always-on','Fifty-two weeks without a gap','Social, Content','2023','w6',
   'Three sites, one oven, and a feed that went quiet every time it got busy.',
   "A weekly shoot rhythm the kitchen could actually keep\nTwelve months planned a quarter ahead\nCommunity handled by us, not a bot",
   "52 wks | unbroken\n×4.6 | followers\n18% | of covers from the feed", ['w3','w2']],
];

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
