import * as core from '@actions/core'
import fs from 'fs'

import { getLicenses } from './licenses.js'

export async function run() {
  const licensesFile = core.getInput('licenses-file')
  const omitVersion = core.getBooleanInput('omit-version')
  const productionOnly = core.getBooleanInput('production-only')
  const directDependenciesOnly = core.getBooleanInput(
    'direct-dependencies-only'
  )

  const licenses = await getLicenses({
    licensesFile,
    omitVersion,
    productionOnly,
    directDependenciesOnly
  })

  fs.writeFileSync(licensesFile, JSON.stringify(licenses, null, 2))
}
