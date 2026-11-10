# oscars.eisenberg.ninja

Oscar-prediction ballots and leaderboards. SvelteKit (static) + Firebase Auth and Realtime Database.
Roadmap: [PLAN.md](PLAN.md).

```bash
npm run dev            # local dev; add ?demo=open|live|final for fixture data
npm test               # unit tests
npm run deploy:rules   # deploy database.rules.json
npm run backup         # download the whole database to backups/
```

## Adding a new season

Admin → Account sheet → **Seasons** (`/admin`). Download the template
([static/templates/season-template.json](static/templates/season-template.json)), fill in the nominees, then paste
or load it. The newest season becomes the current year for everyone with no deploy. The file format is in
[PLAN.md § A](PLAN.md#a-add-a-season-from-the-admin-panel-).

## Backups and restore

`npm run backup` writes `backups/eisenberg-oscars-<timestamp>.json`, using your `firebase login`. If it fails with
an auth error, run `firebase login --reauth`. Backups contain user data and are git-ignored.

Restore **overwrites** data. Take a fresh backup first.

```bash
# whole database
firebase database:set / backups/<file>.json --project eisenberg-oscars

# a single path, e.g. one year's ballots
jq '.ballots["2026"]' backups/<file>.json > /tmp/ballots-2026.json
firebase database:set /ballots/2026 /tmp/ballots-2026.json --project eisenberg-oscars
```

---

_Legacy notes from the original Create React App project:_

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `yarn build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
