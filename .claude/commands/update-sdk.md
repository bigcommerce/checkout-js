Update the BigCommerce Checkout SDK to the latest version by running the following steps in the project root directory:

1. Fetch upstream and create a new branch from upstream/master. Use the Bash tool to resolve the version dynamically:
```
git fetch upstream && SDK_VERSION=$(npm view @bigcommerce/checkout-sdk version | tr '.' '-') && git checkout -b sdk-bump-${SDK_VERSION} upstream/master
```

2. Reinstall all dependencies cleanly:
```
npm ci
```

3. Install the latest SDK:
```
npm i @bigcommerce/checkout-sdk@latest
```

Use the Bash tool to execute these commands sequentially in the project root directory.
