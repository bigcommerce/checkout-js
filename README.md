# Checkout JS
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/bigcommerce/checkout-js)

Checkout JS is a browser-based application providing a seamless UI for BigCommerce shoppers to complete their checkout. It is also known as [Optimized One-Page Checkout](https://support.bigcommerce.com/s/article/Optimized-Single-Page-Checkout), which is currently the recommended checkout option for all BigCommerce stores.

## Requirements

In order to build from the source code, you must have the following set up in your development environment.

* Node >= v22.
* NPM >= v10.
* Unix-based operating system. (WSL on Windows)

One of the simplest ways to install Node is using [NVM](https://github.com/nvm-sh/nvm#installation-and-update). You can follow their instructions to set up your environment if it is not already set up.

## Development

Once you have cloned the repository and set up your environment, you can start developing with it.

First, you have to pull in the dependencies required for the application.

```sh
npm ci
```

After that, you can make changes to the source code and run the following command to build it.

```sh
npm run build
```

### Development Server

For local development, you have several options:

#### Full Development Server (Recommended)
Run everything with a single command that combines webpack build watching and HTTP server:

```sh
npm run dev:full
```

This will:
- Start webpack in watch mode for automatic rebuilds
- Start an HTTP server on http://localhost:8080 with CORS enabled
- Display the auto-loader URL for Custom Checkout integration

#### Development Server with HTTPS Tunnel
For testing with live HTTPS websites, you can enable Cloudflare Tunnels:

```sh
npm run dev:tunnel
```

This provides:
- All features of `dev:full`
- An HTTPS tunnel URL (e.g., `https://abc123.trycloudflare.com`)
- Automatic tunnel URL display for easy Custom Checkout integration

#### Manual Development (Legacy)
If you prefer the traditional two-step approach:

```sh
# Terminal 1: Start webpack in watch mode
npm run dev

# Terminal 2: Start the HTTP server
npm run dev:server
```

#### Environment Variables
You can customize the development server behavior using environment variables:

```sh
# Enable tunnel mode
DEV_SERVER_TUNNEL=true npm run dev:full

# Change port
DEV_SERVER_PORT=3000 npm run dev:full

# Enable verbose logging
DEV_SERVER_VERBOSE=true npm run dev:full

# Custom cloudflared path
CLOUDFLARED_PATH=/usr/local/bin/cloudflared npm run dev:tunnel
```

If you want to create a prerelease (i.e.: `alpha`) for testing in the integration environment, you can run the following command:

```sh
npm run release:alpha
```

After that, you need to push the prerelease tag to your fork so it can be referenced remotely.

### Testing

To run E2E tests, use the following command:

```sh
npm run e2e
```

The E2E tests in this project use HAR files to stub network calls. If you need to manually update the HAR files to make minor changes to the requests, you must run the command below to regenerate the ID for each updated request. Otherwise, the stubs will not function properly.

```sh
npm run regenerate-har
```

## Custom Checkout installation

Follow [this guide](https://developer.bigcommerce.com/stencil-docs/customizing-checkout/installing-custom-checkouts) for instructions on how to fork and install this app as a Custom Checkout in your store.

### For Development Testing

#### Using the Enhanced Development Server (Recommended)
```sh
# Local development with HTTP
npm run dev:full
# Then use: http://localhost:8080/auto-loader-dev.js

# For HTTPS testing with live stores
npm run dev:tunnel
# The tunnel URL will be displayed (e.g., https://abc123.trycloudflare.com/auto-loader-dev.js)
```

#### Using the Legacy Method
If you want to test your checkout implementation manually, you can run:
```sh
npm run dev:server
```

And enter the local URL for `auto-loader-dev.js` in Checkout Settings, e.g `http://127.0.0.1:8080/auto-loader-dev.js`

**Note:** The HTTPS tunnel option is particularly useful when testing with live BigCommerce stores that require HTTPS connections.

## Release

Everytime a PR is merged to the master branch, CircleCI will trigger a build automatically. However, it won't create a new Git release until it is approved by a person with write access to the repository. If you have write access, you can approve a release job by going to [CircleCI](https://circleci.com/gh/bigcommerce/workflows/checkout-js/tree/master) and look for the job you wish to approve. You can also navigate directly to the release job by clicking on the yellow dot next to the merged commit.


## Contribution

More information can be found in the [contribution guide](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md) for this project.


Copyright (C) 2019-Present BigCommerce Inc. All rights reserved.
