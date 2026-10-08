// VibeShip Kit — store-compliant Capacitor starter
// capacitor.config.ts
//
// This config is deliberately shaped to survive App Store Guideline 4.2
// (Minimum Functionality) and Guideline 2.5.2 (remote code execution),
// and Google Play's "limited functionality" policy.
//
// Architecture: HYBRID (Option C in playbook/01-apple-4.2.md)
//   - Your web build is BUNDLED (webDir) so the app works offline and the
//     binary is self-contained. This is what makes it "not a web clip".
//   - server.url is intentionally NOT set. Remote data is fetched by the app
//     layer as JSON/assets only. Never point server.url at a page that renders
//     the whole app: that is the exact pattern Apple enforced against in
//     March 2026 under 2.5.2.
//   - server.errorPath gives you a branded offline screen instead of a white
//     one. Reviewers test airplane mode.
//
// Replace every {PLACEHOLDER} before building.

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Reverse-domain app id. MUST be final before your first store upload —
  // it can never be changed on either store.
  appId: '{com.yourco.yourapp}',
  appName: '{Your App}',

  // Your compiled web assets. For Vite: 'dist'. For Next.js static export: 'out'.
  // For CRA: 'build'. This folder is bundled INTO the binary.
  webDir: 'dist',

  // https (not http) on both platforms. This is what keeps cookie-based and
  // OAuth auth working inside the WebView. See playbook/26-webview-auth.md.
  // Setting 'http' or leaving the default local scheme is the #1 cause of the
  // infinite-login-loop bug in AI-built wrappers.
  androidScheme: 'https',

  ios: {
    scheme: 'https',
    contentInset: 'automatic',
    // Append a token so your backend can tell app traffic from web traffic.
    // Useful for feature-flagging iOS-only behaviour (e.g. hiding Stripe).
    appendUserAgent: 'VibeShipNative/1.0',
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: false
  },

  android: {
    // Only for development. Must be false in a release build.
    webContentsDebuggingEnabled: false,
    allowMixedContent: false,
    captureInput: false,
    backgroundColor: '#08090c'
  },

  server: {
    // Branded offline screen shown when a remote resource fails.
    // Lives in your webDir. See starter/offline.html.
    errorPath: 'offline.html',
    androidScheme: 'https',
    cleartext: false,

    // --- READ BEFORE UNCOMMENTING -------------------------------------
    // url: 'https://{app.yoursite.com}',
    //
    // Loading your entire app from a remote URL is legal but it is the
    // highest-risk 4.2 pattern and it makes the app dead offline.
    // If you must use it for a hot-update channel, gate it behind a
    // bundled fallback and keep all native features in the shell.
    // -------------------------------------------------------------------

    // Domains the WebView may navigate to. Anything outside opens in the
    // system browser. Keep this tight — an open allowlist invites a
    // 2.5.2 question.
    allowNavigation: [
      '{app.yoursite.com}',
      '{accounts.google.com}'   // OAuth flows; remove if unused
    ]
  },

  // Production logging off. 'debug' leaks JS console output on device.
  loggingBehavior: 'none',

  // No zoom: a zoomable UI is a browser behaviour and reads as "website".
  zoomEnabled: false,
  backgroundColor: '#08090c',

  plugins: {
    Keyboard: {
      // 'body' resizes the webview so focused inputs are never covered.
      resize: 'body',
      resizeOnFullScreen: true,
      style: 'dark'
    },
    SplashScreen: {
      launchShowDuration: 600,
      launchAutoHide: true,
      backgroundColor: '#08090c',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#6ee7a8',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#08090c',
      overlaysWebView: false   // false = content is pushed below the bar
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    CapacitorHttp: {
      // Route requests through native HTTP to dodge CORS on local origins.
      // Turn OFF if your app depends on browser cookie semantics.
      enabled: false
    }
  }
};

export default config;
