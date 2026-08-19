# Documentación de API y Endpoints: Hay Equipo

Servidor Backend REST & SSE escuchando por defecto en `http://localhost:4000`.

---

## 1. Búsqueda y Disponibilidad Real

### `GET /api/sports`
Devuelve la lista de deportes soportados (Pádel, Fútbol 5, Fútbol 7, Fútbol 8, Fútbol 11, Tenis, etc.).

### `GET /api/clubs`
- **Query Params**: `sport`, `city`, `lat`, `lng`, `maxDistanceKm`.
- Devuelve clubes con distancia calculada en KM, rating, servicios y canchas.

### `GET /api/availability`
- **Query Params**: `sport`, `date` (YYYY-MM-DD), `timeFrom` (HH:mm), `isCovered`, `onlyAvailable`.
- Devuelve slots discretos de canchas disponibles en tiempo real.

---

## 2. Reservas y Checkout (Mercado Pago)

### `POST /api/bookings/hold`
Bloquea un turno atómicamente por 7 minutos y genera preferencia de Mercado Pago.
```json
{
  "courtId": "court-arena-1",
  "date": "2026-09-01",
  "startTime": "21:00",
  "userId": "usr-emi",
  "userName": "Emiliano",
  "userPhone": "+5491155550001",
  "paymentType": "SPLIT",
  "splitPlayerCount": 4
}
```

### `POST /api/bookings/confirm`
Confirma el pago del turno (`CONFIRMED`) y libera el lock de Redis.

---

## 3. Split Payment Viral & Grupos

### `GET /api/split/:token`
Consulta el estado de recaudación y jugadores que ya pagaron.

### `POST /api/split/:token/pay`
Paga una cuota individual (usado tanto por la App como por la Web Landing sin app).

---

## 4. Turnos Fijos Recurrentes

### `POST /api/fixed-slots/subscribe`
Contrata un turno recurrente semanal con descuento.

### `POST /api/fixed-slots/occurrences/:id/liberate`
Libera una semana específica al marketplace ("No vamos esta semana").

---

## 5. Panel del Club (Agenda en Tiempo Real)

### `GET /api/club-admin/:clubId/timeline?date=YYYY-MM-DD`
Devuelve la matriz completa de canchas x horarios para la vista de "Hoy".

### `POST /api/club-admin/:clubId/manual-booking`
Registra una reserva de mostrador / WhatsApp actualizando la disponibilidad pública en vivo.
