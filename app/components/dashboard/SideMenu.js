/**
 * @class fcaSideMenu
 * @memberOf FSCounterAggregatorApp
 * @description Menu used to select dashboards
 */
(function () {

	require('../services/UserService');

	angular.module('FSCounterAggregatorApp')
		.directive('fcaSideMenu', [
			'LayoutService',
			'UserService',
			function (
				LayoutService,
				UserService
			) {
				return {
					link: function (scope, element, attr) {

						scope.user = {};
						scope.hasAdminSites = false;
						scope.hasUserDashboard = false;

						LayoutService.init();

						function updateRights(data) {
							var currentUserSites = data.viewable_nodes;
							scope.hasAdminSites = false;
							for (var i = 0; i < currentUserSites.length; ++i) {
								if (currentUserSites[i].isadmin) {
									scope.hasAdminSites = true;
									break;
								}
							}
							scope.hasUserDashboard = data.app_data && data.app_data.dashboard && data.app_data.dashboard.length > 0;
						}

						UserService.getSettings()
							.then(function (ret) {
								scope.user = ret.user;
								updateRights(ret);
							});

						scope.$watch('UserService.currentUserData', function (newVal) {
							if (newVal) {
								scope.user = newVal.user;
								updateRights(newVal);
							}
						});
					},
					templateUrl: 'build/html/SideMenuView.html'
				};
			}]);
}());
