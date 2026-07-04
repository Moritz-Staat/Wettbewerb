# SportDuel – Der persönliche Sportwettbewerb

Eine Web App für zwei Personen, die gegeneinander Sport machen und Punkte sammeln. Aktivitäten werden mit Beweisfoto eingetragen und müssen vom Gegenüber bestätigt werden.

---

## Features

| Feature | Beschreibung |
|---|---|
| Leaderboard | Live-Punktestand beider Spieler, Monat & Gesamt |
| Aktivität eintragen | Alle Disziplinen mit Live-Punkte-Vorschau |
| Beweisfoto | Pflicht-Upload für alle nicht-automatischen Aktivitäten |
| Approval-Queue | Aktivitäten müssen vom Gegner bestätigt werden |
| Verlauf | History nach Monaten gruppiert, Soft-Reset monatlich |
| Echte Accounts | JWT-basierte Authentifizierung mit Login/Register |

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
# .env bearbeiten: POSTGRES_PASSWORD und JWT_SECRET setzen!

# Starten
docker compose up -d --build
```

Die App ist dann unter `http://localhost:8082` erreichbar.

### Konfiguration (.env)

| Variable | Beschreibung | Default |
|---|---|---|
| `POSTGRES_PASSWORD` | Datenbank-Passwort | `sportduel_secret` |
| `JWT_SECRET` | Secret für Token-Signierung | `change-me-in-production-please` |

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
│       ├── index.js            # Express App
│       ├── db.js               # PostgreSQL Pool
│       ├── middleware/
│       │   └── auth.js         # JWT Middleware
│       └── routes/
│           ├── auth.js         # Register, Login
│           ├── activities.js   # CRUD + Approve/Reject
│           └── users.js        # Me, Rival, Scores
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
│           ├── navigation.js   # Seitenwechsel
│           └── toast.js        # Notifications
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

### Activities (`/api/activities`)

| Method | Endpoint | Auth | Beschreibung |
|---|---|---|---|
| GET | `/` | JWT | Alle Aktivitäten |
| POST | `/` | JWT | Neue Aktivität (multipart/form-data) |
| POST | `/:id/approve` | JWT | Aktivität bestätigen (nur Gegner) |
| POST | `/:id/reject` | JWT | Aktivität ablehnen (nur Gegner) |

---

## Geplante Erweiterungen

- [x] Backend + echte Accounts
- [x] Code-Refactoring in modulare Struktur
- [x] Foto-Upload auf Server statt Base64
- [ ] Push Notifications via Service Worker
- [ ] Statistik-Charts (Punkte über Zeit)
- [ ] Foto-Lightbox beim Approve
- [ ] Anbindung Apple Health / Google Fit für Schritte
- [ ] Wöchentlicher Rückblick per Nachricht

---

## Changelog

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
