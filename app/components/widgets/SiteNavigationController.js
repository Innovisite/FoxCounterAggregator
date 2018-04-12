/**
 * @class SiteNavigationController
 * @memberOf FSCounterAggregatorApp
 */
function SiteNavigationController($scope, $controller) {

    this.params = undefined;
    this.originalSites = undefined;
    this.originalData = undefined;
    this.originalCompData = undefined;
    this.curIdx = 0;

    const that = this;

    $scope.init = function (params) {

        that.curIdx = 0;
        that.params = Object.assign({}, params);

        $scope.$watch("params.sites", function (newSites, oldSites) {
            if (newSites !== undefined && newSites.length) {
                that.originalSites = newSites.slice(0);
                that.curIdx = 0;
                that.params.sites = [that.originalSites[that.curIdx]];
            } else {
                that.params.sites = newSites;
            }
        });

        $scope.$watch('params.data', function (newData, oldData) {
            if (newData !== undefined && newData.length) {
                that.originalData = newData.slice(0);
                const curSite = that.originalSites[that.curIdx];
                that.params.data = [that.originalData.find(e => e.id == curSite.id)];
            } else {
                that.params.data = newData;
            }
        });

        $scope.$watch('params.comparedData', function (newData, oldData) {
            if (newData != undefined && newData.length) {
                that.originalCompData = newData.slice(0);
                const curSite = that.originalSites[that.curIdx];
                that.params.comparedData = [that.originalCompData.find(e => e.id == curSite.id)];
            } else {
                that.params.comparedData = newData;
            }
        });        

        return that.params;
    };

    this.test = function ($event) {
        this.curIdx = ((this.curIdx + 1) % this.originalSites.length);
        const curSite = this.originalSites[that.curIdx];
        this.params.sites = [curSite];
        this.params.data = [this.originalData.find(e => e.id == curSite.id)];

        if (this.params.comparedData) {
            this.params.comparedData = [this.originalCompData.find(e => e.id == curSite.id)];
        }
    };

}

SiteNavigationController.$inject = ["$scope", "$controller"];

module.exports = SiteNavigationController;
