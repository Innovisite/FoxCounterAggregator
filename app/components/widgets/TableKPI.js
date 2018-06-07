/**
* @class TableKPI
* @memberof FSCounterAggregatorApp
* @description Widget implementation for displaying statistics in a tabular format
**/

require('../services/WidgetStyleService');

angular.module('FSCounterAggregatorApp').directive('fcaTableKpi', function () {
    return {
        scope: {
            params: '=',
            kpi: '=',
            kpiOptions: '=?',
            showItems: '@',
            onNextItem: '&'
        },
        controller: [
            '$scope',
            '$q',
            '$controller',
            'WidgetStyleService',
            /* 'DTOptionsBuilder',
            'DTColumnDefBuilder', */
            function ($scope, $q, $controller, WidgetStyleService/* , DTOptionsBuilder, DTColumnDefBuilder */) {                

                $scope.widgetId = "TableKPIWidget";
                $scope.indicators = []; //$scope.kpi.options.indicators;
                $scope.rows = [];
                $scope.total = {};
                $scope.showItems = $scope.showItems === "true";
                $scope.periodComparisonSelected = false;
                $scope.itemsList = [];                

                //$scope.dtOptions = DTOptionsBuilder.newOptions().withBootstrap();              

                $scope.$watch('params.data', function (newData, oldData) {                    
                    if (newData !== undefined && newData.length) { //&& newData !== oldData) {                        
                        $scope.update();
                    }
                });

                $scope.$watch("params.sites", function (newSites, oldSites) {                    
                    if (newSites !== undefined && newSites.length) {
                        $scope.itemsList = WidgetStyleService.buildItemsList(newSites, $scope.showItems);
                    }
                });

                $scope.$watch('params.comparedData', function (newData, oldData) {
                    if (newData !== undefined && newData.length) { // && newData !== oldData) {
                        $scope.periodComparisonSelected = true;
                    } else if ($scope.periodComparisonSelected) {
                        $scope.periodComparisonSelected = false;
                        $scope.update();
                    }
                });

                if ($scope.kpiOptions !== undefined) {
                    $scope.kpi.setOptions($scope.kpiOptions);
                }                                                

                $scope.updateIndicators = () => {
                    if ($scope.itemsList.length > 0 && $scope.kpi.updateIndicators !== undefined) {
                        const idx = _.findIndex($scope.params.data, { "id": $scope.itemsList[0].id });
                        $scope.indicators = $scope.kpi.updateIndicators($scope.params.data[idx]);
                    }
                };

                $scope.updateTotal = function () {
                    const indicators = $scope.indicators;
                    const newTotal = {};
                    for (let i = 0; i < indicators.length; ++i) {
                        const res = $scope.kpi.compute({
                            "period": $scope.params.period,
                            "groupBy": "all",
                            "indicator": indicators[i].id,
                            "sitedata": $scope.rows.filter(row => $scope.params.sites.find(site => row.id === site.id))
                                .map(row => {
                                    return {
                                        key: indicators[i].id,
                                        value: row[indicators[i].id],
                                        time: $scope.params.period
                                    };
                                })
                        });
                        newTotal[indicators[i].id] = res.value;
                    }
                    $scope.total = newTotal;                    
                };

                $scope.updateSites = function () {                    
                    const newTableRows = [];
                    const indicators = $scope.indicators;
                    for (let i = 0; i < $scope.itemsList.length; ++i) {
                        const curItem = $scope.itemsList[i];
                        const rowSite = {
                            "name": curItem.name || curItem.display_name,
                            "period": $scope.params.period,
                            "id": curItem.id,
                            "haveItems": curItem.haveItems
                        };
                        for (let j = 0; j < indicators.length; ++j) {
                            const idx = _.findIndex($scope.params.data, { "id": curItem.id });
                            res = $scope.kpi.compute({
                                "period": $scope.params.period,
                                "groupBy": "all",
                                "indicator": indicators[j].id,
                                "sitedata": $scope.params.data[idx].data
                            });
                            rowSite[indicators[j].id] = res.value;
                        }
                        newTableRows.push(rowSite);
                        if ($scope.periodComparisonSelected) {
                            rowSite = {
                                "name": curItem.name || curItem.display_name,
                                "period": $scope.params.comparedPeriod,
                                "id": curItem.id,
                                "haveItems": curItem.haveItems,
                                "comparedPeriod": true
                            };
                            for (let j = 0; j < indicators.length; ++j) {
                                const idx = _.findIndex($scope.params.comparedData, { "id": curItem.id });
                                res = $scope.kpi.compute({
                                    "period": $scope.params.comparedPeriod,
                                    "groupBy": "all",
                                    "indicator": indicators[j].id,
                                    "sitedata": $scope.params.comparedData[idx].data
                                });
                                rowSite[indicators[j].id] = res.value;
                            }
                            newTableRows.push(rowSite);
                        }
                    }
                    $scope.rows = newTableRows;                    
                };

                $scope.update = function () {

                    WidgetStyleService.getStyle($scope.widgetId).then(function (style) {
                        $scope.setWidgetStyle(style);                        
                        $scope.updateIndicators();                        
                        $scope.updateSites();
                        if (!$scope.periodComparisonSelected) {
                            $scope.updateTotal();
                        }
                    });
                };

                $scope.setWidgetStyle = function (style) {                    
                };

                $scope.goChild = function (id) {
                    $scope.onNextItem({ $event: id });
                };
            }
        ],
        templateUrl: 'build/html/TableKPIView.html'
    };
});
