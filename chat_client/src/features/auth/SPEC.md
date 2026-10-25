# Auth feature — frontend specification

Login, registration and session handling in `chat_client` (Expo SDK 58, Expo Router).
Backend contract: [chat_server/src/auth/SPEC.md](../../../../chat_server/src/auth/SPEC.md). Folder layout: [src/Architicture.md](../../Architicture.md).

This document describes **how the feature works today** and the **rules to keep when changing it**. If code and this spec disagree, fix one of them in the same change.

---

## 1. File map

| Path | Role |
| --- | --- |
| `src/app/_layout.tsx` | Providers (`I18nProvider` → `SessionProvider`), auth routing guard, splash hiding |
| `src/app/(auth)/login.tsx`, `register.tsx` | Screens: language switcher + form |
| `src/app/(main)/index.tsx` | Dashboard (signed-in landing screen, sign out) |
| `features/auth/api/authApi.ts` | HTTP client for `/auth/*`, `ApiRequestError` |
| `features/auth/types.ts` | `PublicUser`, `AuthSession`, request types, API envelope |
| `features/auth/validation.ts` | Field rules shared by both forms (mirrors the server) |
| `features/auth/hooks/useAuthForm.ts` | Generic form state: values, touched, errors, submit |
| `features/auth/hooks/useSession.ts` | Access to the session context |
| `features/auth/components/SessionProvider/` | Session state + persistence |
| `features/auth/components/LoginForm/` | Login form, its hook, error mapping |
| `features/auth/components/RegisterForm/` | Registration form, its hook, validation, error mapping |
| `features/auth/components/PasswordInput/` | Password field with show/hide toggle |
| `features/auth/components/AuthLink/` | "No account? Sign up" / "Have an account? Sign in" |
| `lib/storage.ts` | `secureStorage`: Keychain/Keystore on native, `localStorage` on web |
| `lib/json.ts` | `parseJson` / `stringifyJson` — never throw, return `null` |
| `lib/i18n/` | Translations (`en`, `ru`), `useTranslation` |
| `config/env.ts` | `EXPO_PUBLIC_API_URL`, HTTPS enforcement for production builds |

Public API of the feature is `features/auth/index.ts`: `LoginForm`, `RegisterForm`, `SessionProvider`, `useSession`, types. Screens import only from there.

---

## 2. Routing and session lifecycle

```
app start ─► splash visible ─► I18nProvider loads language ─► SessionProvider reads "auth.session"
                                                                   │
                              ┌───────────── status ───────────────┤
                              ▼                                    ▼
                         'signedOut'                          'signedIn'
                  (auth)/login, (auth)/register             (main)/index
```

- `RootNavigator` uses `Stack.Protected`: `(main)` only when `status === 'signedIn'`, `(auth)` only otherwise. Navigation after login, registration or sign out happens **by flipping the guard** — never call `router.replace` for it.
- While `status === 'loading'` the layout renders `null` and the native splash stays up; `SplashScreen.hide()` runs once loading ends.
- `AuthLink` navigates with `replace`, so switching login ↔ register does not grow the back stack.

### Session (`SessionProvider`)

| Action | Behaviour |
| --- | --- |
| Startup | Read `auth.session`. Valid JSON → `signedIn`; missing → `signedOut`; corrupted → entry deleted, `signedOut` |
| `signIn(session)` | Persist (if serializable), set state → guard moves the user to `(main)` |
| `signOut()` | Clear state and storage first, then `POST /auth/logout` best-effort (errors ignored) |

Stored value: `AuthSession = { accessToken, refreshToken, user: { id, name, email } }`.

---

## 3. API client

- Base URL: `env.apiUrl` from `EXPO_PUBLIC_API_URL` (dev default `http://localhost:3000`). Production builds **fail to start** without it or if it is not `https://`.
- `post<T>()` unwraps the `{ data, error }` envelope. Failures throw `ApiRequestError(message, status)`; `status === 0` means the server was unreachable.
- Used endpoints: `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`.
- **Not used yet:** `POST /auth/refresh`, `GET /auth/me`, and the access token is not attached to any request (see §8).

---

## 4. Forms

Both forms are built on `useAuthForm`:

```ts
useAuthForm({
  initialValues,          // all fields are strings
  validate,               // (values) => { [field]?: { key, params } }
  onSubmit,               // throws on failure
  getErrorKey,            // (error) => translation key for the banner
  clearOnError,           // fields emptied after a failed submit (passwords)
});
// → { values, isSubmitting, submitError, setField(f), touchField(f), getFieldError(f), submit }
```

- A field error is shown only after the field was blurred, or after a submit attempt (all fields become touched).
- Submit is blocked while any field is invalid or a request is in flight.
- Errors are stored as **translation keys**, so switching language re-translates visible errors.

### Validation (`validation.ts`)

| Field | Rule | Message key |
| --- | --- | --- |
| User name | trimmed, 2–32 chars, `[a-z0-9._-]` case-insensitive | `nameRequired`, `nameLength`, `nameChars` |
| Email (register) | trimmed, `x@y.z` shape | `emailRequired`, `emailInvalid` |
| Password | 8–12 chars, ≥ 1 letter and ≥ 1 digit | `passwordRequired`, `passwordLength`, `passwordComplexity` |
| Repeat password (register) | equals password | `passwordsMismatch` |

The server lowercases name and email itself; the client only trims. The server is the source of truth — client rules exist for fast feedback.

> **Sync rule:** limits mirror `chat_server/src/auth/auth.constants.ts`. Change both in the same commit.

### Server error → message

| Form | Status | Key (`auth.errors.*`) |
| --- | --- | --- |
| Login | `0` | `network` |
| Login | `401` | `invalidCredentials` |
| Login | `423` | `locked` |
| Register | `0` | `network` |
| Register | `409` | `taken` |
| Both | anything else | `unknown` |

Mapping is by **status code** (`getLoginErrorKey`, `getRegisterErrorKey`); server message text is never shown.

### Field behaviour

| Form | Fields (in order) | `autoComplete` | Cleared on error |
| --- | --- | --- | --- |
| Login | name → password | `username`, `current-password` | password |
| Register | name → email → password → repeat | `username-new`, `email`, `new-password` ×2 | both passwords |

"Next" on the keyboard focuses the next field; "Go" on the last field submits. Inputs are disabled while submitting.

---

## 5. Internationalization

- Keys live under `auth.fields`, `auth.login`, `auth.register`, `auth.validation`, `auth.errors` in `lib/i18n/translations/en.ts` and `ru.ts`.
- `ru.ts` is typed as `Translations` (shape of `en.ts`), so a missing Russian string or a misspelled key in `t('...')` is a type error.
- Language: saved choice (`app.language`) → device language (`ru` → Russian, anything else → English).

---

## 6. UI conventions

- Colors and spacing come from `@/ui` tokens (black & violet theme); no hard-coded colors in components.
- Inputs have no border; focus is shown by a lighter fill. Errors appear as red text under the field.
- The submit error banner uses `role="alert"`; the password toggle has a translated `aria-label`.
- Each component folder follows the architecture: `Component.tsx`, `Component.styles.ts`, `useComponent.ts`, `Component.utils.ts`, `index.ts`.

---

## 7. Rules for changing this feature

- **Lint:** components must be arrow functions, all functions must be expressions (`func-style`). Route files: `const Screen = () => ...; export default Screen;`. Long single-expression arrow bodies conflict with Prettier (`implicit-arrow-linebreak`) — use a block body with an `if`/variable instead.
- **Adding a form field:** extend the request type in `types.ts` → add a validator in `validation.ts` (or the form's `*.utils.ts` if it is form-specific) → add `en` + `ru` keys → render it in the form. If the server needs it, update the backend DTO first.
- **New server error status:** add it to the form's `get*ErrorKey` and to both translation files.
- **Never** store tokens outside `secureStorage`, and never parse/stringify JSON directly — use `lib/json.ts`.
- Before finishing: `npx expo lint` and `npx tsc --noEmit` must be clean.

---

## 8. Known limitations

- Access tokens expire after 15 minutes and there is no automatic refresh; when protected API calls are added, add a client that attaches `Authorization: Bearer` and calls `/auth/refresh` on `401`.
- On web the session lives in `localStorage` (expo-secure-store has no web support), so it is readable by any script on the page.
- No "forgot password" and no email verification.
- Web is built as a single-page app (`app.json` → `web.output: "single"`); server rendering was turned off because it gave no benefit and caused stale Metro bundles.
