# RapidStudio

A two-page site — a scroll-driven hero and a project roll — with a small admin
behind it so you can add work yourself. Plain PHP and MySQL, so it runs on XAMPP
with nothing else installed.

- `/` — the hero. The camera clip is scrubbed by your scroll rather than played,
  and the aperture opens into the way through to the work.
- `/projects` — the roll. Hovering the marks on the right moves through it;
  clicking a picture opens that project.
- `/projects/<name>` — one project: the picture holds the left, everything you
  wrote about it runs down the right, and its own photos and clips follow.
- `/admin/` — yours. Add, edit, order, publish and delete projects, and upload
  their pictures and clips.

---

## Setting it up on XAMPP

**1. Put the folder in place.** Copy this whole folder into `htdocs`, so you end
up with `C:\xampp\htdocs\rapidstudio`. Start **Apache** and **MySQL** from the
XAMPP control panel.

**2. Make the database.** Open <http://localhost/phpmyadmin>, click **SQL**, and
paste in the contents of `sql/schema.sql`. That creates the `rapidstudio`
database and its two tables.

**3. Point the site at it.** Open `inc/config.php`. XAMPP's MySQL normally has
the user `root` with an empty password, which is what the file already says, so
usually there is nothing to change. If the site sits in a subfolder rather than
at the domain root, set `base`:

```php
'base' => '/rapidstudio',
```

**4. Raise the upload limit.** This matters if you want to upload clips —
XAMPP ships with a 2 MB cap, which almost any video will exceed. In the XAMPP
panel click **Config → PHP (php.ini)** next to Apache, find these two lines and
raise them, then restart Apache:

```ini
upload_max_filesize = 64M
post_max_size = 72M
```

**5. Open it.** <http://localhost/rapidstudio/> — or whatever folder you used.

**6. Sign in and change the password.** Go to `/admin/`, sign in with
`admin` / `changeme`, and then change it — see below. Do this before the site is
reachable by anyone else.

Want something to look at first? While signed in, visit `sql/seed.php`
(e.g. <http://localhost/rapidstudio/sql/seed.php>) to load six sample projects.
Delete them from the admin when you're done with them — deleting a project takes
its pictures with it.

---

## Changing the admin password

There is no password field in the admin on purpose — a single stored hash is
harder to get wrong than a user table. To change it, run this in a terminal:

```
php -r "echo password_hash('the password you want', PASSWORD_DEFAULT), PHP_EOL;"
```

Paste the result into `inc/config.php` as `admin_hash`. You can change
`admin_user` in the same place.

> If you'd rather keep your password and database details out of the folder you
> copy around, put them in `inc/config.local.php` instead — it returns the same
> array, overrides `config.php`, and is never committed.

---

## Adding a project

`/admin/` → **Add a project**. Client name and a cover picture are the only two
things required; the cover is what the roll shows.

- **Reference** is the small number beside the name — `001`, `002`.
- **Web address** is optional. Leave it blank and one is made from the client
  name (`Marrow & Co` → `marrow-and-co`).
- **What we did** takes one line per point.
- **Where it landed** takes one line per figure, written as `figure | label`:

  ```
  9 wks | brief to launch
  1,240 | first-month orders
  ```

- **Status** starts at *Draft*. A draft is invisible to everyone but you — it is
  not in the roll and its page returns 404. Switch it to *Live* when it's ready.

Save it, and the **Pictures and clips** section appears underneath. Upload JPG,
PNG or WebP images and MP4 or WebM clips; caption and reorder them there.
Deleting a project deletes its files from disk too.

---

## What is where

```
index.php        the hero page
projects.php     the roll
project.php      one project
admin/           the admin — login, list, add/edit
inc/             config, database, helpers, login, uploads
sql/schema.sql   the tables
sql/seed.php     six sample projects, run once from the browser
assets/          built CSS and JS, plus the hero footage — do not edit by hand
src/             the sources those are built from
uploads/         everything you upload
```

### Rebuilding the CSS and JS

You only need this if you want to change the design. The built files in
`assets/` are committed, so the site runs without Node.

```
npm install
node build.mjs
```

---

## A few notes on how it is put together

**The hero needs byte-range requests.** It is a real video seeked frame by
frame, and a browser will not seek a file the server refuses to serve in parts —
`video.seekable` comes back empty and the camera silently freezes on the first
frame. Apache does this correctly out of the box, so on XAMPP there is nothing to
do. It is worth knowing if you ever move the site somewhere that proxies or
rewrites the video.

If you want to run it without Apache, use the bundled router, which carries the
same behaviour:

```
php -S localhost:8080 router.php
```

**Uploads cannot execute.** The type of every uploaded file is read from its own
bytes rather than trusted from its name, and only images and MP4/WebM get
through — a PHP script renamed to `.jpg` is refused. The stored filename is
generated, so nothing you type ever becomes a path, and `uploads/.htaccess` turns
off script handling in that folder as a second line of defence.

**Every admin form carries a CSRF token**, the session id is regenerated on
login, and a wrong username and a wrong password fail identically so neither can
be used to discover the other.

**Reduced motion is respected.** With it on, the scroll rig steps aside and every
page lays out as an ordinary scrolling document.
