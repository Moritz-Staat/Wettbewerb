# 🏆 SportDuel – Der persönliche Sportwettbewerb

Eine progressive Web App (PWA) für zwei Personen, die gegeneinander Sport machen und Punkte sammeln. Aktivitäten werden mit Beweisfoto eingetragen und müssen vom Gegenüber bestätigt werden.

---

## Live-Demo

> Nach Aktivierung von GitHub Pages erreichbar unter:  
> `https://moritz-staat.github.io/Wettbewerb/`

---

## Features

| Feature | Beschreibung |
|---|---|
| 🏆 Leaderboard | Live-Punktestand beider Spieler, Monat & Gesamt |
| ➕ Aktivität eintragen | Alle Disziplinen mit Live-Punkte-Vorschau |
| 📸 Beweisfoto | Pflicht-Upload für alle nicht-automatischen Aktivitäten |
| ⏳ Approval-Queue | Aktivitäten müssen vom Gegner bestätigt werden |
| 📋 Verlauf | History nach Monaten gruppiert, Soft-Reset monatlich |
| 👤 User Switching | Zwei Accounts in einer App, Wechsel per Tap |

---

## Punktesystem

### Disziplinen

| Disziplin | Punkte | Einheit | Approval |
|---|---|---|---|
| 👟 Schritte | 1 Pkt / 100 Schritte | ab 4.000 Schritten/Tag | automatisch |
| 🏃 Joggen | 5 Pkt / km | Kilometer | ✅ Beweisfoto |
| 🚴 Fahrrad | 2 Pkt / km | Kilometer | ✅ Beweisfoto |
| ⚡ E-Bike | 1 Pkt / km | Kilometer | ✅ Beweisfoto |
| 🏋️ Gym | 30 Pkt pauschal | pro Session | ✅ Beweisfoto |
| 🧘 Physio / Dehnen | 10 Pkt / 15 Min | Minuten | ✅ Beweisfoto |
| 🎪 Zirkus / Moshpit | 15 Pkt / 30 Min | Minuten | ✅ Beweisfoto |
| 🌀 Freies Training | Nutzer gibt Punkte ein | frei | ✅ Beweisfoto |

### Gemeinsame Aktivitäten

Wenn beide zusammen Sport machen, bekommt die Person, die die Aktivität initiiert hat, **+2 Bonuspunkte**.

### Zeiträume

- **Dieser Monat** – Soft Reset zum 1. jedes Monats (alte Daten bleiben erhalten)
- **Gesamt** – Kumulierter Punktestand über alle Monate

---

## Approval-Flow

```
Nutzer trägt Aktivität ein + Beweisfoto
        ↓
Status: "Pending" (zählt noch nicht)
        ↓
Gegner sieht Aktivität in der Pending-Queue
        ↓
Gegner: Bestätigen ✅  →  Punkte werden gutgeschrieben
Gegner: Ablehnen ❌   →  Aktivität wird gelöscht
```

- Schritte sind ausgenommen und werden direkt gebucht
- Beide Seiten sehen pending-Aktivitäten, können aber nur die des **anderen** approven
- Badge-Counter in der Navigation zeigt offene Bestätigungen

---

## Technischer Stack

| Schicht | Technologie |
|---|---|
| Frontend | Vanilla HTML/CSS/JavaScript |
| Datenpersistenz | `localStorage` (browser-lokal) |
| Fonts | Google Fonts – Bebas Neue + Inter |
| Hosting | GitHub Pages |
| PWA | Installierbar über Browser (Add to Homescreen) |

### Datenspeicherung

Alle Aktivitäten werden im `localStorage` des Browsers gespeichert unter dem Key `sd_activities`. Das bedeutet:

- Daten sind **gerätespezifisch** – beide Personen müssen die App auf demselben Gerät nutzen, oder die Daten müssen manuell synchronisiert werden
- Kein Backend, kein Login-System, kein Server erforderlich
- Beweisfotos werden als Base64 im localStorage gespeichert

---

## Lokale Entwicklung

```bash
# Repo klonen
git clone https://github.com/Moritz-Staat/Wettbewerb.git
cd Wettbewerb

# Einfach die index.html im Browser öffnen
open index.html

# Oder mit einem lokalen Server (z.B. für PWA-Features)
npx serve .
```

---

## GitHub Pages aktivieren

1. Repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main`, Folder: `/ (root)`
4. Speichern → nach ~1 Minute erreichbar

---

## Projektstruktur

```
Wettbewerb/
├── index.html      # Die gesamte App (Single File)
└── README.md       # Diese Dokumentation
```

---

## Geplante Erweiterungen

- [ ] Backend + echte Accounts (z.B. Supabase)
- [ ] Push Notifications via Service Worker
- [ ] Anbindung Apple Health / Google Fit für Schritte
- [ ] Wöchentlicher Rückblick per Nachricht
- [ ] Statistik-Charts (Punkte über Zeit)
- [ ] Foto-Lightbox beim Approve

---

## Spieler

| | Name |
|---|---|
| 🟢 | Moritz |
| 🔴 | Hanna |

---

## Changelog


### v1.2.0 – 2026-06-28
- Komplettes UI-Redesign im Spotify Design System
  - Near-black Canvas `#121212`, Spotify Green `#1DB954` als Akzent
  - Inter als Systemfont (Circular-Fallback)
  - Track-List-Style für Aktivitäten (wie Spotify Song Rows)
  - Leader Bar zeigt Punkteanteil visuell
  - Bottom Sheet für User Switching
  - Spotify-style Pill Chips, Cards, Toasts
  - `prefers-reduced-motion` unterstützt

### v1.1.0 – 2026-06-28
- Spielerin umbenannt: Nina → **Hanna**
- Beispieldaten entfernt – sauberer Start
- Avatar-Initial für Hanna auf **H** aktualisiert

### v1.0.0 – 2026-06-28
- Initiales Release: SportDuel App + vollständige Dokumentation
