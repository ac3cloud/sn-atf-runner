#!/bin/sh

cd /app

if [ -z "$NODE_ENV" ]; then
  echo "NODE_ENV was not set -- Defaulting to production"
  NODE_ENV=production
fi

if [ -z "$APP_NAME" ]; then
  echo "APP_NAME was not set -- Defaulting to atf-runner"
  APP_NAME=atf-runner
fi

if [ -z "$SN_INSTANCE_NAME" ]; then
  echo "SN_INSTANCE_NAME was not set -- Defaulting to example"
  SN_INSTANCE_NAME=example
fi

if [ -z "$SN_USERNAME" ]; then
  echo "SN_USERNAME was not set -- Defaulting to username"
  SN_USERNAME=username
fi

if [ -z "$SN_PASSWORD" ]; then
  echo "SN_PASSWORD was not set -- Defaulting to password"
  SN_PASSWORD=password
fi

if [ -z "$RUNNER_SCHEDULED" ]; then
  echo "RUNNER_SCHEDULED was not set -- Defaulting to true"
  RUNNER_SCHEDULED=true
fi

if [ -z "$SIDE_DOOR" ]; then
  echo "SIDE_DOOR was not set -- Defaulting to true"
  SIDE_DOOR=false
fi


## Make required changes to process-default.json for environment variable support
sed -i "/NODE_ENV/c\   \"NODE_ENV\" : \"$NODE_ENV\"," /app/process-default.json
sed -i "/APP_NAME/c\   \"APP_NAME\" : \"$APP_NAME\"," /app/process-default.json
sed -i "/SN_INSTANCE_NAME/c\   \"SN_INSTANCE_NAME\" : \"$SN_INSTANCE_NAME\"," /app/process-default.json
sed -i "/SN_USERNAME/c\   \"SN_USERNAME\" : \"$SN_USERNAME\"," /app/process-default.json
sed -i "/SN_PASSWORD/c\   \"SN_PASSWORD\" : \"$SN_PASSWORD\"," /app/process-default.json
sed -i "/RUNNER_SCHEDULED/c\   \"RUNNER_SCHEDULED\" : \"$RUNNER_SCHEDULED\"," /app/process-default.json
sed -i "/SIDE_DOOR/c\   \"SIDE_DOOR\" : \"$SIDE_DOOR\"" /app/process-default.json

## Create default process.json file for pm2 server
## Comment out this line if you wish to have changes to process.json persist
cp ./process-default.json ./process.json

pm2-runtime process.json