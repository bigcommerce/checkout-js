# Checkout JS

Checkout JS is a browser-based application providing a seamless UI for BigCommerce shoppers to complete their checkout. It is also known as [Optimized One-Page Checkout](https://support.bigcommerce.com/s/article/Optimized-Single-Page-Checkout), which is currently the recommended checkout option for all BigCommerce stores.

## Limited Beta

Please note that we are currently in Limited Beta. For external parties, in order to have access to the source code, you must agree and sign our Beta License Program Document. Although we intend to eventually open-source this software, it is still a private software at this stage. For specific information about the terms and conditions of this beta, please refer to the aforementioned document.

## Requirements

In order to build from the source code, you must have the following set up in your development environment.

* Node >= v10.
* NPM >= v3.

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

## Theme integration

In the checkout template of your theme, you have to include a script tag that points to the loader file of this application. The loader file is responsible for loading the all the required assets, located in the `dist` folder, and inserting them on the page. You will need to find a way to serve these assets, i.e.: via a CDN provider, that is best suited to your needs.

Below is an example showing you how you could use the loader file to load and initialize the application.

```html
<div id="app"></div>

<script src="https://cdn.foo.bar/checkout-js/loader-1.2.3.js"></script>

<script>
    checkoutLoader.loadFiles({ publicPath: 'https://cdn.foo.bar/checkout-js/' })
        .then(({ renderCheckout }) => {
            renderCheckout({
                checkoutId: '{{ checkout.id }}',
                containerId: 'app',
            });
        });
</script>
```

For the order confirmation page, the instruction is similar. But instead, you will need to call a different initialization method.

```html
<script>
    checkoutLoader.loadFiles({ publicPath: 'https://cdn.foo.bar/checkout-js/' })
        .then(({ renderOrderConfirmation }) => {
            renderOrderConfirmation({
                orderId: '{{ checkout.order.id }}',
                containerId: 'app',
            });
        });
</script>
```

To make it easier for you, we have prepared a command that you can run to start a static web server for local development.

```sh
npm run dev:server
```

After starting the server, you can reference the loader file that it serves (i.e.: `http://localhost:8080/loader.js`) in your theme.


## Release

Everytime a PR is merged to the master branch, CircleCI will trigger a build automatically. However, it won't create a new Git release until it is approved by a person with write access to the repository. If you have write access, you can approve a release job by going to [CircleCI](https://circleci.com/gh/bigcommerce/workflows/checkout-js/tree/master) and look for the job you wish to approve. You can also navigate directly to the release job by clicking on the yellow dot next to the merged commit.


## Contribution

We currently do not accept Pull Requests from external parties. However, if you are an external party and want to report a bug or provide your feedback, you are more than welcome to raise a GitHub Issue. We will attend to these issues as quickly as we can. 

More information can be found in the [contribution guide](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md) for this project.


Copyright (C) 2019-Present BigCommerce Inc. All rights reserved.
