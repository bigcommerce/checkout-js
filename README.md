# IAPP BigCommerce Checkout JS
Hello fellow IAPP developer. First of all, you might be like "Why all this nonsense for a single page on a third party site?".  Wellp the BigCommerce storefront is pulling in tens of millions of dollars per year in revenue, and using the Storefront->Script Manager to over write the default login behavior frequently broke whenever BC updated their markup. Not exactly optimal uptime for an enterprise ecommerce app. We also wanted finer control over checkout experience (maybe add in some promotional code), so here we are!

## Big Commerce Links
[![BC DeepWiki (ai powered)](https://deepwiki.com/badge.svg)](https://deepwiki.com/bigcommerce/checkout-js)\
[Optimized One-Page Checkout](https://support.bigcommerce.com/s/article/Optimized-Single-Page-Checkout)\
[Installing the checkout](https://developer.bigcommerce.com/stencil-docs/customizing-checkout/installing-custom-checkouts)\
[BC CI/CD pipeline: CircleCI](https://circleci.com/gh/bigcommerce/workflows/checkout-js/tree/master)\
[BigCommerce Checkout Git repo we forked](https://github.com/bigcommerce/checkout-js)\

## Requirements

The repo requires the below environment to compile. 

* Node >= v22.
* NPM >= v10.
* Unix-based operating system. (WSL on Windows (they are fibbing here))

But that is really hard to get working on a standard IAPP development laptop because Nicole hates us having Macs. 
To work around this we are going to install a docker environment locally and build from there. 

To install Docker on your local machine, use the "company portal" application installed on your machine (just type that into the search bar).
[Company Portal]( https://iappadmin.atlassian.net/servicedesk/customer/portal/30/article/2616819713?source=search)
You may need to install windows WSL and some other dependencies too, you can request local admin access using our PIM system.
[PIM](https://iappadmin.atlassian.net/servicedesk/customer/article/2921693187)


## Docker Setup

1. Head on over to your local repo directory, which in my case is at: C:\Users\DavidOstrander\00_IappWork\ .
2. Next open up a GitBash terminal. 
3. Run ``` git clone https://github.com/bigcommerce/checkout-js.git ``` to grab a local copy. 
4. RUN ``` cd bigcommerce-checkout-js ```
5. RUN 
```sh 
# Build your local Linux/Node image
docker build -t bigcommerce-checkout .
```
6. RUN 
```sh
# Boot up your image into a working container
docker run -p 8080:8080 -d --name bc-checkout-dev bigcommerce-checkout
```
7. RUN
```sh
# Login to our container and access a terminal
docker exec -it bc-checkout-dev sh
```
8. RUN 
```sh
# install all dependencies
npm ci
```
9. RUN 
```sh
# This will create the build folder in the container and should make your files available locally
npm run dev
```
10. Test to see if your container is serving files: [Localhost](http://localhost:8080) .

If you see an "Index of / " web page, with a bunch of linked files including "auto-loader-dev.js". You are good to go!

## Local Development

From [My Apps](https://myapps.microsoft.com/), click on BigCommerce, and login to the IAPP Akeneo Sandbox.  This BC Instance is configured to import into your browser the files served at http://localhost:8080. So this instance of Sandbox will break for other people using it, as their computers won't be serving those files.

If you are familiar with Docker, most of the time you would mount your repo into the container, so that files you make on your local machine, would be treated as local files by the container. Because we need the NPM run build from the Linux environment, mounting the volume didn't work so hot.  So we are going to make edits to our files in our local VS_Code IDE, Copy the files into the docker container via a terminal command, and manually run the NPM build inside of the container.  

I suggest opening two gitbash terminals, one for copying the file, and one logged into the container to build the files.



```sh
# First terminal: copy files from your local machine to the container 
docker cp ./packages/core/src/app/customer/LoginForm.tsx bc-checkout-dev:/usr/src/app/packages/core/src/app/customer/LoginForm.tsx
```

```sh
#Second terminal: Login to the container
docker exec -it bc-checkout-dev sh
```

```sh
#Second terminal: After copying your files into ther container from your local, build them.
npm run build
```

You should be able to view your changes in the checkout app inside of the IAPP Akeneo Sandbox instance, or (more likely) extremely verbose errors in your npm build terminal. 

## Custom Checkout installation into your store

Follow [this guide](https://developer.bigcommerce.com/stencil-docs/customizing-checkout/installing-custom-checkouts) for instructions on how to fork and install this app as a Custom Checkout in your store.

And enter the local URL for `auto-loader-dev.js` in Checkout Settings, e.g `http://127.0.0.1:8080/auto-loader-dev.js`

## BC CI/CD Release

Everytime a BC PR is merged to the master branch, CircleCI will trigger a build automatically. However, it won't create a new Git release until it is approved by a person with write access to the repository. We should periodically merge in the BC master branch into our fork. That includes adding the parent repo as a git upstream repo and doing some git magic:
```sh
git remote add upstream https://github.com/bigcommerce/checkout-js
git remote -v
git fetch upstream
git checkout master
git merge upstream/master
git push origin master
#at this point our remote fork will be synced with the BC main
```

