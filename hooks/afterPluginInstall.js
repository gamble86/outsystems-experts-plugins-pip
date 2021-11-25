module.exports = function (ctx) {

    const fs = ctx.requireCordovaModule("fs");
    const path = ctx.requireCordovaModule("path");
    const deferral = ctx.requireCordovaModule("q").defer();

    // android platform directory
    var platformAndroidDir = path.join(ctx.opts.projectRoot, 'platforms/android');
    var androidManifestFile = path.join(platformAndroidDir, 'AndroidManifest.xml');

    function changeProperty(inputData, propertyName, targetValue, merge) {
        var hasProperty = (inputData.indexOf(propertyName) > -1);
        var propertyVal = inputData;

        if (hasProperty) {
            if (merge) {
            } else {
                propertyVal = inputData.replace(new RegExp("(.*" + propertyName + "=\")([\\w\\|]+)\"", ""), "$1" + targetValue + "\"");
            }
        } else {
            propertyVal = inputData.replace(/>$/," android:" + propertyName + "=\"" + targetValue + "\" >");
        }
        return propertyVal;
    }

    if (fs.existsSync(androidManifestFile)) {

        fs.readFile(androidManifestFile, 'UTF-8', function (err, data) {
            if (err) {
                deferral.reject(err);
            }
            var mainActReg = /<activity.+name="MainActivity".+>/;
            var actString = data.match(mainActReg)[0];

            var test = changeProperty(actString, "configChanges", "orientation|keyboardHidden|keyboard|screenSize|locale", true);
            //changeProperty(actString, "launchMode", "singleTask", true);
            test = changeProperty(test, "supportsPictureInPicture", "true", false);
            test = changeProperty(test, "resizeableActivity", "true", false);

            var finalData = data.replace(mainActReg, test);

            fs.writeFile(androidManifestFile, finalData, 'UTF-8', function (err) {
                if (err) {
                    deferral.reject(err);
                }
                deferral.resolve();
            })
        });
    }

    return deferral;
};
