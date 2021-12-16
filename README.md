# Checkout JS

Checkout JS is a browser-based application providing a seamless UI for BigCommerce shoppers to complete their checkout. It is also known as [Optimized One-Page Checkout](https://support.bigcommerce.com/s/article/Optimized-Single-Page-Checkout), which is currently the recommended checkout option for all BigCommerce stores.

## Obundle Local Development Tips

Local development for the open-source checkout is not particularly intuitive but it will be improving in the near future according to the BigCommerce developers on their GitHub repo. For the time being, we have to cobble together a pattern that is cumbersome but workable.

First, `git clone` this repo which is connected to BC's main repo. You **must** have this repo connected so it can pull updates with our approval. There are PCI Compliance legal issues that are maintained by BC, so we must allow for updates to be served from upstream.

Second, follow the instructions laid out in the sections below (use Obundle's Sandbox store as your live store for development purposes) until you are finished with the **Custom Checkout installation** section. You should have 3 things running concurrently:
1. `stencil start` local BC theme connected to custom checkout build on `http://localhost:3000` (see Obundle Sandbox Credentials)
2. `nvm use 14 or higher` - Install Node Version Manager so you can easily switch between Node version; the checkout requires Node version 14 or higher since that is what I installed it with. However, any new checkouts can be Node version 10 or higher
3. `npm run dev` to launch the webpack watcher, TypeScript compiler, and app builder
4. `npm run dev:server` to serve the build to the local address on your store (ex: `http://127.0.0.1:8080`)

**Important:** The build provided by `npm run dev` is cached the first time you load `localhost` so you'll see your first changes but no subsequent changes will display on refresh. Instead, use a *hard refresh* (Mac: cmd + shift + R, PC: shift + F5) which clears the cache and will show your changes.

#### Obundle Sandbox Credentials

Add these to the newest theme from Mirelli Chocolatier's [GitHub repo](https://github.com/oBundle/ob-mirelli-chocolatier). That way you can test any changes to the checkout without disrupting the store's current checkout.

**config.stencil.json**
```
{
  "customLayouts": {
    "brand": {},
    "category": {},
    "page": {},
    "product": {}
  },
  "apiHost": "https://api.bigcommerce.com",
  "normalStoreUrl": "https://store-4o6xa.mybigcommerce.com/",
  "port": "3000"
}
```

**secrets.stencil.json**
```
{
  "accessToken": "t1nrnl3cp8cy6ep6pti7cqkjm122s62"
}
```

## Requirements

In order to build from the source code, you must have the following set up in your development environment.

* Node >= v10.
* NPM >= v3.
* Unix-based operating system.

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

If you are developing the application locally and want to build the source code in watch mode, you can run the following command:

```sh
npm run dev
```

If you want to create a prerelease (i.e.: `alpha`) for testing in the integration environment, you can run the following command:

```sh
npm run release:alpha
```

After that, you need to push the prerelease tag to your fork so it can be referenced remotely.

## Custom Checkout installation

Follow [this guide](https://developer.bigcommerce.com/stencil-docs/customizing-checkout/installing-custom-checkouts) for instructions on how to fork and install this app as a Custom Checkout in your store.

If you want to test your checkout implementation, you can run:
```sh
npm run dev:server
```

And enter the local URL for `auto-loader-dev.js` in Checkout Settings, e.g `http://127.0.0.1:8080/auto-loader-dev.js`

## Release

Everytime a PR is merged to the master branch, CircleCI will trigger a build automatically. However, it won't create a new Git release until it is approved by a person with write access to the repository. If you have write access, you can approve a release job by going to [CircleCI](https://circleci.com/gh/bigcommerce/workflows/checkout-js/tree/master) and look for the job you wish to approve. You can also navigate directly to the release job by clicking on the yellow dot next to the merged commit.


## Contribution

We currently do not accept Pull Requests from external parties. However, if you are an external party and want to report a bug or provide your feedback, you are more than welcome to raise a GitHub Issue. We will attend to these issues as quickly as we can.

More information can be found in the [contribution guide](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md) for this project.


Copyright (C) 2019-Present BigCommerce Inc. All rights reserved.
