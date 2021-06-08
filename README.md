# Tehnologii_Web 
Repo pentru proiectul UnSt (Universal Storage Tool)
---------------------------------------------------------------------------

Requirements for UnSt (Universal Storage Tool)
`````````````````````````````````````````````````````
Pe baza unui API REST ori GraphQL propriu, să se realizeze un instrument care abstractizează operațiile uzuale cu fișiere de mari dimensiuni, stocându-le – eventual,
fragmentat și/sau redundant – via servicii disponibile “în nori” precum Box, Dropbox, Google Drive, Microsoft OneDrive și altele. 
Soluția implementată va recurge la minim 3. Se va oferi și posibilitatea compresiei resurselor textuale, folosind algoritmi consacrați precum bzip2, gzip sau zip. 
Evident, se va furniza suport și pentru recompunerea resurselor și preluarea sigură și eficientă a acestora. Autentificarea si autorizarea vor recurge la OAuth. 
Resurse suplimentare: Storage APIs and Mashups.

Un utilizator va putea să își facă cont într-o aplicație web ce utilizează serviciul web de mai sus și va putea să își introducă credențiale pentru diversele "drive"-uri. 
Aplicația îi va arăta cât spațiu mai are disponibil în fiecare dintre mediile de stocare în cloud și cât spațiu liber mai are în total (suma spațiilor din fiecare drive). 
La uploadarea unui fișier, se va face automat împărțirea sa în chunk-uri și memorarea (BD) a locației în care se află fiecare porțiune a fișierului pentru a putea fi reconstruit.

Lista tuturor proiectelor poate fi vazuta la: https://profs.info.uaic.ro/~vcosmin/proiectetw
