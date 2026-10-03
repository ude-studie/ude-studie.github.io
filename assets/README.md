# Bilder

Jede Bildfläche in den nachgestellten Screens hat eine Kennung (`data-asset`). Liegt in diesem Ordner eine Datei mit genau diesem Namen (`<kennung>.jpg` oder `<kennung>.png`), wird sie gezeigt; sonst erscheint der Farbverlauf aus `content.js` (Abschnitt `assets`). Am Code muss dafür nichts geändert werden.

- Dateiname klein, genau wie unten. Bei `.jpg` und `.png` gleichzeitig gewinnt `.jpg`.
- Das Bild wird auf die Fläche zugeschnitten: Die Mitte bleibt sichtbar, die Ränder werden bei Bedarf abgeschnitten.
- Videos werden als Standbild mit langsamem Zoom gezeigt (15 Sekunden hin und zurück).
- Nur selbst erstellte oder frei lizenzierte Bilder, keine echten Beiträge, Konten oder Logos, keine erkennbaren Gesichter in Nahaufnahme.
- Unter 200 KB je Bild halten, sonst lädt die Schulung am Handy langsam.

## Eingebaute Bilder und Lizenzen

Alle Bilder stammen von Wikimedia Commons und stehen unter **CC0 1.0** (gemeinfrei, keine Namensnennung nötig). Heruntergeladen am 02.10.2026 in 960 px Breite, zugeschnitten und neu komprimiert.

| Datei | Wo | Format | Quelle (Commons-Seite) |
|---|---|---|---|
| `video-jonas-lauf.jpg` | Muster 1, Beitrag 40 (@lauf.mit.jonas) | 720 × 1280 | [Bike path running along the Los Angeles River in Reseda, Los Angeles (Tampa Ave).jpg](https://commons.wikimedia.org/wiki/File:Bike_path_running_along_the_Los_Angeles_River_in_Reseda,_Los_Angeles_(Tampa_Ave).jpg) |
| `video-mia-pasta.jpg` | Muster 1, Beitrag 41; Muster 4, nächstes Video (@kochen.mit.mia) | 720 × 1280 | [Sour pasta with tomatoes and spinach.jpg](https://commons.wikimedia.org/wiki/File:Sour_pasta_with_tomatoes_and_spinach.jpg) |
| `video-weiter.jpg` | Muster 1, Anschnitt von Beitrag 42 | 540 × 960 | [A bench on a cool path (50680358257).jpg](https://commons.wikimedia.org/wiki/File:A_bench_on_a_cool_path_(50680358257).jpg) |
| `video-tom-lissabon.jpg` | Muster 4, erstes Video (@tom.reist); Muster 5, Reel hinter den Kommentaren | 720 × 1280 | [Tram in Lisbon (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Tram_in_Lisbon_(Unsplash).jpg) |
| `foto-tom-lissabon.jpg` | Instagram-Beitrag tom.reist (Muster 2, 3, 8, Wiederfinden 1) | 900 × 600 | [The historical tram line in Lisbon. (52329191119).jpg](https://commons.wikimedia.org/wiki/File:The_historical_tram_line_in_Lisbon._(52329191119).jpg) |
| `foto-mia-pasta.jpg` | Instagram-Beitrag mia.kocht (Muster 2, 3, Wiederfinden 1) | 900 × 600 | [Pasta alla Norma - Wiki Loves Sicilia.jpg](https://commons.wikimedia.org/wiki/File:Pasta_alla_Norma_-_Wiki_Loves_Sicilia.jpg) |
| `foto-hund.jpg` | Instagram-Beitrag lena_k (Muster 2) | 900 × 600 | [Dog at Nørre Vorupør Strand.jpg](https://commons.wikimedia.org/wiki/File:Dog_at_N%C3%B8rre_Vorup%C3%B8r_Strand.jpg) |
| `foto-hoersaal.jpg` | Instagram-Beitrag jonas.r (Muster 3) | 900 × 600 | [Hörsaal 101 LMU.jpg](https://commons.wikimedia.org/wiki/File:H%C3%B6rsaal_101_LMU.jpg) |
| `foto-weiter.jpg` | Wiederfinden 1, angeschnittener dritter Beitrag | 900 × 600 | [View on the footbridge over the canal, at the university campus Roeterseiland; free photo Amsterdam, Fons Heijnsbroek, 10-2021.jpg](https://commons.wikimedia.org/wiki/File:View_on_the_footbridge_over_the_canal,_at_the_university_campus_Roeterseiland;_free_photo_Amsterdam,_Fons_Heijnsbroek,_10-2021.jpg) |

Hinweis zu `video-tom-lissabon.jpg`: Das Bild stammt ursprünglich von Unsplash, ist aber auf Commons als CC0 eingetragen (Unsplash-Bilder aus der Zeit vor Juni 2017 standen unter CC0).

Wer ein Bild austauscht, trägt hier Datei, Quelle und Lizenz nach.

## Bild austauschen

1. Neues Bild auf etwa die Größe in der Tabelle bringen (hochkant 720 × 1280, quer 900 × 600).
2. Unter dem Namen der Kennung speichern, z. B. `foto-mia-pasta.jpg`, und die alte Datei ersetzen.
3. `preview.html` öffnen und prüfen.

Profilbilder sind farbige Kreise mit Anfangsbuchstaben, App-Symbole auf dem Sperrbildschirm einfarbige Flächen (keine Logos). Beide haben keine Kennung.
