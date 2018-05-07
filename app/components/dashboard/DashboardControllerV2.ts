import { DashboardParamsServiceV2 } from "../services/DashboardParamsServiceV2";

declare const window: any;

/*
 * Manage the dashboard data
 **/
function DashboardControllerV2($scope: any, paramsService: DashboardParamsServiceV2) {    

    $scope.params = paramsService;

    $scope.params.loadParams().then(function () {
        $scope.params.loadData();
    });

    $scope.switchTimeZone = function () {
        $scope.params.useTimeZone = !$scope.params.useTimeZone;
        $scope.params.reloadData();
    };

    $scope.exportPrint = function () {
        window.print();
    };

}

(<any>DashboardControllerV2).$inject = ["$scope", "DashboardParamsServiceV2"];

export = DashboardControllerV2;