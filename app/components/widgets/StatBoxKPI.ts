/**
 * @class StatBoxKPI
 * @memberof FSCounterAggregatorApp
 * @description Widget implementation for displaying a KPI value from a specific indicator
 **/

declare const angular: any;

import { MonoWidgetCtrlBase } from "./MonoWidgetCtrlBase";

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
			controller: MonoWidgetCtrlBase,
			link: function (scope: any) {
				scope.icon = scope.icon !== undefined ? scope.icon : 'ion-ios-download';
			},
			templateUrl: 'build/html/StatBoxKPIView.html'
		};
	});

