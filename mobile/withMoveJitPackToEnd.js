const { withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to:
 * 1. Move JitPack repository to the end of the repositories list.
 * 2. Pin stripeVersion to a static version to avoid dynamic resolution timeouts.
 */
module.exports = function withMoveJitPackToEnd(config) {
    return withProjectBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            config.modResults.contents = addStripeVersion(config.modResults.contents);
            config.modResults.contents = moveJitPackToEnd(config.modResults.contents);
        }
        return config;
    });
};

function addStripeVersion(buildGradle) {
    // If stripeVersion is already defined, we'll try to override it or skip
    if (buildGradle.includes('stripeVersion')) {
        return buildGradle;
    }

    // Inject into allprojects { ext { ... } } or just allprojects { ... }
    const allProjectsRegex = /(allprojects\s*\{)/;
    if (allProjectsRegex.test(buildGradle)) {
        return buildGradle.replace(allProjectsRegex, (match) => {
            return `${match}\n    ext.stripeVersion = "21.22.0"`;
        });
    }
    return buildGradle;
}

function moveJitPackToEnd(buildGradle) {
    // Matching both with and without www
    const jitpackRegex = /maven\s*\{\s*url\s*['"]https:\/\/(www\.)?jitpack\.io['"]\s*\}/g;

    if (!jitpackRegex.test(buildGradle)) {
        return buildGradle;
    }

    // Remove all occurrences
    const cleanedGradle = buildGradle.replace(jitpackRegex, '');

    // Re-add to the allprojects.repositories block
    const repoBlockRegex = /(allprojects\s*\{[\s\S]*?repositories\s*\{)([\s\S]*?)(\s*\}\s*\})/g;

    return cleanedGradle.replace(repoBlockRegex, (match, morning, contents, evening) => {
        if (contents.includes('https://jitpack.io')) {
            return match;
        }
        return `${morning}${contents.trimEnd()}\n        maven { url 'https://jitpack.io' }\n    ${evening}`;
    });
}
