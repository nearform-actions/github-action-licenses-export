![CI](https://github.com/nearform/github-action-licenses-export/actions/workflows/ci.yml/badge.svg?event=push)

# github-action-licenses-export

GitHub action that generates a file with the dependencies used in the application with their respective licenses. The file can be used to properly redistribute the licenses by displaying them in your application.

## Inputs

### `find-path`

**Optional** Path to the directory where the search for package.json files starts at. Default `'./'`.

### `exclude-path`

**Optional** Path to a directory to be excluded from the package.json search. Default `undefined`.

### `licenses-file`

**Optional** Licenses output JSON file. Default `'licenses.json'`.

### `omit-version`

**Optional** Omit package versions from the report. Default `'true'`.

### `production-only`

**Optional** Only include production packages. Default `'true'`.

### `direct-dependencies-only`

**Optional** Only include direct dependencies. Default `'true'`.

## Basic example

```yaml
name: Update licenses

on:
  push:
   branches:
    - master
  pull_request:

jobs:
  update-licenses:
    name: Generates a licenses file for the dependencies used in the application and commits the changes
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      - name: Generate licenses file
        uses: nearform/github-action-licenses-export@v1
        with:
          licenses-file: src/licenses.json
      - name: Commit changes
        uses: EndBug/add-and-commit@v9
        with:
          message: 'chore: update licenses file'
          add: src/licenses.json
```
