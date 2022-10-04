import path from 'node:path'
import t from 'tap'

import getLicenses from '../src/licenses.js'

const testDirectory = t.testdir({
  'first-package': {
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
  },
  'second-package': {
    'package.json': JSON.stringify({
      dependencies: {
        proddep: '18.3.0',
        anotherdep: '^1.0.0'
      }
    }),
    node_modules: {
      proddep: {
        'package.json': JSON.stringify({
          name: 'proddep',
          version: '18.1.0',
          license: 'ISC'
        }),
        LICENSE: 'License content from proddep'
      },
      anotherdep: {
        'package.json': JSON.stringify({
          name: 'anotherdep',
          version: '1.0.1',
          license: 'ISC'
        }),
        license: 'License content from anotherdep'
      }
    }
  }
})

t.test('getLicenses', async t => {
  t.test('returns only the production dependencies by default', async t => {
    const licenses = getLicenses({
      path: [path.join(testDirectory, 'first-package')]
    })

    t.same(licenses, {
      proddep: {
        author: undefined,
        name: 'proddep',
        version: '18.2.0',
        license: 'ISC',
        licenseText: 'License content from proddep'
      }
    })
  })

  t.test(
    'includes the dev dependencies if the option is set to true',
    async t => {
      const licenses = getLicenses({
        path: [path.join(testDirectory, 'first-package')],
        includeDev: true
      })

      t.same(licenses, {
        proddep: {
          author: undefined,
          name: 'proddep',
          version: '18.2.0',
          license: 'ISC',
          licenseText: 'License content from proddep'
        },
        devdep: {
          author: 'Dev Author',
          name: 'devdep',
          version: '16.1.0',
          license: 'MIT',
          licenseText: 'License content from devdep'
        }
      })
    }
  )

  t.test('supports dependencies from multiple packages', async t => {
    const licenses = getLicenses({
      path: [
        path.join(testDirectory, 'first-package'),
        path.join(testDirectory, 'second-package')
      ]
    })

    t.same(licenses, {
      proddep: {
        author: undefined,
        name: 'proddep',
        version: '18.2.0',
        license: 'ISC',
        licenseText: 'License content from proddep'
      },
      anotherdep: {
        author: undefined,
        name: 'anotherdep',
        version: '1.0.1',
        license: 'ISC',
        licenseText: 'License content from anotherdep'
      }
    })
  })
})
