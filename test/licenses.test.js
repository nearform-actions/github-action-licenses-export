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
          license: 'ISC',
          dependencies: {
            transitivedep: '1.0.0'
          }
        }),
        LICENSE: 'License content from proddep'
      },
      transitivedep: {
        'package.json': JSON.stringify({
          name: 'transitivedep',
          version: '1.0.0',
          license: 'BSD-3-Clause',
          dependencies: {
            deepnested: '2.0.0'
          }
        }),
        LICENSE: 'The license content from transitivedep'
      },
      deepnested: {
        'package.json': JSON.stringify({
          name: 'deepnested',
          version: '2.0.0',
          license: 'BSD-3-Clause',
          dependencies: {
            proddep: '18.2.0'
          }
        }),
        LICENSE: 'The license content from deepnested'
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
      },
      transitivedep: {
        author: undefined,
        name: 'transitivedep',
        version: '1.0.0',
        license: 'BSD-3-Clause',
        licenseText: 'The license content from transitivedep'
      },
      deepnested: {
        author: undefined,
        name: 'deepnested',
        version: '2.0.0',
        license: 'BSD-3-Clause',
        licenseText: 'The license content from deepnested'
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
        transitivedep: {
          author: undefined,
          name: 'transitivedep',
          version: '1.0.0',
          license: 'BSD-3-Clause',
          licenseText: 'The license content from transitivedep'
        },
        deepnested: {
          author: undefined,
          name: 'deepnested',
          version: '2.0.0',
          license: 'BSD-3-Clause',
          licenseText: 'The license content from deepnested'
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
      transitivedep: {
        author: undefined,
        name: 'transitivedep',
        version: '1.0.0',
        license: 'BSD-3-Clause',
        licenseText: 'The license content from transitivedep'
      },
      deepnested: {
        author: undefined,
        name: 'deepnested',
        version: '2.0.0',
        license: 'BSD-3-Clause',
        licenseText: 'The license content from deepnested'
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

  t.test(
    'ignore transitive dependencies if the options is set to false',
    async t => {
      const licenses = getLicenses({
        path: [path.join(testDirectory, 'first-package')],
        includeTransitive: false
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
    }
  )

  t.test('Ignore packages in exclude-packages list', async t => {
    const licenses = getLicenses({
      path: [
        path.join(testDirectory, 'first-package'),
        path.join(testDirectory, 'second-package')
      ],
      excludePackages: ['second-package']
    })

    t.strictSame(licenses, {
      proddep: {
        author: undefined,
        name: 'proddep',
        version: '18.2.0',
        license: 'ISC',
        licenseText: 'License content from proddep'
      }
    })
  })
})
