const { withAppBuildGradle } = require('@expo/config-plugins');

const OLD_SIGNING_CONFIGS = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`;

const NEW_SIGNING_CONFIGS = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile rootProject.file("../" + keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }`;

const OLD_RELEASE_SIGNING =
  '            // see https://reactnative.dev/docs/signed-apk-android.\n            signingConfig signingConfigs.debug';
const NEW_RELEASE_SIGNING =
  '            // see https://reactnative.dev/docs/signed-apk-android.\n            signingConfig keystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug';

const KEYSTORE_LOADER = `def keystorePropertiesFile = rootProject.file("../keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {`;

// Google Play용 release 서명을 위한 커스텀 config plugin.
// android/ 전체가 `expo prebuild --clean`마다 새로 생성되기 때문에, 여기서
// android/app/build.gradle을 직접 고쳐두면 다음 prebuild 때 사라진다. 대신
// keystore.properties + *.jks 파일은 프로젝트 루트(gitignore 대상)에 따로
// 보관하고, 이 플러그인이 prebuild 때마다 build.gradle에 서명 설정을
// 자동으로 다시 주입한다. keystore.properties가 없으면(예: CI, 다른 개발자
// 환경) 조용히 debug 키로 폴백해서 빌드 자체는 항상 되게 한다.
const withReleaseSigningConfig = (config) => {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('keystorePropertiesFile')) {
      contents = contents.replace('android {', KEYSTORE_LOADER);
    }

    if (!contents.includes('signingConfigs.release')) {
      contents = contents.replace(OLD_SIGNING_CONFIGS, NEW_SIGNING_CONFIGS);
    }

    if (contents.includes(OLD_RELEASE_SIGNING)) {
      contents = contents.replace(OLD_RELEASE_SIGNING, NEW_RELEASE_SIGNING);
    }

    config.modResults.contents = contents;
    return config;
  });
};

module.exports = withReleaseSigningConfig;
