/**
 * @class StatBoxKPI
 * @memberof FSCounterAggregatorApp
 * @description Widget implementation for displaying a KPI value from a specific indicator
 **/

declare const angular: any;

import { WidgetStyleService } from "../services/WidgetStyleService";
import { DataItem, QueryPeriod } from "../types/data";
import { ViewableNode } from "../types/site";

angular.module('FSCounterAggregatorApp').
	directive('fcaStatBoxKpi', function () {
		return {
			scope: {
				indicator: '@',
				label: '@?',
				description: '@?',
				period: '@?',
				unit: '@?',
				params: '=',
				kpi: '=',
				icon: '@?',
				displayFilters: '@?',
				options: '='
			},
			controller: [
				'$scope',
				'$filter',
				'WidgetStyleService',
				function (
					$scope: any,
					$filter: any,
					widgetStyleService: WidgetStyleService
				) {

					function applyFilters(value: any) {
						if (!$scope.displayFilters)
							return value;

						return $filter($scope.displayFilters)(value);
					}

					$scope.label = $scope.label !== undefined ? $scope.label :
						$scope.kpi.getLabel($scope.indicator);
					$scope.value = 0;
					$scope.valueCompared = 0;
					$scope.widgetId = 'statbox/' + $scope.kpi + '/' + $scope.indicator;
					$scope.liveMode = false;					
					$scope.periodComparisonSelected = false;

					widgetStyleService.getStyle($scope.widgetId)
						.then(function () {
						});

					$scope.$watch('params.data', function (newData: DataItem[], oldData: DataItem[]) {
						if (newData !== oldData) {
							$scope.update();
						}
					});

					$scope.$watch('params.comparedData', function (newData: DataItem[]) {
						if (newData !== undefined && newData.length) {
							$scope.periodComparisonSelected = true;
							$scope.updateCompared();
						} else if ($scope.periodComparisonSelected) {
							$scope.periodComparisonSelected = false;
						}
					});

					$scope.$watch('params.liveMode', (newValue: boolean, oldValue: boolean) => {
						if (newValue !== oldValue) {
							$scope.liveMode = newValue;
						}
					});

					$scope.$watch('params.currentSiteData', (newData: DataItem[], oldData: DataItem[]) => {
						if (newData !== oldData) {
							$scope.update();
						}
					});

					$scope.$watch('params.currentSiteComparedData', (newData: DataItem[]) => {
						if (newData !== undefined && newData.length) {
							$scope.periodComparisonSelected = true;
							$scope.updateCompared();
						} else if ($scope.periodComparisonSelected) {
							$scope.periodComparisonSelected = false;
						}
					});									

					function getValue(data: DataItem[], period: QueryPeriod) {						
						const res = $scope.kpi.compute({							
							allsitedata: data.map((_: any) => _.data),
							period: period,
							indicator: $scope.indicator,
							groupBy: undefined,
							periodLive: $scope.liveMode
						});
						if (res.isSiteIndex) {
							res.value = $scope.params.sites[res.value].id;
						}
						return applyFilters(res.value);
					}				

					$scope.update = function () {						

						$scope.value = getValue(
							$scope.params.currentSiteData ? $scope.params.currentSiteData : $scope.params.data, 
							$scope.params.period);
					};

					$scope.updateCompared = function () {
						if ($scope.periodComparisonSelected) {
							$scope.valueCompared = getValue(
								$scope.params.currentSiteComparedData ? $scope.params.currentSiteComparedData : $scope.params.comparedData, 
								$scope.params.comparedPeriod);
						}
					};

				}],
			link: function (scope: any) {
				scope.icon = scope.icon !== undefined ? scope.icon : 'ion-ios-download';
			},
			templateUrl: 'build/html/StatBoxKPIView.html'
		};
	});
