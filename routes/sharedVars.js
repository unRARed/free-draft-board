var siteTitle = (function () {
  var mainTitle = "FreeDraftBoard.com - Free offline drafting for fantasy sports leagues.";

  return {
    getTitle: (function () {
      return mainTitle;
    }),
    prependTitle: (function (title) {
      return title + " | " + mainTitle;
    })
  }
});

module.exports = siteTitle();
