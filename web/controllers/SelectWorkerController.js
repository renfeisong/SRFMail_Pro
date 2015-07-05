SRFMailProControllers.controller("SelectWorkerController", ["$scope", "$http", "$cookies",
    function ($scope, $http, $cookies) {

        $scope.sendDispatch=function(){
            var sessionID=1;

            var readreply_selected = $("#readreply").select2("val");
            if(readreply_selected.length>0)
            {
                var readreply="[\""+readreply_selected[0]+"\"";
                for(i=1;i<readreply_selected.length;i++) 
                {
                    readreply+=",\""+readreply_selected[i]+"\"";
                }
                readreply+="]"
            }

            var readonly_selected = $("#readonly").select2("val");
            if(readonly_selected.length>0)
            {
                var readonly="[\""+readonly_selected[0]+"\"";
                for(i=1;i<readonly_selected.length;i++) 
                {
                    readonly+=",\""+readonly_selected[i]+"\"";
                }
                readonly+="]"
            }

            var url = ROOT_URL + "/api/action/dispatcher/dispatch";
            $http.post(url, {
                id: sessionID,
                readonly: readonly,
                readreply: readreply
            }).success(function (data, status, headers, config) {
                if (data.status == 0) {
                } else {
                    console.log(data);
                }
            }).error(function (data, status, headers, config) {
                console.log(data);
            });
        };

        var url = ROOT_URL + "/api/user/list_workers";
        $http.get(url).success(function (data) {
                $scope.workers=data.reviewers;
            }
        }).error(function (data, status, headers, config) {
            console.log(data);
    });
        	

    	setTimeout(function() {
    			$(".select-workers").select2();
    	}, 0);	
    }]);


