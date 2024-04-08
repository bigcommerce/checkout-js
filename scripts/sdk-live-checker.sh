#!/bin/bash

npm ci --silent
if [ $? -ne 0 ]; then
  echo
  echo '❌ Error: `npm ci` failed, aborting.'
  exit 1
fi

# Make sure current version of @bigcommerce/checkout-sdk exists on the CDN
CURRENT_VERSION=`npm list --depth=0 | grep checkout-sdk | sed -E 's/.*@//'`
echo
echo "ℹ️  Checking presence of checkout SDK on CDN..."
HTTP_STATUS=`curl -s -o /dev/null -I -w "%{http_code}" https://checkout-sdk.bigcommerce.com/v1/loader-v${CURRENT_VERSION}.js`
if [[ $HTTP_STATUS == "200" ]]; then
  # Status 200, return OK
  echo "✅ Checkout-sdk version ${CURRENT_VERSION} found on CDN"
  exit 0
else
  # Status not 200, return error
  echo "⚠️ Checkout-sdk version ${CURRENT_VERSION} not found on CDN. HTTP status returned: ${HTTP_STATUS}"
  exit 1
fi
