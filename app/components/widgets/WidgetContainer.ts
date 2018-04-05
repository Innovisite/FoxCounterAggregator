
class WidgetContainerImpl {

    static $inject = ["$scope"];

    onNextSite: Function;

    constructor(private $scope: any) {

        $scope.getChildren = function(params:any) {
            debugger
            return params;
        }

    }

    $onInit(): void {
    }
   
    goNextSite() {        
        this.onNextSite();
    }    

}


class WidgetContainer {

    bindings: any = {
        params: '=',
        onNextSite: '&'
    };
    controller = WidgetContainerImpl;
    templateUrl = "build/html/WidgetContainerView.html";
    transclude = true;    

    constructor() {

    }

}

export = WidgetContainer;