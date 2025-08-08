name: Minify mailchimp.js

on:
  push:
    paths:
      - 'mailchimp.js'  # Only trigger when this file changes
  workflow_dispatch:

jobs:
  minify_js:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'  # Specify the Node.js version you prefer

      - name: Install UglifyJS
        run: npm install -g uglify-js

      - name: Minify mailchimp.js
        run: uglifyjs mailchimp.js -o mailchimp.min.js --compress --mangle
        
      - name: Commit minified file
        uses: EndBug/add-and-commit@v9
        with:
          message: "chore: update minified mailchimp.js"
          add: "mailchimp.min.js"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
