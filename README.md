# Little Planets 💫

Particle Manager in Typescript

## Development

This monorepo is managed using Turborepo

It contains the packages:

- little-planets
  - the particle management library itself

It contains the apps:

- examples
  - a vanilla ts vite app importing the development version of little-plants and
    showcasing its features

It contains the following scripts:

- build
  - build all packages and apps, respecting dependencies
- clean
  - delete all build artifacts and dependencies
- dev
  - run development version of all apps
- format
  - run prettier over all packages and apps
- lint
  - run tsc over all packages and apps
  - TODO: run eslint over all packages and apps
- test
  - TODO: run unit tests over all packages and apps
