
class WidgetContainerImpl {

    static $inject = ["$scope"];

    constructor(private $scope: any) {

    }

    $onInit(): void {
    }

}


export default class WidgetContainer {

    private bindings: any = {
        params: '='
    };
    private controller = WidgetContainerImpl;
    private templateUrl = "build/html/WidgetContainerView.html";
    private transclude: true;    

}