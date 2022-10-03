import * as core from '@actions/core'
import fs from 'fs'

import { getLicenses } from './licenses.js'

export async function run() {
  const findPath = core.getInput('find-path')
  const excludePath = core.getInput('exclude-path')
  const licensesFile = core.getInput('licenses-file')
  const omitVersion = core.getBooleanInput('omit-version')
  const productionOnly = core.getBooleanInput('production-only')
  const directDependenciesOnly = core.getBooleanInput(
    'direct-dependencies-only'
  )

  const licenses = await getLicenses({
    findPath,
    excludePath,
    licensesFile,
    omitVersion,
    productionOnly,
    directDependenciesOnly
  })

  fs.writeFileSync(licensesFile, JSON.stringify(licenses, null, 2))
}
