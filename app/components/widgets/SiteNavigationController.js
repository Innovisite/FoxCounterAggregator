/**
 * @class SiteNavigationController
 * @memberOf FSCounterAggregatorApp
 */
function SiteNavigationController($scope, $controller) {

    this.params = undefined;
    this.originalSites = undefined;
    this.originalData = undefined;
    this.originalCompData = undefined;

    const that = this;

    $scope.init = function (params) {

        that.params = Object.assign({}, params);

        $scope.$watch("params.sites", function (newSites, oldSites) {
            if (newSites !== undefined && newSites.length) {
                that.originalSites = newSites.slice(0);
                that.params.sites = that.originalSites;
            } else {
                that.params.sites = newSites;
            }
        });

        $scope.$watch('params.data', function (newData, oldData) {
            if (newData !== undefined && newData.length) {
                that.originalData = newData.slice(0);
                that.params.data = that.originalData;
            } else {
                that.params.data = newData;
            }
        });

        $scope.$watch('params.comparedData', function (newData, oldData) {
            if (newData != undefined && newData.length) {
                that.originalCompData = newData.slice(0);
                that.params.comparedData = that.originalCompData;
            } else {
                that.params.comparedData = newData;
            }
        });

        return that.params;
    };

    this.test = function ($event) {

        if ($event.path.length) {
            let subPart = this.originalSites;
            $event.path.split("/")
                .forEach(elt => {
                    subPart = subPart.find(item => item.id == elt);
                });
            this.params.sites = subPart.items;
        } else {
            this.params.sites = this.originalSites;
        }

    };

}

SiteNavigationController.$inject = ["$scope", "$controller"];

module.exports = SiteNavigationController;
