#!/bin/bash

set -e

src_dir="$1"
dst_url="$2"
user_name="$user_name"
password="$password"

check_response() {
  response_code="$1"
  if [ $response_code -gt 299 ] ; then
    echo "Curl command failed, status code: $response_code"
    exit 1
  fi
}

echo "Creating dir $dst_url"
response=$(curl -L -s -w "%{http_code}" --digest --http1.1 --output /dev/null  --user $user_name:$password -X MKCOL $dst_url )
check_response $response

for file in "$src_dir"/*; do
  if [ -d "$file" ]; then
    echo "Copying subdirectory $file"
    sh "$0" "$file" "$dst_url/$(basename "$file")"
  else
    echo "Copying $file" to $dst_url/$(basename $file)
    response=$(curl -L -s -w "%{http_code}" --digest --http1.1 --output /dev/null --user $user_name:$password --upload-file $file $dst_url/$(basename $file))
    check_response $response
  fi
done


