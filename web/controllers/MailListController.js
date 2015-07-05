SRFMailProControllers.controller("MailListController", ["$scope", "$http", "$cookies",
    function ($scope, $http, $cookies) {
        $scope.partial_load_status.mail_list = true;
        $scope.check_partial_load_status();

        $scope.selectMail = function(mail){
            console.log(mail);
            console.log(mail.id);
            $scope.$parent.selected_mail = mail.id;
            console.log("emit mail selected");
            console.log($scope.$parent.selected_mail);
            $scope.$emit("emit_mail_selected");
        };

        $scope.changeClass=function(mail){
            if(mail.id==$scope.selected_mail)
                return 'mail selected';
            else
                return 'mail';
        }
        


        }]);

