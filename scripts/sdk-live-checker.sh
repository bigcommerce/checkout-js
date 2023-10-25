#!/bin/bash

npm ci

# Make sure current version of @bigcommerce/checkout-sdk exists on the CDN
CURRENT_VERSION=`npm list --depth=0 | grep checkout-sdk | sed -E 's/.*@//'`
HTTP_STATUS=`curl -s -o /dev/null -I -w "%{http_code}" https://checkout-sdk.bigcommerce.com/v1/loader-v${CURRENT_VERSION}.js`
if [[ $HTTP_STATUS == "200" ]]; then
  # Status 200, return OK
  exit 0
else
  # Status not 200, return error
  exit 1
fi
