import glob from 'glob'
import fs from 'node:fs'
import path from 'node:path'
import semver from 'semver'

import DependencyCrawler from './dependency-crawler.js'
import { parsePackageInfo } from './util.js'

function getPackageAuthor(packageInfo) {
  if (typeof packageInfo.author === 'string') {
    return packageInfo.author
  }

  return packageInfo.author?.name
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

function getDependenciesLicenseInfo(
  packagePath,
  dependencies,
  excludePackages
) {
  const filteredDependencies = dependencies.filter(
    d => !excludePackages.includes(d)
  )
  return filteredDependencies.map(dependency => {
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
    includeDev: false,
    includeTransitive: true
  }

  const settings = { ...defaultSettings, ...options }
  const { path, includeDev, includeTransitive, excludePackages = [] } = settings

  const licenses = []

  for (const subPath of path) {
    const crawler = new DependencyCrawler({
      path: subPath,
      includeDev,
      includeTransitive
    })

    const packageInfo = parsePackageInfo(subPath)

    const dependencies = crawler.listDependencies(packageInfo.name)
    licenses.push(
      ...getDependenciesLicenseInfo(subPath, dependencies, excludePackages)
    )
  }

  return buildUniqueLicenses(licenses)
}
