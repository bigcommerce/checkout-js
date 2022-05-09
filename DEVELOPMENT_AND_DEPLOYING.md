# Development

To develop with this project you need to run it locally and connect it with your Big Commerce store.

1. Run `npm run dev` and wait for it to finish. Keep this open.

2. In another command line, run `npm run dev:server`. Keep this open.

3. Login to Big Commerce and navigate to your chosen store's admin panel (usually a staging store). From here, navigate to Advanced Settings > Checkout and scroll down to the Custom Checkout Setting panel. Replace the Script URL with the URL of the local project, e.g. `http://127.0.0.1:8080/auto-loader-dev.js`.

# Deploying

To deploy this project to a Big Commerce store you need to build your local version and upload it to WebDAV.

1. Locate the project's `package.json` file and increment the version number. Note that the build files will automatically increment the version number by 1 again (e.g. `1.203.0` in `package.json` will become `1.204.0` in the built files)

2. Run `npm run build` to generate a `/dist` folder with your build files.

3. Download [Cyberduck](https://cyberduck.io/) and connect to your Big Commerce store (credentials can be found from your store's admin panel Server Settings > File Access (WebDAV)).

4. In your Big Commerce store's admin panel, navigate to `/content/checkout` (create this folder if it doesn't exist)

5. Copy the contents from your local build in the `/dist` to the `/checkout` folder.

6. In your Big Commerce store's admin panel, navigate to Advanced Settings > Checkout and scroll down to the Custom Checkout Setting panel. Replace the Script URL with the `webdav:checkout/auto-loader-<version>.js` where `<version>` matches the version number in your `/dist` file. (This is used to avoid serving a cached version to the user).
