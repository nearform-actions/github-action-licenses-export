import { promisify } from 'node:util'
import licenseCrawler from 'npm-license-crawler'

import { DEFAULT_OPTIONS } from './constants.js'

const dumpLicenses = promisify(licenseCrawler.dumpLicenses)

export function getLicenses(settings) {
  const options = { ...DEFAULT_OPTIONS, ...settings }

  return dumpLicenses({
    start: [options.findPath],
    exclude: options.excludePath ? [options.excludePath] : [],
    omitVersion: options.omitVersion,
    production: options.productionOnly,
    onlyDirectDependencies: options.directDependenciesOnly,
    noColor: true
  })
}
