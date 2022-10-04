import fs from 'node:fs'
import path from 'node:path'

function parsePackageInfo(packagePath) {
  const packagecontents = JSON.parse(
    fs.readFileSync(path.join(packagePath, 'package.json'))
  )
  return packagecontents
}

function getDependencies(packageInfo, options) {
  const dependencies = Object.keys(packageInfo.dependencies)

  if (options.includeDev) {
    dependencies.push(...Object.keys(packageInfo.devDependencies))
  }

  return dependencies
}

function getPackageAuthor(packageInfo) {
  if (packageInfo.author) {
    if (typeof packageInfo.author === 'string') {
      return packageInfo.author
    }

    if (packageInfo.author.name) {
      return packageInfo.author.name
    }
  }

  return undefined
}

function getLicenseText(packagePath) {
  const files = ['LICENSE.md', 'LICENSE', 'LICENSE.txt']

  for (const file of files) {
    const filePath = path.join(packagePath, file)
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, {
        encoding: 'utf-8'
      })
    }
  }

  return undefined
}

function getDependenciesLicenseInfo(packagePath, dependencies) {
  return dependencies.map(dependency => {
    const dependencyPath = path.join(packagePath, 'node_modules', dependency)
    const packageInfo = parsePackageInfo(dependencyPath)

    return {
      author: getPackageAuthor(packageInfo),
      name: packageInfo.name,
      version: packageInfo.version,
      license: packageInfo.license,
      licenseText: getLicenseText(dependencyPath)
    }
  })
}

export default function getLicenses(options) {
  const path = options.path || './'
  const packageInfo = parsePackageInfo(path)
  const dependencies = getDependencies(packageInfo, {
    includeDev: options.includeDev || false
  })
  return getDependenciesLicenseInfo(path, dependencies)
}
