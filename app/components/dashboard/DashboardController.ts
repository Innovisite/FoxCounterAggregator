import { DashboardParamsService } from "../services/DashboardParamsService";
import { USER_LIVE_REFRESH_RATE } from "../types/user";
import { QueryPeriod } from "../types/data";

declare const window: any;
declare const angular: any;
declare const moment: any;

/*
 * Manage the dashboard data
 **/
function DashboardController($scope: any, $interval: any, paramsService: DashboardParamsService) {    

    $scope.params = paramsService;    

    $scope.params.loadParams().then(function () {
        $scope.params.loadData()
            .then(() => true);
    });

    $scope.switchTimeZone = function () {
        $scope.params.useTimeZone = !$scope.params.useTimeZone;
        $scope.params.reloadData();
    };

    $scope.exportPrint = function () {
        window.print();
    };    

}

(<any>DashboardController).$inject = ["$scope", "$interval", "DashboardParamsService"];

export = DashboardController;