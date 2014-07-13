var app = angular.module('draftApp', []);

app.controller('SelectionController', function ($scope) {
  $scope.selections = pool;
  $scope.resultCap = 5;
  $scope.searchText = "";
  $scope.fillInput = (function (evt) {
    $("#displayed-value").val(evt.firstName + " " + evt.lastName);
    $("#selection-value1").val(evt.lastName);
    $("#selection-value2").val(evt.firstName);
    $("#selection_id").val(evt.id);
    $("#selection_meta1").val(evt.position);
    $("#selection_meta2").val(evt.bye);
  });

  // remove selection from client-side data-pool
  $scope.discardSelection = (function () {
    var idToRemove = $("#selection_id").val();
    $scope.selections = $.grep($scope.selections, function (selection,index) {
      return selection.id !== idToRemove;
    });
  });
});

