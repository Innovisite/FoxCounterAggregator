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

    let liveStopPromise: any;

    // use this variable to prevent multiple calls during live mode    
    let dataLoadingLock: boolean = false;    

    $scope.params = paramsService;
    
    $scope.$watch('params.period', (newData: QueryPeriod, oldData: QueryPeriod) => {
        if(newData !== undefined) {            
            paramsService.updateLiveMode();
        }
    });

    $scope.stopLive = function () {
        if (angular.isDefined(liveStopPromise)) {
            $interval.cancel(liveStopPromise);
            liveStopPromise = undefined;
            dataLoadingLock = false;
        }
    };

    $scope.startLive = () => {        
        $scope.stopLive();
        if (paramsService.hasLiveModeEnabled()) {
            paramsService.updateLiveMode();
            liveStopPromise = $interval(() => {
                if (paramsService.liveMode) {
                    $scope.reloadDataCheckLock();
                }
            }, paramsService.liveConfig.refresh_rate || USER_LIVE_REFRESH_RATE);
        }
    };

    $scope.reloadDataCheckLock = () => {
        if (!dataLoadingLock) {
            console.log("LIVE MODE RELOAD = ", moment());
            dataLoadingLock = true;
            $scope.params.reloadData()
                .then(() => dataLoadingLock = false, () => dataLoadingLock = false);
        }
    };

    $scope.params.loadParams().then(function () {
        $scope.params.loadData()
            .then(() => $scope.startLive());
    });

    $scope.switchTimeZone = function () {
        $scope.params.useTimeZone = !$scope.params.useTimeZone;
        $scope.params.reloadData();
    };

    $scope.exportPrint = function () {
        window.print();
    };

    $scope.$on('$destroy', () => {
        $scope.stopLive();
    });

}

(<any>DashboardController).$inject = ["$scope", "$interval", "DashboardParamsService"];

export = DashboardController;