Free Draft Board
================

Open source offline fantasy sports draft board inspired by Matthew Orres' [PHPDraft](https://bitbucket.org/mattheworres/phpdraft). It works but could use a lot of refactoring to be truly awesome. Have at it.

Dev Setup
---------

### Install MongoDB

See <https://www.mongodb.org/>. Here are instructions for [Homebrew](http://brew.sh/) on a Mac.

    brew install mongodb --with-openssl
    ln -sfv /usr/local/opt/mongodb/*.plist ~/Library/LaunchAgents
    launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist

### Install NodeJS (with NPM) and fetch dependencies

Again, for Macs, use Homebrew. For other OS, see <https://nodejs.org/en/>.

    brew install node
    npm install

### Running the Server

    node app.js

