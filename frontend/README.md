# Smart Habit Tracker — Mobile App (React Native + Expo + TypeScript)

Mobile frontend for the SHT backend. It talks only to the **API Gateway** (`:8080`):

```
React Native App → API Gateway (8080) → User Service (8082) / Habit Service (8083) → MySQL
```

Place this folder beside your backend:

```
smart-habit-tracker/
├── backend/   (eureka-server, api-gateway, user-service, habit-service)
└── frontend/  ← this project
```

## 1. Run the backend first

Start in this order: MySQL → Eureka (8761) → user-service → habit-service → api-gateway.
Both services need the same `JWT_SECRET` and a `DB_PASSWORD` environment variable.

## 2. Install and run the app

Requirements: Node 20+ and either the **Expo Go** app on your phone or an Android emulator.

```bash
cd frontend
npm install
npx expo install --fix     # aligns package versions with your Expo SDK (safe to run)
npm start                  # opens the Expo dev server — scan the QR with Expo Go
```

Run on Android directly:

```bash
npm run android            # needs an emulator running (Android Studio) or a USB-connected phone
```

If Expo Go says the project's SDK is incompatible, run `npx expo install expo@latest` followed by `npx expo install --fix`.

Type-check: `npm run typecheck`

## 3. Point the app at your API Gateway

The default is `http://10.0.2.2:8080` on Android (this is the emulator's alias for your computer's `localhost`).

| Where you run the app | API URL |
| --- | --- |
| Android emulator | `http://10.0.2.2:8080` (default) |
| iOS simulator | `http://localhost:8080` |
| Real phone on the same Wi-Fi | `http://<your-PC-LAN-IP>:8080` (e.g. `http://192.168.1.10:8080`) |

Three ways to set it:

1. **`.env` file** — copy `.env.example` to `.env` and edit `EXPO_PUBLIC_API_URL`, then restart `npm start`.
2. **In the app** — on the Login screen tap *Server: … · change*. It is saved on the device, so it works in an installed APK without rebuilding.
3. Edit `DEFAULT_BASE_URL` in `src/api/config.ts`.

Real-phone checklist: phone and PC on the same Wi-Fi; allow port 8080 through your PC firewall; use the PC's LAN IP, not `localhost`.

## 4. Build an APK

Cleartext HTTP is already enabled for Android (`expo-build-properties` in `app.json`) because the backend is plain `http://`.

**Option A — EAS (cloud build, easiest):**

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview     # produces an installable .apk
```

**Option B — local build (needs Android Studio / SDK + JDK 17):**

```bash
npx expo prebuild -p android
cd android
./gradlew assembleRelease                  # Windows: gradlew.bat assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

## 5. What the app does

| Screen | Backend endpoints used |
| --- | --- |
| Register | `POST /api/users/register`, then `POST /api/users/login` (auto sign-in) |
| Login | `POST /api/users/login` |
| Home (dashboard) | `GET /api/habits/today`, `GET /api/analytics/today`, `GET /api/habits/{id}/streak`, `PATCH /api/habits/{id}/completion` |
| My Habits | `GET /api/habits`, `DELETE /api/habits/{id}` |
| New / Edit habit | `POST /api/habits`, `GET /api/habits/{id}`, `PUT /api/habits/{id}` |
| Habit detail | `GET /api/habits/{id}`, `GET /api/habits/{id}/history`, `DELETE /api/habits/{id}` |
| History | `GET /api/analytics/weekly`, `GET /api/habits`, `GET /api/habits/{id}/history` |
| Profile | `GET /api/analytics/weekly`; name/email come from the JWT + registration |

Navigation: Splash → (JWT valid? Home : Welcome/Login/Register). Tabs: **Home · History · (+) · Habits · Profile**.
An expired or rejected JWT (401/403, or `exp` in the past) clears the session and returns to Login with a notice.

## 6. Project structure

```
src/
├── api/          client.ts (axios + JWT interceptor), config.ts, authApi.ts, habitApi.ts, historyApi.ts
├── components/   HabitCard, ProgressCard, StatCard, PrimaryButton, InputField, Header, ConfirmationModal,
│                 StateViews (Loading / Empty / Error / InlineBanner), BarChart, Heatmap, TimeStepper, …
├── context/      AuthContext.tsx (central auth state)
├── hooks/        useFocusData (load-on-focus), useDashboard (optimistic completion), useDeleteHabit
├── navigation/   RootNavigator, TabBar (custom bar with centre +), types
├── screens/      auth/ home/ habits/ history/ profile/
├── storage/      secureStorage.ts (expo-secure-store: JWT, server URL, name cache)
├── theme/        index.ts (colors, spacing, radius, typography, shadows)
├── types/        api.ts (types mirroring the backend DTOs)
└── utils/        jwt, dates, format, errors, stats, validation, habitVisuals
```

See **BACKEND_NOTES.md** for backend behaviours the app works around and a few small fixes worth making.
