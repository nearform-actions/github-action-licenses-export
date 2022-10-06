import fs from 'node:fs'
import path from 'node:path'

export function parsePackageInfo(packagePath) {
  const packagecontents = JSON.parse(
    fs.readFileSync(path.join(packagePath, 'package.json'))
  )
  return packagecontents
}
