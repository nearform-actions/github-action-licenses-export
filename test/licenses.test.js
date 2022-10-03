import t from 'tap'

import getLicenses from '../src/licenses.js'

const testDirectory = t.testdir({
  'package.json': JSON.stringify({
    devDependencies: {
      devdep: '16.1.0'
    },
    dependencies: {
      proddep: '18.2.0'
    }
  }),
  node_modules: {
    devdep: {
      'package.json': JSON.stringify({
        name: 'devdep',
        version: '16.1.0',
        author: 'Dev Author',
        license: 'MIT'
      }),
      'LICENSE.md': 'License content from devdep'
    },
    proddep: {
      'package.json': JSON.stringify({
        name: 'proddep',
        version: '18.2.0',
        license: 'ISC'
      }),
      LICENSE: 'License content from proddep'
    }
  }
})

t.test('getLicenses', async t => {
  t.test('returns only the production dependencies by default', async t => {
    const licenses = getLicenses({ path: testDirectory })

    t.same(licenses, [
      {
        author: undefined,
        name: 'proddep',
        version: '18.2.0',
        license: 'ISC',
        licenseText: 'License content from proddep'
      }
    ])
  })

  t.test(
    'includes the dev dependencies if the option is set to true',
    async t => {
      const licenses = getLicenses({ path: testDirectory, includeDev: true })

      t.same(licenses, [
        {
          author: undefined,
          name: 'proddep',
          version: '18.2.0',
          license: 'ISC',
          licenseText: 'License content from proddep'
        },
        {
          author: 'Dev Author',
          name: 'devdep',
          version: '16.1.0',
          license: 'MIT',
          licenseText: 'License content from devdep'
        }
      ])
    }
  )
})
