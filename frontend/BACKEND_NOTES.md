# Backend notes (found while integrating)

The frontend is built around the backend exactly as provided — nothing was changed in it.
These are the places where the backend's real behaviour matters, ordered by importance.

## Needs a fix (a feature is broken without it)

### 1. Deleting a habit fails once the habit has any completion rows
`habit_completions.habit_id` is a foreign key to `habits`, but `Habit` has no cascade to completions and
`HabitServiceImpl.deleteHabit` only calls `habitRepository.delete(habit)`. `GET /api/habits/today` creates a
completion row for every habit scheduled today, so almost every habit has one → the DELETE throws a constraint
violation → HTTP 500. The app shows "The server couldn't delete this habit" until this is fixed.

Minimal fix:

```java
// HabitCompletionRepository
void deleteByHabitId(Long habitId);

// HabitServiceImpl.deleteHabit — before habitRepository.delete(existingHabit):
habitCompletionRepository.deleteByHabitId(existingHabit.getId());
```

## Worth fixing (the app already copes)

### 2. Wrong password returns HTTP 500
`UserServiceImpl.loginUser` throws a plain `RuntimeException("Invalid email or password")` and there is no handler,
so Spring answers 500. The app maps a 500 *from the login endpoint only* to "Invalid email or password."
(a real server outage would be shown the same way). Better: return 401.

```java
// UserServiceImpl: throw new org.springframework.security.authentication.BadCredentialsException("Invalid email or password");
// GlobalExceptionHandler:
@ExceptionHandler(BadCredentialsException.class)
public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
    return new ResponseEntity<>(ErrorResponse.builder().status(401).message(ex.getMessage())
            .timestamp(LocalDateTime.now()).build(), HttpStatus.UNAUTHORIZED);
}
```
The app already accepts 401 here, so no frontend change is needed afterwards.

### 3. "Habit not found" / "not scheduled for today" also return 500
Both are plain `RuntimeException`s in `HabitServiceImpl`. The app only offers valid actions (the Today list only
contains habits scheduled today), so users should not hit these. A 404 / 400 would be more accurate.

### 4. Expired JWT behaves differently per service
- user-service → 401 (has `HttpStatusEntryPoint`)
- habit-service `/api/habits/**` → **403** (no entry point configured)
- habit-service `/api/analytics/**` → `permitAll`, so with no/invalid token the service hits a `NullPointerException`/`ClassCastException` → **500**

The app handles all of this: 401 *and* 403 send the user to Login, and the app never sends a request with a token it can
see is expired (it reads `exp` from the JWT), which avoids the analytics 500 case. Cleaner backend: make
`/api/analytics/**` `authenticated()` and add `HttpStatusEntryPoint(UNAUTHORIZED)` to habit-service.

## Limitations (data the backend does not provide)

- **User's name**: the login response and JWT contain only email + userId, and `GET /api/users/profile` returns the
  literal string `"Authenticated user"`. The greeting uses the full name entered at registration, remembered on that
  device; on a fresh install / other device it falls back to a name derived from the email. Fix: add `fullName`
  to `LoginResponse` (or return a real profile object).
- **Overall streak**: there is no account-level streak endpoint. The app shows the best *current per-habit streak*
  (from `/api/habits/{id}/streak`) and labels it that way.
- **XP, levels, badges, friends, icons/colours, Count and Yes/No targets** (shown in the reference mock-ups):
  the backend has none of these, so they are intentionally not in the app and nothing is faked. Habits are
  time-based only (`targetMinutes`). Icons and accent colours are chosen on-device from the habit name/id.
- **`GET /api/analytics/today`** always returns `habits: null`; the app uses `/api/habits/today` for the list.
- **History** is requested per habit (`/api/habits/{id}/history` returns every day since creation), so the History tab
  makes one call per habit. Fine for an MVP; a date-range or aggregated endpoint would scale better.
- **Dates** (`LocalDate.now()`) use the server's time zone. If the phone and server are in different zones, "today"
  can differ around midnight.
- **`user-service/application.properties`** contains a stray line `JWT` (line 22, missing the `#`). Harmless, but
  probably meant to be a comment.
- The gateway has no CORS configuration. Not needed for the native app; it would only matter for Expo Web.
