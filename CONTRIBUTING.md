# Contributing

All contributions to this repository are more than welcome and appreciated a lot 🎉
Don't hesitate to [create a new issue](https://github.com/cyrilwanner/next-compose-plugins/issues/new) if you have any question. 

## Setup instructions

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device.
2. Install the dependencies: `npm install`
3. Run `npm link` to link the local repo to NPM
4. Run `npm run watch` to build and watch for code changes
5. Then npm link this repo inside any example app with `npm link next-compose-plugins`
6. Then you can run your example app with the local version of next-compose-plugins to test your changes

## Testing

We write tests for all major functionality of this plugin to ensure a good code quality.
Please update and/or write new tests when contributing to this repository.

You can run the tests locally with `npm test`.
Please note that test will get executed against the built sources, so make sure you are either watching the files or build them once (`npm run build`) before running the tests.

## Coding style

Code should written to match the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

You can lint the code locally with `npm run lint`.

To automatically fix some of the most common problems, run `npm run lint:fix`.
