import * as core from '@actions/core'
import fs from 'fs'

import getLicenses from './licenses.js'

export async function run() {
  const path = core.getMultilineInput('path')
  const includeDev = core.getBooleanInput('include-dev')
  const includeTransitive = core.getBooleanInput('include-transitive')
  const licensesFile = core.getInput('licenses-file')
  const excludePackages = parseCSV(core.getInput('exclude-packages'))
  console.log(`🚀 --- excludePackages`, excludePackages)

  const licenses = await getLicenses({
    path,
    includeDev,
    includeTransitive,
    excludePackages
  })

  if (licensesFile) {
    fs.writeFileSync(licensesFile, JSON.stringify(licenses, null, 2))
  }

  core.setOutput('licenses', licenses)
}

function parseCSV(value) {
  if (!value || value.trim() === '') return []
  return value.split(',').map(p => p.trim())
}
