/**
 * Commit messages must follow the Conventional Commits specification.
 * @see https://www.conventionalcommits.org
 * @type {import('@commitlint/types').UserConfig}
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      1,
      'always',
      [
        'app',
        'articles',
        'dashboard',
        'deps',
        'docs',
        'editor',
        'layout',
        'photos',
        'profile',
        'publisher',
        'sites',
        'store',
        'theme',
        'tests',
        'tooling',
        'videos',
      ],
    ],
  },
};
