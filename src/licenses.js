import glob from 'glob'
import fs from 'node:fs'
import path from 'node:path'
import semver from 'semver'

function parsePackageInfo(packagePath) {
  const packagecontents = JSON.parse(
    fs.readFileSync(path.join(packagePath, 'package.json'))
  )
  return packagecontents
}

function getDependencies(packageInfo, options) {
  const dependencies = []

  if (packageInfo.dependencies) {
    dependencies.push(...Object.keys(packageInfo.dependencies))
  }

  if (options.includeDev && packageInfo.devDependencies) {
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
  const files = glob.sync(path.join(packagePath, 'licen[sc]e*'), {
    nocase: true,
    nodir: true
  })

  if (files.length) {
    return fs.readFileSync(files[0], {
      encoding: 'utf-8'
    })
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

function buildUniqueLicenses(licenses) {
  return licenses.reduce((licenses, license) => {
    const existing = licenses[license.name]
    if (!existing) {
      licenses[license.name] = license
    } else if (semver.gt(license.version, existing.version)) {
      existing.version = license.version
    }
    return licenses
  }, {})
}

export default function getLicenses(options) {
  const defaultSettings = {
    path: ['./'],
    includeDev: false
  }

  const settings = { ...defaultSettings, ...options }
  const { path, includeDev } = settings

  const licenses = []

  for (const subPath of path) {
    const packageInfo = parsePackageInfo(subPath)
    const dependencies = getDependencies(packageInfo, {
      includeDev
    })
    licenses.push(...getDependenciesLicenseInfo(subPath, dependencies))
  }

  return buildUniqueLicenses(licenses)
}
