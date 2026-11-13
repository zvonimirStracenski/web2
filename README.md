# XSS
## Objašnjenje
Korišten je pohranjeni XSS napad omogućen time što aplikacija ne kodira korisničke komentare.
Napadač unosi komentar:

"<script>fetch("/comments", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ comment: document.cookie }) });</script>"

Time prisiljava sve korisnike na stranici da pri učitavanju tog komentara izvedu javascript kod koji unosi javno vidljivi komentar koji sadrži njihove kolačiće, pa moguće i session id.
Pritiskom gumba Ukloni sigurni prikaz (unescape) isključuje se kodiranje komentara, a ponovnim pritiskom na gumb ili ponovnim učitavanjem stranice korisnikovi cookie-ji prikazuju se kao javni komentar.


# Loša kontrola pristupa
## Objašnjenje
U aplikaciji postoje dvije vrste korisnika user i admin.
Svi imaju pristup javnoj podstranici /user, no samo admin ima pistup stranici /admin.

Korisnik (user) se može ulogirati koristeći ime "user" i lozinku "user_pass".
Administrator (admin) se može ulogirati koristeći ime "admin" i lozinku "admin_pass".

Nakon ulogiranja napadač koji ima ulogu user vidi da se u url-u pojavljuje riječ user koju mijenja u admin kako bi dobio dodatne zabranjene ovlasti na stranici.
Pri posjetu podstranici /admin i ostalim podstranicama koje trebaju biti dostupne samo određenim korisnicima potrebna je provjera ovlasti.
Pritiskom na tipku "Uključi pogrešnu provjeru ovlasti" isključuje se provjera ovlasti pri posjetu stranice. Tada napadač koji riječ /user u URL-u promjeni u /admin ima pristup zaštićenoj podstranici.
