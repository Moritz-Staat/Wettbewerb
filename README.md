# SportDuel – Der persönliche Sportwettbewerb

Eine Web App für zwei Personen, die gegeneinander Sport machen und Punkte sammeln. Aktivitäten werden mit Beweisfoto eingetragen und müssen vom Gegenüber bestätigt werden.

---

## Features

| Feature | Beschreibung |
|---|---|
| Leaderboard | Live-Punktestand beider Spieler, Monat & Gesamt |
| Aktivität eintragen | Alle Disziplinen mit Live-Punkte-Vorschau |
| Beweisfoto | Pflicht-Upload mit Fullscreen-Lightbox (Zoom) |
| Approval-Queue | Aktivitäten müssen vom Gegner bestätigt werden |
| Verlauf | History nach Monaten gruppiert, Soft-Reset monatlich |
| Echte Accounts | JWT-basierte Authentifizierung mit Login/Register |
| Statistiken | Punkte-Verlauf (Liniendiagramm) + Disziplin-Verteilung (Donut) |
| Push Notifications | Benachrichtigungen bei neuen/bestätigten/abgelehnten Aktivitäten |
| Wochen-Recap | Automatische Zusammenfassung jeden Montag um 9:00 |

---

## Punktesystem

### Disziplinen

| Disziplin | Punkte | Einheit | Approval |
|---|---|---|---|
| Schritte | 1 Pkt / 100 Schritte | ab 4.000 Schritten/Tag | automatisch |
| Joggen | 5 Pkt / km | Kilometer | Beweisfoto |
| Fahrrad | 2 Pkt / km | Kilometer | Beweisfoto |
| E-Bike | 1 Pkt / km | Kilometer | Beweisfoto |
| Gym | 30 Pkt pauschal | pro Session | Beweisfoto |
| Physio / Dehnen | 10 Pkt / 15 Min | Minuten | Beweisfoto |
| Zirkus / Moshpit | 15 Pkt / 30 Min | Minuten | Beweisfoto |
| Freies Training | Nutzer gibt Punkte ein | frei | Beweisfoto |

### Gemeinsame Aktivitäten

Wenn beide zusammen Sport machen, bekommt die Person, die die Aktivität initiiert hat, **+2 Bonuspunkte**.

### Zeiträume

- **Dieser Monat** – Soft Reset zum 1. jedes Monats (alte Daten bleiben erhalten)
- **Gesamt** – Kumulierter Punktestand über alle Monate

---

## Approval-Flow

```
Nutzer trägt Aktivität ein + Beweisfoto
        |
Status: "Pending" (zählt noch nicht)
        |
Gegner sieht Aktivität in der Pending-Queue
        |
Gegner: Bestätigen  ->  Punkte werden gutgeschrieben
Gegner: Ablehnen    ->  Aktivität wird gelöscht
```

- Schritte sind ausgenommen und werden direkt gebucht
- Beide Seiten sehen pending-Aktivitäten, können aber nur die des **anderen** approven
- Badge-Counter in der Navigation zeigt offene Bestätigungen

---

## Technischer Stack

| Schicht | Technologie |
|---|---|
| Frontend | Vite + Vanilla JS, served via Nginx |
| Backend | Express.js + Node 20 |
| Datenbank | PostgreSQL 16 |
| Auth | JWT (bcrypt, 30d Token) |
| Foto-Upload | Multer (Disk Storage) |
| Push | Web Push API (VAPID) + Service Worker |
| Charts | Chart.js 4 |
| Deployment | Docker Compose (self-hosted) |

---

## Self-Hosting mit Docker

### Voraussetzungen

- Docker + Docker Compose
- Git

### Schnellstart

```bash
# Repo klonen
git clone https://github.com/Moritz-Staat/Wettbewerb.git
cd Wettbewerb

# Umgebungsvariablen konfigurieren
cp .env.example .env
# .env bearbeiten: POSTGRES_PASSWORD, JWT_SECRET und VAPID Keys setzen!

# VAPID Keys generieren (für Push Notifications)
npx web-push generate-vapid-keys

# Starten
docker compose up -d --build
```

Die App ist dann unter `http://localhost:8082` erreichbar.

### Konfiguration (.env)

| Variable | Beschreibung | Default |
|---|---|---|
| `POSTGRES_PASSWORD` | Datenbank-Passwort | `sportduel_secret` |
| `JWT_SECRET` | Secret für Token-Signierung | `change-me-in-production-please` |
| `VAPID_PUBLIC_KEY` | VAPID Public Key (Push) | _(leer = Push deaktiviert)_ |
| `VAPID_PRIVATE_KEY` | VAPID Private Key (Push) | _(leer = Push deaktiviert)_ |

### Port ändern

In `docker-compose.yml` den Frontend-Port anpassen:

```yaml
frontend:
  ports:
    - "8082:80"  # <- gewünschten Port hier setzen
```

---

## Lokale Entwicklung

### Backend

```bash
cd backend
npm install
# .env erstellen mit DATABASE_URL, JWT_SECRET, PORT
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Vite Dev Server mit Proxy auf Backend (localhost:3000)
```

---

## Projektstruktur

```
Wettbewerb/
├── docker-compose.yml
├── .env.example
├── db/
│   └── init.sql                # PostgreSQL Schema
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js            # Express App + Digest Scheduler
│       ├── db.js               # PostgreSQL Pool
│       ├── push.js             # Web Push (VAPID) Helper
│       ├── digest.js           # Wöchentlicher Recap
│       ├── middleware/
│       │   └── auth.js         # JWT Middleware
│       └── routes/
│           ├── auth.js         # Register, Login
│           ├── activities.js   # CRUD + Approve/Reject + Push
│           ├── users.js        # Me, Rival, Scores, Stats
│           └── push.js         # Push Subscribe/Unsubscribe
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.js             # Entry Point
│       ├── api.js              # API Client (fetch + JWT)
│       ├── config.js           # Konstanten
│       ├── scoring.js          # Punkte-Berechnung
│       ├── styles/
│       │   └── main.css        # Spotify-Dark Design System
│       └── ui/
│           ├── auth.js         # Login/Register
│           ├── score.js        # Leaderboard
│           ├── log.js          # Aktivität eintragen
│           ├── pending.js      # Approval Queue
│           ├── history.js      # Verlauf
│           ├── stats.js        # Statistik-Charts (Chart.js)
│           ├── lightbox.js     # Foto-Lightbox mit Zoom
│           ├── push.js         # Push-Subscription
│           ├── navigation.js   # Seitenwechsel
│           └── toast.js        # Toast-Notifications
└── index.html                  # Legacy Single-File (v1.2.0)
```

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Beschreibung |
|---|---|---|
| POST | `/register` | Account erstellen |
| POST | `/login` | Einloggen, JWT erhalten |

### Users (`/api/users`)

| Method | Endpoint | Auth | Beschreibung |
|---|---|---|---|
| GET | `/me` | JWT | Eigenes Profil |
| GET | `/rival` | JWT | Gegner-Profil |
| GET | `/scores?period=month\|all` | JWT | Punktestand |
| GET | `/stats?months=6` | JWT | Monatliche Statistiken + Disziplin-Breakdown |

### Activities (`/api/activities`)

| Method | Endpoint | Auth | Beschreibung |
|---|---|---|---|
| GET | `/` | JWT | Alle Aktivitäten |
| POST | `/` | JWT | Neue Aktivität (multipart/form-data) |
| POST | `/:id/approve` | JWT | Aktivität bestätigen (nur Gegner) |
| POST | `/:id/reject` | JWT | Aktivität ablehnen (nur Gegner) |

### Push (`/api/push`)

| Method | Endpoint | Auth | Beschreibung |
|---|---|---|---|
| GET | `/vapid-key` | - | VAPID Public Key abrufen |
| POST | `/subscribe` | JWT | Push-Subscription registrieren |
| DELETE | `/subscribe` | JWT | Push-Subscription entfernen |

---

## Geplante Erweiterungen

- [x] Backend + echte Accounts
- [x] Code-Refactoring in modulare Struktur
- [x] Foto-Upload auf Server statt Base64
- [x] Push Notifications via Service Worker (VAPID)
- [x] Statistik-Charts (Punkte-Verlauf + Disziplin-Verteilung)
- [x] Foto-Lightbox mit Zoom beim Approve
- [x] Wöchentlicher Recap per Push (Montag 9:00)
- [ ] Anbindung Apple Health / Google Fit (erfordert nativen App-Wrapper)

---

## Changelog

### v2.1.0 – 2026-07-05
- Statistik-Charts mit Chart.js (Punkte-Verlauf + Disziplin-Donut)
- Foto-Lightbox mit Fullscreen-Zoom im Approval-Flow
- Web Push Notifications (VAPID) bei neuen/bestätigten/abgelehnten Aktivitäten
- Wöchentlicher Digest per Push jeden Montag um 9:00
- Neuer Stats-Tab in der Navigation

### v2.0.0 – 2026-07-05
- Kompletter Umbau auf Full-Stack-Architektur
  - Backend: Express.js + PostgreSQL mit JWT Auth
  - Frontend: Vite Build, modulare JS-Struktur
  - Docker Compose für Self-Hosting (Postgres, Backend, Nginx)
  - Echte User-Accounts mit Login/Register
  - Foto-Upload auf Disk statt Base64 in localStorage
  - Alle Daten serverseitig persistiert

### v1.2.0 – 2026-06-28
- Komplettes UI-Redesign im Spotify Design System
  - Near-black Canvas `#121212`, Spotify Green `#1DB954` als Akzent
  - Inter als Systemfont
  - Track-List-Style für Aktivitäten
  - Leader Bar, Bottom Sheet, Pill Chips, Cards, Toasts

### v1.1.0 – 2026-06-28
- Spielerin umbenannt: Nina -> Hanna

### v1.0.0 – 2026-06-28
- Initiales Release: SportDuel App
