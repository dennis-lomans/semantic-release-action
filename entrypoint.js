const core = require('@actions/core');
const semanticRelease = require('semantic-release');
const execSync = require('child_process').execSync;

/**
 * Run semantic-release.
 *
 * @see https://github.com/semantic-release/semantic-release/blob/master/docs/developer-guide/js-api.md
 * @see https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#options
 */
async function run() {
  const branch = core.getInput('branch', { required: false }) || 'master';
  const result = await semanticRelease({ branch });

  if (!result) {
    core.debug('No release published');
    const lastTag = execSync('git describe --tags $(git rev-list --tags --max-count=1)', { encoding: 'utf-8' });

    // set outputs
    core.setOutput('new-release-published', 'false');
    core.setOutput('release-version', lastTag)
    return;
  }

  const { lastRelease, nextRelease, commits } = result;

  core.debug(
    `Published ${nextRelease.type} release version ${nextRelease.version} containing ${commits.length} commits.`,
  );

  if (lastRelease.version) {
    core.debug(`The last release was "${lastRelease.version}".`);
  }

  // outputs
  const { version } = nextRelease;
  const [major, minor, patch] = version.split('.');

  // set outputs
  core.setOutput('new-release-published', 'true');
  core.setOutput('release-version', version);
  core.setOutput('release-major', major);
  core.setOutput('release-minor', minor);
  core.setOutput('release-patch', patch);
}

run().catch(core.setFailed);
