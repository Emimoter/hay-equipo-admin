# Esquema de Base de Datos y Modelo de Entidades: Hay Equipo

La base de datos está modelada en PostgreSQL mediante Prisma ORM.

## Entidades Principales

### 1. `Club` & `Court`
- **Club**: Representa el complejo deportivo (Dirección, Coordenadas GPS, Rating, Teléfono, WhatsApp, Servicios: Parking, Duchas, Buffet, Parrillas, WiFi, etc.).
- **Court**: Cada cancha física dentro del club (Deporte: Padel, Futbol 5/7/8/11; Superficie: Panorámica WPT, Césped sintético; Techada/Outdoor; Iluminación; Duración: 60/90 min; Precio regular y descuento de turno fijo).

### 2. `Booking` & `BookingHold`
- **Booking**: Registra la reserva (`HELD`, `CONFIRMED`, `MANUAL_ENTRY`, `CANCELLED`).
- **Hold Lock**: Bloqueo atómico de 7 minutos en Redis para evitar double-booking mientras el usuario realiza el checkout en Mercado Pago.

### 3. `SplitPayment` & `PaymentParticipant`
- **SplitPayment**: Almacena el token único de compartición viral por WhatsApp, monto total, tipo de división (Equitativa o Personalizada) y estado general (`PENDING`, `PARTIALLY_PAID`, `APPROVED`).
- **PaymentParticipant**: Registro de cada cuota individual con nombre del amigo, teléfono, monto y estado (`PAID` / `PENDING`).

### 4. `FixedSlotSubscription` & `RecurringBookingOccurrence`
- **FixedSlotSubscription**: Contrato recurrente semanal del jugador ("Todos los jueves 21:00 hs durante 3 meses").
- **RecurringBookingOccurrence**: Cada fecha individual generada semanalmente con estado independiente (`SCHEDULED`, `RELEASED_TO_MARKETPLACE`, `COMPLETED`), permitiendo al titular liberar una semana al marketplace si no puede ir.
