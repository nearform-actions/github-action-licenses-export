![CI](https://github.com/nearform/github-action-licenses-export/actions/workflows/ci.yml/badge.svg?event=push)

# github-action-licenses-export

GitHub action that generates a list with the dependencies used in a Node.js application with their respective licenses. The result can be exported to a file or passed in as an argument to another GitHub action so it can be used to properly redistribute the licenses by displaying them in your application.

## Inputs

### `path`

**Optional** Path to the directory where the package.json file and the node_modules folder are, it supports multiple directories by passing them into new lines. Default `'./'`.

### `licenses-file`

**Optional** Licenses output JSON file.

### `include-dev`

**Optional** Include development packages. Default `'false'`.

### `include-transitive`

**Optional** Include transitive packages. Default `'true'`.

## Outputs

### `licenses`

JSON representation of the licenses list.

## Examples

### Generating a license file and commiting the changes

This example runs on every push to the `master` branch and generates a license file located in `src/licenses.json` that gets commited and pushed if there are changes.

```yaml
name: Update licenses file

on:
  push:
   branches:
    - master

jobs:
  update-licenses:
    name: Generates a licenses file for the dependencies used in the application and commits the changes
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version-file: '.nvmrc'
      - name: Install dependencies
        run: |
          npm ci
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

### Using the output in another step

This example uses the action output in another step of the job.

```yaml
name: Display licenses

on:
  push:
   branches:
    - master

jobs:
  update-licenses:
    name: Generates a licenses list for the dependencies used in the application and commits the changes
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version-file: '.nvmrc'
      - name: Install dependencies
        run: |
          npm ci
      - name: Generate licenses
        id: generate_licenses
        uses: nearform/github-action-licenses-export@v1
      - name: Do something with the licenses
        run: |
          echo ${{ steps.generate_licenses.outputs.licenses }}
```
