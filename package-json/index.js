// just run with start scripts  and check for name like 'npm_'
console.log("NPM PACKAGE NAME:", process.env.npm_package_name);
console.log("NPM PACKAGE VERSION:", process.env.npm_package_version);
console.log("NPM PACKAGE DESCRIPTION:", process.env.npm_package_description);
console.log("NPM PACKAGE LICENSE:", process.env.npm_package_license);

const npmEnvVariables = Object.keys(process.env)
  .filter(key => key.startsWith('npm_'))
  .reduce((obj, key) => {
    obj[key] = process.env[key];
    return obj;
  }, {});

// Print the filtered npm_* environment variables
console.log("NPM Environment Variables:", npmEnvVariables);

/**
 * NOTE IF YOU DON't RUN THIS THROUGH SCRIPTS, ALL THESE VARIABLES WILL BE UNDEFINED
 * NPM PACKAGE NAME: undefined
   NPM PACKAGE VERSION: undefined
   NPM PACKAGE DESCRIPTION: undefined
   NPM PACKAGE LICENSE: undefined
   NPM Environment Variables: {}
 */