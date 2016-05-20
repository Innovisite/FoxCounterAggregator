/**
 * @class UserEditor
 */
angular.module('FSCounterAggregatorApp')
    .directive("fcaUserEditor", function () {
	return {
            restrict: 'E',
            scope : {
		user: '=' ,
		isNew: '=',
		signal_submit:'&onSubmit',
		signal_close: '&onClose'
	    },
            templateUrl: "build/html/UserEditor.html",
            
            link: function (scope) {

		scope.currentUser = scope.user;
		
		scope.isDirty = function() {
                    return !angular.equals(scope.currentUser, scope.user);
		};

		scope.submit = function () {
                    angular.copy(scope.currentUser, scope.user);
                    if(scope.signal_submit) {
			scope.signal_submit();
		    }
		    scope.close();
		};
		
		scope.close = function () {
                    if(scope.signal_close) {
			scope.signal_close();
		    }
		};

		scope.resetPassword = function() {
		    scope.user.$resetPassword()
			.then(function(user) {
			    scope.currentUser = angular.copy(user);
			});
		};
		
		scope.$watch("user", function (newVal) {
                    if(newVal) {
			scope.currentUser = angular.copy(newVal);
		    }
		});
            }
	};
    });


