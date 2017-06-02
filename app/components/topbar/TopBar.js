/**
 * @class fcaTopBar
 * @memberOf FSCounterAggregatorApp
 * @description Manage the topbar data
 */

require('../services/UserService');

angular.module('FSCounterAggregatorApp')
	.directive('fcaTopBar', function () {
		return {
			controller: [
				'$scope',
				'LayoutService',
				'UserService',
				'$state',
				function (
					$scope,
					LayoutService,
					UserService,
					$state
				) {
					$scope.params = UserService;
					$scope.state = $state;
					$scope.user = undefined;
				
					UserService.getSettings()
						.then(function (ret) {
							$scope.user = ret.user;
						});

					$scope.toggleSideBar = () => {
						LayoutService.sideBarCollapsed = !LayoutService.sideBarCollapsed;

					};

					$scope.$watch('params.currentUserData', function (newVal, oldVal) {
						if (oldVal != newVal) {
							$scope.user = newVal.user;
						}
					});
				}
			],
			templateUrl: 'build/html/TopBarView.html'
		};
	});
