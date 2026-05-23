export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf',
      'refactor', 'revert', 'style', 'test'
    ]],
    'scope-enum': [2, 'always', [
      'api', 'web', 'shared', 'prisma', 'root', 'docs', 'e2e',
      'infra', 'deps'
    ]],
    'scope-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
