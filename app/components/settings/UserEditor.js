/**
 * @class UserEditor
 */
angular.module('FSCounterAggregatorApp')
	.directive("fcaUserEditor", function () {
		return {
			restrict: 'E',
			scope: {
				user: '=',
				isNew: '=',
				signal_submit: '&onSubmit',
				signal_close: '&onClose'
			},
			templateUrl: "build/html/UserEditor.html",

			controller: [
				'$scope',
				function (
					$scope
				) {

					var defaultDashboard = "";
					var emptyValue = "{ \"dashboard\": \"" + defaultDashboard + "\" }";

					$scope.forceRefresh = 0;
					$scope.currentUser = $scope.user;
					$scope.jsonValid = true;
					$scope.htmlValid = true;
					$scope.jsonEditor = undefined;
					$scope.htmlEditor = undefined;


					function setEditorValue(user) {
						if ($scope.jsonEditor !== undefined) {
							if (user !== undefined && user.userInfo !== undefined) {
								$scope.jsonEditor.setValue(angular.toJson(user.userInfo, true));
							} else {
								$scope.jsonEditor.setValue(emptyValue);
							}
						}
					}

					function setDashboardValue(user) {
						if ($scope.htmlEditor !== undefined) {
							if (user !== undefined && user.userInfo !== undefined && user.userInfo.dashboard !== undefined) {
								$scope.htmlEditor.setValue(user.userInfo.dashboard);
							} else {
								$scope.htmlEditor.setValue(defaultDashboard);
							}
						}
					}

					$scope.jsonOptions = {
						lineWrapping: true,
						lineNumbers: true,
						matchBrackets: true,
						autoCloseBrackets: true,
						autoRefresh: true,
						gutters: ["CodeMirror-lint-markers"],
						lint: true,
						mode: { "name": "javascript", "json": true },
						onLoad: function (instance) {
							$scope.jsonEditor = instance;
							$scope.jsonEditor.on("change", function (instance) {
								$scope.$evalAsync(function () {
									$scope.jsonChanged();
								});
							});
							setEditorValue($scope.currentUser);
						}
					};

					$scope.htmlOptions = {
						lineWrapping: true,
						lineNumbers: true,
						autoRefresh: true,
						gutters: ["CodeMirror-lint-markers"],
						lint: true,
						htmlMode: true,
						matchClosing: true,
						mode: { name: "xml" },
						onLoad: function (instance) {
							$scope.htmlEditor = instance;
							$scope.htmlEditor.on("change", function (instance) {
								$scope.$evalAsync(function () {
									$scope.htmlChanged();
								});
							});
						}
					};

					$scope.propJson = "";
					$scope.propHTML = "";

					$scope.isDirty = function () {
						return !angular.equals($scope.currentUser, $scope.user);
					};

					$scope.submit = function () {
						angular.copy($scope.currentUser, $scope.user);
						if ($scope.signal_submit) {
							$scope.signal_submit();
						}
						$scope.close();
					};

					$scope.jsonChanged = function () {
						if ($scope.jsonEditor !== undefined && $scope.currentUser !== undefined) {
							try {
								if ($scope.jsonEditor.getValue() === "{}") {
									$scope.currentUser.userInfo = undefined;
								} else {
									jsonlint.parse($scope.jsonEditor.getValue());
									$scope.currentUser.userInfo = angular.fromJson($scope.jsonEditor.getValue());
								}
								$scope.jsonValid = true;
							} catch (err) {
								$scope.jsonValid = false;
							}
						}
					};

					$scope.htmlChanged = function () {
						if ($scope.htmlEditor !== undefined && $scope.currentUser !== undefined) {
							if ($scope.currentUser.userInfo !== undefined) {
								$scope.currentUser.userInfo.dashboard = $scope.htmlEditor.getValue();
								$scope.htmlValid = true;
							}
						}
					};

					$scope.setHtmlMode = function () {
						setDashboardValue($scope.currentUser);
						++$scope.forceRefresh;
					};

					$scope.setJsonMode = function () {
						setEditorValue($scope.currentUser);
						++$scope.forceRefresh;
					};

					$scope.close = function () {
						if ($scope.signal_close) {
							$scope.signal_close();
						}
					};

					$scope.resetPassword = function () {
						$scope.user.$resetPassword()
							.then(function (user) {
								$scope.currentUser = angular.copy(user);
							});
					};

					$scope.$watch("user", function (newVal, oldVal) {
						if (newVal !== oldVal) {
							$scope.currentUser = angular.copy(newVal);
							setEditorValue($scope.currentUser);
							setDashboardValue($scope.currentUser);
							++$scope.forceRefresh;
						}
					});
				}]
		};
	});
