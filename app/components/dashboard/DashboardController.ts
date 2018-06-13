import { DashboardParamsService } from "../services/DashboardParamsService";

declare const window: any;

/*
 * Manage the dashboard data
 **/
function DashboardController($scope: any, paramsService: DashboardParamsService) {    

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

(<any>DashboardController).$inject = ["$scope", "DashboardParamsService"];

export = DashboardController;