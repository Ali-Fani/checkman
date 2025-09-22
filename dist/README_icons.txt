# Checkman PWA Icons - checkman.alifani.ir

This directory contains all the PWA icons and assets for the Check Manager application.

## Icon Files

### PWA Icons (SVG)
- `icon-96.svg` - 96x96px (Small devices)
- `icon-128.svg` - 128x128px (Standard devices)
- `icon-192.svg` - 192x192px (Minimum PWA requirement)
- `icon-512.svg` - 512x512px (High-resolution displays)
- `favicon.svg` - 32x32px (Browser tab icon)

### Feature Graphics
- `checkman-features.svg` - 800x600px (Marketing/Feature showcase)
- `README_features.svg` - Documentation

## Vite-PWA Plugin Integration

The PWA configuration is handled by the vite-pwa plugin in `vite.config.js`:

### App Configuration
- **App Name**: "چک من" (Your preferred branding)
- **Theme Color**: #2563eb (Persian blue from your CSS variables)
- **Language**: Persian (fa) with RTL support
- **Categories**: Finance, productivity, business

### Icon Integration
- All SVG icons are automatically included by vite-pwa
- Icons serve both "any" and "maskable" purposes
- Optimized for all device sizes (96px to 512px)
- Vector format ensures crisp rendering at any scale

### Features
- **Auto-Generated Manifest**: vite-pwa creates manifest.json automatically
- **Service Worker**: Automatic registration and updates
- **App Shortcuts**: Persian quick actions for common tasks
- **Font Caching**: Persian fonts cached for offline usage
- **Workbox Integration**: Advanced caching strategies

## Technical Specifications

### Icon Requirements Met:
- ✅ 192x192 (minimum PWA requirement)
- ✅ 512x512 (high-resolution displays)
- ✅ Multiple sizes for different devices
- ✅ SVG format for scalability
- ✅ Proper MIME types
- ✅ Maskable and any purposes

### PWA Features:
- Standalone display mode
- Persian language support (fa)
- RTL text direction
- Custom theme colors (#2563eb)
- App shortcuts in Persian
- Offline capability indicators

## Deployment Notes

For deployment on checkman.alifani.ir:
1. All SVG icons are optimized for fast loading
2. Icons work at all sizes from 32px to 512px
3. Persian text renders correctly across devices
4. Glassmorphism effects enhance visual appeal
5. Icons maintain brand consistency with CSS variables

## Color Palette
- Primary Blue: #2563eb → #3b82f6 (gradient)
- Background: Transparent with glassmorphism effects
- Text: White on blue background
- Persian Text: "چک" (Check) and "مدیریت چک" (Check Management)

## Browser Support
- Modern browsers with PWA support
- Mobile Safari, Chrome Mobile, Firefox Mobile
- Desktop Chrome, Firefox, Safari, Edge
- All browsers with SVG support

## Usage with Vite-PWA

The PWA is automatically configured by vite-pwa plugin:

### In `vite.config.js`:
- All icons are included via `includeAssets`
- Manifest is generated with Persian language support
- Service worker is automatically registered
- Font caching is configured for offline Persian text

### In `index.html`:
- Only basic meta tags needed (theme-color, apple-mobile-web-app)
- Icons are handled automatically by the plugin
- No manual manifest link required

## App Shortcuts
1. "چک جدید" (New Check) - Quick access to add new checks
2. "چک‌های پیش رو" (Upcoming Checks) - View upcoming checks

## Performance
- All icons are SVG (vector) for small file sizes
- Optimized for 60fps animations
- Fast loading across all network conditions
- Suitable for offline PWA usage