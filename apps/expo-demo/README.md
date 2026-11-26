# Tosyn Expo demo

The three example screens rendered with `@tosynui/render-react-native`. Switch screen, mode
(system, light, dark) and brand at the top. The BMI screen calculates a result when you press
Calculate BMI, to show how an app fills a `<result>`.

```text
pnpm install
pnpm build            # builds the packages the demo imports
pnpm --filter @tosynui/expo-demo start
```

Open it in Expo Go on your phone (scan the QR code) or press `a` for an Android emulator or `i`
for the iOS simulator. After you change an example in `examples/`, run
`pnpm --filter @tosynui/expo-demo generate`.

It does not start with `pnpm dev` and has no build step. CI only lints and type-checks it; the Vercel deployments do not use it.
