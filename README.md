**Note:** This utility is redundant now that ServiceNow have built an out of box solution for running ATF using a headless browser. Search their documentation for _Headless Browser for Automated Test Framework_

# sn-atf-runner
Dockerised Automated Test Framework runner for ServiceNow. This service persistently holds a session in ServiceNow's 'scheduled test runner' window through the use of [Puppeteer](https://github.com/GoogleChrome/puppeteer) - a wrapper for headless Google Chrome.

The script logs in through the main login page or side_door if you are using SAML, then navigates to the runner page and waits for a test to start.

# Setup

Create `.env` file (or copy `.env-example`) and populate the variables:

```
SN_INSTANCE_NAME=example
SN_USERNAME=user
SN_PASSWORD=pass
RUNNER_SCHEDULED=true|false
SIDE_DOOR=true|false
```
* `SN_INSTANCE_NAME` should be the unique part of your instance URL, e.g. if your URL is https://example.service-now.com/, then `SN_INSTANCE_NAME=example`
* `SN_USERNAME` and `SN_PASSWORD` are the credentials for the user that will be running the tests. Ensure this user has sufficient permissions to run tests
* `RUNNER_SCHEDULED` should be set to `true` if you want the test runner to be for scheduled tests. This should be the case in most scenarios. If you do want to use the runner for manual tests, ensure that the username and password is the same user that will be executing the tests. Defaults to `true`.
* `SIDE_DOOR` should be set to `true` if you use SAML and need to come in through the side_door.do URL. If `false`, welcome.do is used. Defaults to `false`.

Build the container:
```
docker-compose build
```

You should now be able to run the container either in the foreground `docker-compose up` or background `docker-compose up -d`.

* The container will be named based on the `SN_INSTANCE_NAME` variable, e.g. `atf-runner-example`. This allows you to identify different test runners for different environments
* To confirm the correct name, run `docker ps`
* To follow logs, you can run `docker logs -f atf-runner-example`, replacing with the actual name
* To shutdown and remove the container, run `docker-compose down`
* If you make changes to the app for testing, you will need to re-build the image, run `docker-compose down && docker-compose up --build`
