import path from 'node:path'

import { parsePackageInfo } from './util.js'

export default class DependencyCrawler {
  constructor(options) {
    this.options = options
    this.seen = new Set()
  }

  listDependencies(packageName, root = true) {
    if (this.seen.has(packageName)) {
      return []
    }

    this.seen.add(packageName)

    const packagePath = root
      ? this.options.path
      : path.join(this.options.path, 'node_modules', packageName)

    const packageInfo = parsePackageInfo(packagePath)
    const dependencies = this.listDirectDependencies(packageInfo)

    if (!this.options.includeTransitive) {
      return dependencies
    }

    return [
      ...dependencies,
      ...dependencies.flatMap(dependency =>
        this.listDependencies(dependency, false)
      )
    ]
  }

  listDirectDependencies(packageInfo) {
    const dependencies = []

    if (packageInfo.dependencies) {
      dependencies.push(...Object.keys(packageInfo.dependencies))
    }

    if (this.options?.includeDev && packageInfo.devDependencies) {
      dependencies.push(...Object.keys(packageInfo.devDependencies))
    }

    return dependencies
  }
}
