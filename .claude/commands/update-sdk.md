Update the BigCommerce Checkout SDK to the latest version by running the following steps in the project root directory:

1. Checkout master:
```
git checkout master
```

2. Fetch upstream and rebase onto upstream/master:
```
git fetch upstream && git rebase upstream/master
```

3. Resolve the latest SDK version and create a new branch:
```
SDK_VERSION=$(npm view @bigcommerce/checkout-sdk version | tr '.' '-') && git checkout -b sdk-bump-${SDK_VERSION}
```

4. Reinstall all dependencies cleanly:
```
npm ci
```

5. Install the latest SDK:
```
npm i @bigcommerce/checkout-sdk@latest
```

Use the Bash tool to execute these commands sequentially in the project root directory.
