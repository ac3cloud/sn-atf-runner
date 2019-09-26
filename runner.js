// setup puppeteer
const puppeteer = require('puppeteer');
var pOpts = {
  executablePath: 'google-chrome-unstable',
  windowSize: '1920,1080',
  appShellHostWindowSize: '1920x1080',
  contentShellHostWindowSize: '1920x1080',
  args: [
    '--incognito',
    '--disable-dev-shm-usage',
    '--no-sandbox'
  ]
}

// env variables populating the url and credentials
var loginUrl = 'https://'+process.env.SN_INSTANCE_NAME+'.service-now.com/side_door.do';
var atfUrl;
if (process.env.RUNNER_SCHEDULED && process.env.RUNNER_SCHEDULED == 'true') {
  atfUrl = 'https://'+process.env.SN_INSTANCE_NAME+'.service-now.com/atf_test_runner.do?sysparm_scheduled_tests_only=true';
} else {
  atfUrl = 'https://'+process.env.SN_INSTANCE_NAME+'.service-now.com/atf_test_runner.do';
}
var username = process.env.SN_USERNAME;
var password = process.env.SN_PASSWORD;

// now start puppeteer with the predefined options
puppeteer.launch(pOpts).then(async browser => {
  var page = await browser.newPage();
  page.setViewport({width: 1920, height: 1080, deviceScaleFactor: 2});

  page.on('pageerror', error => {
    console.log(error.message);
   });
  page.on('requestfailed', request => {
    console.log(request.failure().errorText, request.url);
  });
  process.on("unhandledRejection", (reason, p) => {
    console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
  });

  // browse to the side_door login url
  await page.goto(loginUrl, {timeout: 80000});
  console.log('navigating to login page');
  await page.waitFor(2000);
  // if strange issues are experienced, uncomment this and the other screenshot commands to see what's actually happening
  // await page.screenshot({fullPage: true, path: 'login.png'});

  // find the iframe that contains the login form, because it wouldn't be a SNow script without an eternal battle with frames
  var frames = await page.frames();
  var loginFrame = frames.find(f => f.url().indexOf("welcome.do") > 0);

  // wait for the css selector to become visible before proceeding
  if (await loginFrame.$('#loginPage') !== null) {
    console.log('not logged in');
    await loginFrame.waitForSelector('#user_name', {'visible': true});
    var userSelector = await loginFrame.$('#user_name');
    await userSelector.focus();
    await userSelector.type(username);
    await page.waitFor(121);
    var passSelector = await loginFrame.$('#user_password');
    await passSelector.focus();
    await passSelector.type(password);
    await page.waitFor(206);
    await loginFrame.tap('#sysverb_login');
    await page.waitFor(10000);
  } else {
    // if we're here, then it means that the css selector just never showed up. This can mean lots of different things, some of which may possibly be bad
    console.log('already logged in or error loading login page');
    await page.waitFor(10000);
  }
  // await page.screenshot({path: 'post-login.png'});

  // now we're logged in, we can go straight to the atf_test_runner url, wait for an arbitrary period because waiting is nice, then you're good to go
  await page.goto(atfUrl, {timeout: 80000});
  await page.waitFor(10000);
  console.log('test runner ready');
  // await page.screenshot({path: 'test-runner.png'});

  // note the lack of browser close - this script will run indefinitely (and uncleanly), but since it's all in a docker container, it should hopefully not cause any problems. It may be worth a cron'd restart to cleanup chrome memory leaks.
});