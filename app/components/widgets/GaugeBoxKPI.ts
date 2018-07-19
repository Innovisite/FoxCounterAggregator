/**
 * @class StatBoxKPI
 * @memberof FSCounterAggregatorApp
 * @description Widget implementation for displaying a KPI value from a specific indicator
 **/

declare const angular: any;

import { MonoWidgetCtrlBase } from "./MonoWidgetCtrlBase";
import { WidgetStyleService } from "../services/WidgetStyleService";

angular.module('FSCounterAggregatorApp').
	directive('fcaGaugeBoxKpi', function () {
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
			controller: GaugeBoxCtrl,
			link: function (scope: any) {                
				scope.icon = scope.icon !== undefined ? scope.icon : 'ion-ios-download';
			},
			templateUrl: 'build/html/GaugeBoxKPIView.html'
		};
	});

    class GaugeBoxCtrl extends MonoWidgetCtrlBase {

        constructor($scope: any, $filter: any, widgetStyleService: WidgetStyleService) {
            super($scope, $filter, widgetStyleService);

            this.$scope.thick= 15;
            this.$scope.size = 250;
            this.$scope.type = "arch";
            this.$scope.cap = "butt";
            this.$scope.fgColor = "#1f77b4";
            this.$scope.fgColorCmp = "#ed7e17";
        }

    }
