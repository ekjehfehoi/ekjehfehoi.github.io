# 01 — Apple Guideline 4.2: Minimum Functionality

**The rejection that kills more AI-built apps than any other.**

Typical wording you will receive:

> Guideline 4.2 - Design - Minimum Functionality
> Your app does not include any native functionality and appears to be a bundle of web content. The app experience should include native features and behaviour to justify inclusion in the App Store.

---

## What 4.2 actually says

Apple's guideline text: your app should include features, content, and UI that elevate it beyond a repackaged website. If your app is not particularly useful, unique, or "app-like," it does not belong on the App Store.

Two things reviewers are trained to catch:

1. **A WebView pointed at a URL** with nothing else. They call this a "web clip". It is an instant rejection regardless of how good the web app is.
2. **An app that behaves like a browser tab**: no offline state, no push, no native navigation, no system integration, horizontal scroll on a phone, links that open in the same window.

What they are *not* judging: whether you used AI. Whether the code is clean. Whether the design is pretty. It is purely "does this binary do something a Safari tab cannot".

---

## Why your AI build trips it

When you export a Lovable / Bolt / Replit / v0 app and wrap it, you get, by default:

- Assets served from a local scheme with no offline handling → white screen on bad network
- No push notifications
- No biometric unlock
- No share sheet integration
- No widget, no App Extension
- A viewport built for desktop breakpoints → horizontal scroll and pinch-zoom on a phone
- No `safe-area-inset` handling → content under the notch and the home indicator
- Links that open inside the same WebView instead of the system browser

That is eight visible "this is a website" signals in the first 30 seconds. A reviewer needs two of them.

---

## The fix: the 4.2 Survival Stack

You need native capability that is **used in the core flow**, not decorative. A reviewer who cannot find the feature within two minutes treats it as absent.

Pick at least three. The first three are the highest-value-per-hour.

### 1. Push notifications — highest signal, lowest effort

Nothing says "native app" louder. It also gives you retention, which is the actual business reason to be on iOS.

- Plugin: `@capacitor/push-notifications` + OneSignal or Firebase (`@capacitor-firebase/push`).
- Requires the Push Notifications capability on the App ID and Background Modes → Remote notifications. See `14-apple-push.md`.
- Ask for permission **contextually** — after the user has done something valuable once, not on cold launch. Cold-launch prompts convert around 40–50%; contextual prompts convert 70–90%.

### 2. Offline mode with a real fallback

This is the one that gets missed most often and the one reviewers explicitly test, because they are on hotel Wi-Fi and VPNs.

```ts
// capacitor.config.ts
server: {
  errorPath: 'offline.html',   // shown when the remote URL fails to load
  androidScheme: 'https',      // NOT 'http' — see 26-webview-auth.md
  cleartext: false
}
```

Ship a bundled `offline.html` plus a cached copy of your app shell so the first paint never depends on the network. Then in the web layer, cache critical data (`localStorage` / IndexedDB) so previously-loaded screens still render in airplane mode.

Test it: turn on airplane mode, launch the app. If you see a white screen, you have not fixed 4.2.

### 3. Biometric unlock

Face ID / Touch ID to open the app. Cheap to implement, immediately visible to a reviewer, genuinely useful.

- Plugin: `capacitor-native-biometric`.
- Add `NSFaceIDUsageDescription` to Info.plist with a specific purpose string (see `04-apple-5.1.1.md` — a vague string here triggers a *second* rejection).
- Guard it: only offer biometrics after the user has signed in once with the normal flow.

### 4. Share Extension

An App Extension moves you structurally out of "web clip" territory, because a website cannot have one. Users share *into* your app from other apps.

Cost: real. An extension is a separate target in Xcode with its own bundle ID. Worth it if your product ingests content (notes, bookmarks, receipts, links).

### 5. Widget / Home Screen Quick Action

A small widget with your app's most-used state. Also a separate target. Strong signal, moderate cost.

### 6. Native haptics and system UI

- Haptics on meaningful actions (`@capacitor/haptics`).
- Native status bar theming that follows light/dark (`@capacitor/status-bar`).
- Native share sheet for exporting (`@capacitor/share`).
- Keyboard handling so inputs are never covered (`@capacitor/keyboard`, `resize: 'body'`).

Individually small. Together they change how the app *feels*, and 4.2 is partly a feel judgement.

---

## Architecture decision: bundled assets vs remote URL

This is the choice that determines whether you pass 4.2 or risk 2.5.2.

### Option A — Remote URL only (`server.url = 'https://app.yoursite.com'`)

- ✅ Web changes appear instantly, no resubmission
- ✅ Cookies, OAuth redirects and Supabase auth keep working (http origin)
- ❌ **Highest 4.2 risk.** Nothing native in the binary except the shell.
- ❌ Offline = dead app unless you add a fallback
- ❌ You are dependent on your hosting being up during review

### Option B — Bundled assets only (`webDir: 'dist'`)

- ✅ Zero remote dependency, genuinely offline-capable
- ✅ Strongest 4.2 position
- ❌ Every content change requires a store resubmission
- ❌ Local scheme can break cookie-based auth → see `26-webview-auth.md`

### Option C — Hybrid (what this Kit ships) ← **recommended**

Bundle the app shell and a cached snapshot of your content. Load the live URL for fresh data. Fall back to the bundle when offline.

```ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourco.yourapp',
  appName: 'Your App',
  webDir: 'dist',              // bundled shell = offline capability
  androidScheme: 'https',
  ios: { scheme: 'https' },     // keeps http-origin auth working
  server: {
    errorPath: 'offline.html',  // bundled fallback, never a white screen
    androidScheme: 'https',
    cleartext: false
    // server.url intentionally NOT set — remote content is loaded by the
    // app layer via fetch/iframe of data only, not as the whole app
  },
  plugins: {
    Keyboard: { resize: 'body', resizeOnFullScreen: true },
    SplashScreen: { launchShowDuration: 600, backgroundColor: '#08090c', androidSplashResourceName: 'splash' }
  }
};
export default config;
```

**Why this passes 4.2:** the binary is self-contained and functional offline, so it is not a web clip. **Why it does not trip 2.5.2:** you are updating *content and data*, not shipping code that changes app behaviour. See `02-apple-2.5.2.md` for the line you must not cross.

> ⚠️ The thing that gets people in trouble: setting `server.url` to a remote page that contains a prompt box, a code editor, or any UI where a user can generate or run something. That is 2.5.2 territory, and it is exactly what Apple enforced against in March 2026.

---

## Pre-submission 4.2 audit

Run this on the exact build you are about to submit, on a real device, on cellular data.

- [ ] Airplane mode → launch → app renders something useful, not a white screen
- [ ] Push notification received and tapping it opens the relevant screen
- [ ] Face ID / Touch ID prompt appears with a specific purpose string
- [ ] At least one system integration works: share sheet, camera, biometrics, notifications
- [ ] No horizontal scrolling anywhere in the app
- [ ] Pinch-zoom is disabled on UI chrome
- [ ] Content is not hidden under the notch or the home indicator
- [ ] Keyboard does not cover the focused input
- [ ] Every external link opens in the system browser, not inside the app
- [ ] Back navigation works from every screen
- [ ] No "Coming soon", TODO buttons, dead links, or empty tabs
- [ ] Tap targets are at least 44×44 pt

Then the paperwork:

- [ ] App Review Information lists every native feature and where to find it
- [ ] Demo account is pre-filled with data and works in this build
- [ ] A screen recording of the core flow is attached (unlisted link)

---

## App Review notes template

Paste into App Store Connect → App Information → App Review Information.

```
This app is a native iOS application built with Capacitor. It is not a web clip.

Native capabilities included in this build:
1. Push notifications — enable in Settings > Notifications. Send yourself a test
   from the profile screen ("Test notification" button).
2. Face ID unlock — after your first sign-in, go to Settings > Security > Face ID.
3. Offline mode — the app is fully functional in airplane mode; previously loaded
   data is cached locally and the bundled shell renders without a network.
4. System share sheet — tap the share icon on any item to share natively.
5. Haptic feedback on all primary actions.

Demo account:
  Email: demo@yourapp.com
  Password: Demo1234!
The demo account is pre-populated with 30 days of data.

Video walkthrough of the full flow: https://youtu.be/UNLISTED_ID

Note on remote content: the app ships a bundled build. Remote requests fetch data
(JSON, images, text) only. No code is downloaded or executed at runtime, and no
feature of the app can be changed remotely (Guideline 2.5.2 compliant).
```

That last paragraph is not boilerplate padding — it pre-empts the 2.5.2 question before the reviewer forms it.

---

## If you are rejected under 4.2 anyway

Do not resubmit the same binary with a nicer description. Reviewers can see the previous rejection and an unchanged build reads as disrespect.

Minimum acceptable response:

1. Add one native capability you did not have (push is the fastest).
2. Add the offline fallback if it was missing.
3. Rewrite App Review Information using the template above, explicitly naming each native feature.
4. Reply in Resolution Centre:

```
Thank you for the feedback. We have updated the build to include the following
native iOS functionality, all reachable from the main screen:

- Push notifications (APNs): Settings > Notifications, test button included
- Face ID unlock: Settings > Security
- Full offline operation: the app renders and functions in airplane mode using
  a bundled build and locally cached data
- Native share sheet integration on all content items

The binary is no longer dependent on a remote web view for core functionality.
A walkthrough video is attached to App Review Information. Build 1.0.3 (12).
```

---

## AI agent prompt (paste into Cursor / Claude Code)

```
You are a senior iOS release engineer specialising in App Store Review compliance.

Context: I built a web app with {STACK} and I am shipping it as a Capacitor 7
iOS + Android app. My product is: {APP_DESCRIPTION}. My primary user flow is:
{CORE_FLOW}.

I was rejected under App Store Guideline 4.2 (Minimum Functionality).

Deliver, in this order:
1. A prioritised plan of 3 native capabilities that are genuinely used inside
   {CORE_FLOW} — not decorative. For each: the Capacitor plugin package and
   version, the Info.plist / manifest entries, and the UI touchpoint where a
   reviewer will find it within 60 seconds.
2. A hybrid content architecture: bundled assets for offline capability plus a
   data-only remote update channel. Output the complete capacitor.config.ts.
   Do NOT set server.url to a remote page that renders the whole app.
3. An offline.html fallback and the caching layer in my web code so previously
   loaded screens render in airplane mode.
4. All CSS fixes for native feel: viewport-fit=cover with env(safe-area-inset-*),
   disabled pinch zoom, disabled -webkit-touch-callout on UI chrome, 44pt tap
   targets, keyboard-avoiding inputs.
5. The App Review Information text naming every native feature and its location.

Constraints: no feature may be added that a reviewer cannot reach in two taps
from the home screen. Output diffs and full files, not explanations of what to do.
```

---

## RU — Кратко

**Что говорит 4.2:** приложение должно быть больше, чем переупакованный сайт. Ревьюеры ловят две вещи: WebView, направленный на URL (они называют это «web clip»), и поведение браузерной вкладки — нет офлайна, нет push, нет нативной навигации, горизонтальный скролл, ссылки открываются в том же окне. Качество кода и факт использования ИИ они не оценивают вообще.

**Почему ИИ-сборка проваливается:** в дефолтном экспорте нет офлайн-обработки (белый экран на плохой сети), нет push, нет биометрии, нет share sheet, нет виджетов, десктопные брейкпоинты дают горизонтальный скролл, нет safe-area отступов, ссылки открываются внутри WebView. Это восемь сигналов «это сайт» за первые 30 секунд. Ревьюеру хватает двух.

**Решение — минимум три нативные функции, используемые в основном сценарии:**
1. **Push-уведомления** — самый сильный сигнал при минимальных усилиях. Запрашивайте разрешение контекстно, а не при холодном запуске (40–50% против 70–90% согласия).
2. **Офлайн-режим с реальным фолбэком** — `server.errorPath`, вшитый `offline.html`, кэш данных. Проверка: авиарежим → запуск → приложение что-то показывает. Белый экран = 4.2 не исправлен.
3. **Вход по биометрии** — Face ID/Touch ID. Дёшево, сразу видно, реально полезно.
4. **Share Extension / виджет** — отдельные таргеты в Xcode, дороже, но структурно выводят из категории «web clip».
5. **Тактильный отклик, нативный статус-бар, системный share, обработка клавиатуры** — по отдельности мелочи, вместе меняют ощущение от приложения.

**Архитектура — три варианта:**
- **A. Только удалённый URL** (`server.url`): мгновенные обновления, авторизация работает, но максимальный риск 4.2 и мёртвое приложение офлайн.
- **B. Только локальные ассеты** (`webDir`): сильнейшая позиция по 4.2, но каждое изменение контента требует переотправки в стор, и локальная схема может сломать cookie-авторизацию.
- **C. Гибрид — то, что поставляется в Kit**: вшиваем оболочку и кэш контента, свежие данные грузим с сервера, офлайн падаем в локальную сборку. Проходит 4.2 (билд самодостаточен) и не ловит 2.5.2 (обновляются данные, а не поведение).

**Главная ловушка:** `server.url` на удалённую страницу с полем для промптов, редактором кода или любым UI, где пользователь может что-то сгенерировать или выполнить. Это уже 2.5.2, и именно это Apple применила в марте 2026.

**Аудит перед отправкой** (на реальном устройстве, через мобильную сеть): авиарежим показывает полезный экран; push приходит и открывает нужный экран; Face ID запрашивается с конкретной строкой-описанием; работает хотя бы одна системная интеграция; нет горизонтального скролла; pinch-zoom отключён; контент не под «чёлкой»; клавиатура не перекрывает поля; внешние ссылки уходят в системный браузер; назад работает с каждого экрана; нет заглушек и мёртвых ссылок; зоны нажатия ≥44×44 pt. Плюс в App Review Information перечислены все нативные функции, демо-аккаунт наполнен данными и приложено видео сценария.

**Если всё равно отказали:** не переотправляйте тот же билд с более красивым описанием. Добавьте одну новую нативную функцию (push — быстрее всего), добавьте офлайн-фолбэк, перепишите App Review Information по шаблону и ответьте в Resolution Centre списком изменений с номером билда.
