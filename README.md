# semantic-release-action

I explicitly wish to express my gratitude to [codfish](https://github.com/codfish/semantic-release-action) which
I unscrupulously copied and modified a little bit and with that introduced me to creating your own GitHb Actions.


> GitHub Action for running `semantic-release`. Respects any .releaserc.js configuration file in
> your repo. Exports [output variables](#outputs) for you to use in subsequent actions
> containing version numbers.

## Usage

See [action.yml](action.yml)

- Use major version
  ([recommended by GitHub](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)):
  `uses: dennis-lomans/semantic-release-action@v1`
- Use latest version: `uses: dennis-lomans/semantic-release-action@master`
- Use specific version: `uses: dennis-lomans/semantic-release-action@v1.1.0`

Basic Usage:

```yml
steps:
  - uses: actions/checkout@master

  - uses: dennis-lomans/semantic-release-action@master
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Using output variables set by `semantic-release-action`:

```yml
steps:
  - uses: actions/checkout@master

  # you'll need to add an `id` in order to access output variables
  - uses: dennis-lomans/semantic-release-action@master
    id: semantic
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

  - run: echo ${{ steps.semantic.outputs.release-version }}

  - run: echo "$OUTPUTS"
    env:
      OUTPUTS: ${{ toJson(steps.semantic.outputs) }}

  - uses: dennis-lomans/some-other-action@master
    with:
      release-version: ${{ steps.semantic.outputs.release-version }}
```

Only run an action if a new version was created:

```yml
steps:
  - uses: actions/checkout@master

  # you'll need to add an `id` in order to access output variables
  - uses: dennis-lomans/semantic-release-action@master
    id: semantic
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

  - name: docker push version
    if: steps.semantic.outputs.new-release-published == 'true'
    run: |
      docker tag some-image some-image:$TAG
      docker push some-image:$TAG
    env:
      TAG: v$RELEASE_VERSION
```

If you're _not_ publishing to npm and only want to use this action for GitHub releases, you need to
include a `.releaserc.js` file in your repo, instructing `semantic-release` to not publish to the
`npm` registry.

Example `.releaserc.js` if you're not publishing to npm:

```js
module.exports = {
  branch: 'master',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/npm', { npmPublish: false }],
    '@semantic-release/github',
  ],
};
```

## Why

It's fairly easy to run `semantic-release` as a "host action," aka something that runs directly on
the VM.

```yml
steps:
  - run: npx semantic-release
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

If you're just publishing a node package, then this could still work well for you. The problem I
found with this is when I was in projects where I had subsequent steps/actions in which I wanted to
know whether a new version was cut.

> **Use Case:** For instance, in an application where I'm using `semantic-release` to manage GitHub
> releases, but also building and pushing docker images. Dockerhub has a
> [nice GitHub integration](https://docs.docker.com/docker-hub/builds/) to handle this for us, but
> some other registries do not. If I need to cut a new release, then update a docker registry by
> adding a new tagged build, I'll want to run `semantic-release` and then build a docker image, tag
> it with a version and push it up. In my case I like to push up tags for `latest`, the semver (i.e.
> `v1.8.3`), and just the major the version (i.e. `v1`).

## Inputs

**Docs:** https://help.github.com/en/articles/metadata-syntax-for-github-actions#inputs

| Input Variable | Description                                 |
| -------------- | ------------------------------------------- |
| branch         | The branch on which releases should happen. |

### Outputs

**Docs:** https://help.github.com/en/articles/metadata-syntax-for-github-actions#outputs

**Output Variables**:

| Output Variable       | Description                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| new-release-published | Either `'true'` when a new release was published or `'false'` when no release was published. Allows other actions to run or not-run based on this |
| release-version       | The new releases' semantic version, i.e. `1.8.3`  or the last release when no new release is created.                                                                                                |
| release-major         | The new releases' major version number, i.e. `1`                                                                                                  |
| release-minor         | The new releases' minor version number, i.e. `8`                                                                                                  |
| release-patch         | The new releases' patch version number, i.e. `3`                                                                                                  |
