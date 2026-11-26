# Deploying to Vercel

Tosyn has two sites, each its own Vercel project built from this one repository. There is no custom
domain, so each lives on a free `vercel.app` address. Every push to `main` goes live, and every pull
request gets a private preview.

| Site       | Vercel project | Address                   | Root Directory    | Preset  |
| ---------- | -------------- | ------------------------- | ----------------- | ------- |
| Docs       | `tosynui`      | `tosynui.vercel.app`      | `apps/docs`       | Next.js |
| Playground | `play.tosynui` | `play-tosynui.vercel.app` | `apps/playground` | Vite    |

Project names are first come, first served. If Vercel gives a different address, set it in the
environment variables below and tell the maintainers so the `homepage` fields can be updated.

## Create the projects

1. Sign in at vercel.com with GitHub. Choose **Create New**, then **Project**, and import
   `alisulmanpro/TosynUI`.
2. Name it `tosynui`, set **Root Directory** to `apps/docs`, choose the Next.js preset, add the
   environment variable `ENABLE_EXPERIMENTAL_COREPACK=1`, and deploy.
3. Import the same repository a second time. Name it `play.tosynui`, set **Root Directory** to
   `apps/playground`, choose the Vite preset, add the same environment variable, and deploy.
4. In each project, open **Settings**, **Build and Deployment**, **Root Directory** and turn on
   **Skip deployment**. Then open **Deployment Protection** and check that it is **Standard
   Protection**.
5. Open both addresses in a private browser window. They must load without signing in.

## Settings that matter

- **Include files outside the root directory:** leave it on (the default). Both apps use
  `@tosynui/*` packages from the workspace.
- **`ENABLE_EXPERIMENTAL_COREPACK=1`:** the root `package.json` pins `pnpm@12.18.0`. Vercel normally
  picks the pnpm version from the lockfile; Corepack pins the exact version.
- **Node.js:** no change. Vercel's default is 24.x and the `engines` range resolves to it.
- **Standard Protection:** previews and the long generated URLs need a Vercel login. Production
  addresses stay public. To show a preview to someone without a Vercel account, add a Deployment
  Protection Exception for it.

## Addresses in the code

Each app has one small `site` file that holds the addresses of the sites, so nothing else
hardcodes them.

| Variable                        | Used by    | Meaning                                                  |
| ------------------------------- | ---------- | -------------------------------------------------------- |
| `VERCEL_PROJECT_PRODUCTION_URL` | Docs       | Set by Vercel. Production host, used for canonical links |
| `NEXT_PUBLIC_PLAYGROUND_URL`    | Docs       | Playground address. Defaults to the `vercel.app` address |
| `VITE_DOCS_URL`                 | Playground | Docs address. Defaults to the `vercel.app` address       |

These variables are listed under `build.env` in `turbo.json`, so Turborepo passes them to the build
and a changed address invalidates the cache. Do not use `VERCEL_URL` for links: Standard Protection
locks it.

When a domain is added later, change these variables in Vercel and redeploy.

## If the first build fails

| Symptom in the build log                                            | Fix                                                                                                                  |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Vercel uses npm, or fails on `workspace:*`                          | Check `ENABLE_EXPERIMENTAL_COREPACK=1` is set for that environment, then redeploy with build cache off.              |
| "Could not enable corepack: package.json is missing packageManager" | Add the same `"packageManager": "pnpm@12.18.0"` line to `apps/docs/package.json` and `apps/playground/package.json`. |
| Still the wrong pnpm version                                        | Set Install Command to `npx pnpm@12.18.0 install --frozen-lockfile`.                                                 |
| The playground cannot find `@tosynui/*` build output                | Set Build Command to `cd ../.. && pnpm turbo run build --filter=@tosynui/playground...` (same idea for docs).        |

## Check a deployment

- The docs address lists all eight elements and has a link to the playground.
- The playground renders an example in the light and dark theme and has a link to the reference.
- A test pull request shows two preview links.
