/**
 * @class fcaSideMenu
 * @memberOf FSCounterAggregatorApp
 * @description Menu used to select dashboards
 */

require('../services/UserService');

angular.module('FSCounterAggregatorApp')
	.directive('fcaSideMenu', function () {
		return {
			controller: [
				'$scope',
				'LayoutService',
				'UserService',
				function (
					$scope,
					LayoutService,
					UserService
				) {
					$scope.user = {};
					$scope.hasAdminSites = false;
					$scope.hasUserDashboard = false;

					$scope.layout = LayoutService;

					LayoutService.init();

					function updateRights(data) {
						var currentUserSites = data.sites;
						$scope.hasAdminSites = false;
						for (var i = 0; i < currentUserSites.length; ++i) {
							if (currentUserSites[i].isadmin) {
								$scope.hasAdminSites = true;
								break;
							}
						}
						$scope.hasUserDashboard = data.user.userInfo
							&& data.user.userInfo.dashboard
							&& data.user.userInfo.dashboard.length > 0;
					}

					UserService.getSettings()
						.then(function (ret) {
							$scope.user = ret.user;
							updateRights(ret);
						});

					$scope.$watch('UserService.currentUserData', function (newVal) {
						if (newVal) {
							$scope.user = newVal.user;
							updateRights(newVal);
						}
					});
				}
			],
			templateUrl: 'build/html/SideMenuView.html'
		};
	});
