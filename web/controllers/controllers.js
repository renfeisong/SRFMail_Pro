var SRFMailProControllers = angular.module("SRFMailProControllers", []);

SRFMailProControllers.controller("GlobalController", ["$scope", "$http", "$cookies", "userServices", "mailServices",
    function ($scope, $http, $cookies, userServices, mailServices) {
        $scope.partial_load_status = {
            side_bar: false,
            mail_list: false,
            mail: false,
            modal_login: false,
            modal_compose: false,
            popover_dispatch: false,
            popover_label: false,
            popover_forward: false,
            popover_reject: false
        };

        $scope.check_partial_load_status = function () {
            for (var i in $scope.partial_load_status) {
                if ($scope.partial_load_status[i] == false) {
                    return;
                }
            }
            $scope.ready();
        };

        $scope.ready = function () {
            setTimeout(function () {
                if (userServices.current_user_type == USER_TYPE.NONE) {
                    $scope.show_modal("login");
                } else {
                    $scope.load_mail_list();
                }
            }, 0);
        };

        $scope.logout = function () {
            userServices.logout(
                function () {
                    location.reload();
                },
                function () {}
            );

        };

        $scope.load_mail_list = function () {
            mailServices.load_mail_list(
                function () {
                    $scope.dismiss_modal();
                    $scope.$broadcast("mail_list_did_load");
                    if (!$scope.reviewer_list) {
                        $http.get("/api/user/list_reviewers")
                            .success(function (data, status, headers, config) {
                                $scope.reviewer_list = data["reviewers"];
                            }).error(function (data, status, headers, config) {
                                console.log(data);
                            }
                        );
                    }
                    if (!$scope.worker_list) {
                        $http.get("/api/user/list_workers")
                            .success(function (data) {
                                $scope.worker_list = data.workers;
                            }).error(function (data, status, headers, config) {
                                console.log(data);
                            }
                        );
                    }
                },
                function () {}
            );
        };

        $scope.$on("emit_category_did_select", function() {
            $scope.$broadcast("broadcast_category_did_select");
        });

        $scope.$on("emit_mail_did_select", function () {
            $scope.$broadcast("broadcast_mail_did_select");
        });

        $scope.$on("emit_show_dispatch", function () {
            $scope.$broadcast("broadcast_show_dispatch");
        });

        $scope.$on("emit_show_label", function () {
            $scope.$broadcast("broadcast_show_label");
        });

        $scope.$on("emit_show_forward", function () {
            $scope.$broadcast("broadcast_show_forward");
        });

        $scope.$on("emit_show_reject", function () {
            $scope.$broadcast("broadcast_show_reject");
        });

        $scope.$on("emit_show_compose", function() {
            $scope.$broadcast("broadcast_show_compose");
            $scope.show_modal("compose");
        });

        $scope.$on("emit_show_reply", function () {
            $scope.$broadcast("broadcast_show_reply");
            $scope.show_modal("compose");
        });

        $scope.$on("emit_show_edit", function () {
            $scope.$broadcast("broadcast_show_edit");
            $scope.show_modal("compose");
        });

        $scope.$on("emit_show_labelmanage", function() {
            $scope.$broadcast("broadcast_show_labelmanage");
            $scope.show_modal("labelmanage");
        });

        $("body").on("select2:open", "select", function () {
            $(this).siblings(".select2").addClass("selected");
        }).on("select2:close", "select", function () {
            $(this).siblings(".select2").removeClass("selected");
        });

        $scope.show_modal = function (name) {
            $("#modal-" + name).addClass("show");
            $("#modal-" + name + " .modal").addClass("show");
        };

        $scope.dismiss_modal = function () {
            $(".modal").removeClass("show");
            $(".modal-background").removeClass("show");
            if ($(".redactor-box").length > 0) {
                $("textarea#compose-content").redactor("core.destroy");
            }
        };

    }
]);

SRFMailProControllers.controller("ModalController", ["$scope",
    function ($scope) {
        $scope.prevent_dismiss = function (e) {
            e.stopPropagation();
        };
    }
]);

SRFMailProControllers.controller("LoginModalController", ["$scope", "$http", "$cookies", "userServices", "mailServices",
    function ($scope, $http, $cookies, userServices, mailServices) {
        $scope.partial_load_status.modal_login = true;
        $scope.check_partial_load_status();

        $scope.submit = function () {
            userServices.login($scope.username, $scope.password,
                function() {
                    $scope.load_mail_list();
                },
                function() {}
            );
        }
    }
]);

SRFMailProControllers.controller("LabelmanageModalController", ["$scope", "$http", "$cookies", "userServices", "mailServices",
    function ($scope, $http, $cookies, userServices, mailServices) {  
        $scope.submit = function () {
           $scope.labels_updated=$scope.exist_labels;
            var url_labels_update = "/api/action/dispatcher/set_all_labels";
            alert( JSON.stringify($scope.labels_updated));
        $http.post(url_labels_update, {
                            labels:JSON.stringify($scope.labels_updated)
                        }).success(function (data, status, headers, config) {
                            if(data.code!=0)
                            {
                                    console.log(data.message);
                            }
                            else
                            {$scope.load_mail_list();
                            $scope.dismiss_modal();
                            }                            
                        }).error(function (data, status, headers, config) {
                            console.log(data);
                        });    
        }

        $scope.add_label=function(){
            var label_text=$('#label_name').val();
            var label_color=$('.simple_color_custom_chooser_css').val();

              if (!$('#tags').tagExist(label_text))
              {
                $('#tags').addTag(label_text);
            var exist_labels_length=$scope.exist_labels.length;
            $scope.exist_labels[exist_labels_length]=new Object();
            $scope.exist_labels[exist_labels_length].name=label_text;
            $scope.exist_labels[exist_labels_length].color=label_color;
        }
          update_labels();
        }

           $(document).ready(function(){
                $('.simple_color_custom_chooser_css').simpleColor({ 
                    chooserCSS: { 'background-color': 'black', 'opacity': '0.8' },
                    colors:['800000','8B0000','C71585','4B0882','800080','000080','D2691E','FF0000','FFC0CB','7B68EE','F5DEB3','FFFF00','32CD32','00BFFF','ADD8E6','D3D3D3'],
                    boxWidth:'200px',
                    boxHeight:'20px',
                    columns:18 });    
            });

         var url_labels = "/api/action/dispatcher/list_labels";
        $http.get(url_labels).success(function (data) {
                $scope.theme_labels=data.labels;
        }).error(function (data, status, headers, config) {
            console.log(data);
    });
        
        $scope.exist_labels=new Array();
        
        setTimeout(function()
        {
            
            $scope.exist_labels[0]=new Object();
            $scope.exist_labels[0].name=$scope.theme_labels[0].name;
            $scope.exist_labels[0].color=$scope.theme_labels[0].color;
            $scope.exist_labels_name=$scope.theme_labels[0].name;

        for(i=1;i<$scope.theme_labels.length;i++)
        {
            $scope.exist_labels[i]=new Object();
            $scope.exist_labels[i].name=$scope.theme_labels[i].name;
            $scope.exist_labels[i].color=$scope.theme_labels[i].color;
            $scope.exist_labels_name+=","+$scope.theme_labels[i].name;
        }

            $('#tags').tagsInput({                
                onRemoveTag:function(tag){
                    $scope.exist_labels.splice(get_label_id(tag),1);
                    update_labels();
}});

            $('#tags').importTags($scope.exist_labels_name);

            $scope.label_id=0;
            update_labels();
            
        },2000); 
    
    var update_labels=function(){
$('.tag').each(function()
          {
            var tag_text=$(this).text().substr(0 ,$(this).text().length-3);
            $(this).css("background-color",$scope.exist_labels[get_label_id(tag_text)].color);
          });
    }

     var  get_label_id=function(label_text){
            
            for(j=0;j<$scope.exist_labels.length;j++)
            {
                if($scope.exist_labels[j].name==label_text)
                    return j;
            }
    }
    

    }]);
    


SRFMailProControllers.controller("ComposeModalController", ["$scope", "$http", "$cookies", "userServices", "mailServices",
    function ($scope, $http, $cookies, userServices, mailServices) {
        $scope.partial_load_status.modal_compose = true;
        $scope.check_partial_load_status();

        $scope.edit_mode = EDIT_MODE.COMPOSE;

        $scope.$on("broadcast_show_compose", function () {
            $scope.edit_mode = EDIT_MODE.COMPOSE;
            $scope.recipient = "";
            $scope.subject = "";
            $scope.need_review = false;
            $scope.reviewer = "";
            $scope.content = "";
            $("textarea#compose-content").redactor(redactor_options);
        });

        $scope.$on("broadcast_show_reply", function () {
            $scope.edit_mode = EDIT_MODE.REPLY;
            $scope.recipient = mailServices.selected_mail.income.from[0].address;
            $scope.subject = "Re: " + mailServices.selected_mail.income.subject;
            $scope.need_review = false;
            $scope.reviewer = "";
            $scope.content = mailServices.selected_mail.income.html;
            $("textarea#compose-content").redactor(redactor_options);
        });

        $scope.$on("broadcast_show_edit", function () {
            $scope.edit_mode = EDIT_MODE.EDIT;
            $scope.recipient = mailServices.selected_mail.reply.to[0].address;
            $scope.subject = mailServices.selected_mail.reply.subject;
            $scope.content = mailServices.selected_mail.reply.html;
            $("textarea#compose-content").redactor(redactor_options);
        });

        $scope.switch_review = function () {
            if ($scope.need_review) {
                $("select#reviewer").select2({
                    data: $scope.reviewer_list,
                    placeholder: "请选择审核人"
                });
            } else {
                $("select#reviewer").select2("destroy");
            }
        };

        $scope.submit = function () {
            if ($scope.compose_form.$valid) {
                switch ($scope.edit_mode) {
                    case EDIT_MODE.COMPOSE:
                        $http.post("/api/action/worker/submit", {
                            recipients: JSON.stringify([$scope.recipient]),
                            subject: $scope.subject,
                            html: $scope.content,
                            attachments: JSON.stringify([]),
                            needReview: $scope.need_review,
                            reviewer: $scope.reviewer
                        }).success(function (data, status, headers, config) {
                            $scope.load_mail_list();
                            $scope.dismiss_modal();
                        }).error(function (data, status, headers, config) {
                            console.log(data);
                        });
                        break;
                    case EDIT_MODE.REPLY:
                        $http.post("/api/action/worker/submit", {
                            id: mailServices.selected_mail_id,
                            recipients: JSON.stringify([$scope.recipient]),
                            subject: $scope.subject,
                            html: $scope.content,
                            attachments: JSON.stringify([]),
                            needReview: $scope.need_review,
                            reviewer: $scope.reviewer
                        }).success(function (data, status, headers, config) {
                            $scope.load_mail_list();
                            $scope.dismiss_modal();
                        }).error(function (data, status, headers, config) {
                            console.log(data);
                        });
                        break;
                    case EDIT_MODE.EDIT:
                        $http.post("/api/action/reviewer/pass", {
                            id: mailServices.selected_mail_id,
                            subject: $scope.subject,
                            html: $scope.content,
                            attachments: JSON.stringify([])
                        }).success(function (data, status, headers, config) {
                            if (data.code == 0) {
                                toastr.success("发送成功", "");
                                $scope.load_mail_list();
                                $scope.dismiss_modal();
                            } else {
                                console.log(data.code + "  " + data.message);
                                toastr.error("发送失败，请重试", "");
                            }
                        }).error(function () {

                        });
                        break;
                    default :
                        break;
                }
            }
        }
    }
]);

SRFMailProControllers.controller("PopoverController", ["$scope",
    function ($scope) {
        $scope.position_popover = function (name) {
            $button = $("#show-" + name);
            var left = $button.offset().left + $button.width() / 2 - 110;
            $("#popover-" + name).css("left", left + "px");
        };
    }
]);

SRFMailProControllers.controller("DispatchPopoverController", ["$scope", "$http", "$cookies", "userServices", "mailServices",
    function ($scope, $http, $cookies, userServices, mailServices) {
        $scope.partial_load_status.popover_dispatch = true;
        $scope.check_partial_load_status();

        $scope.$on("broadcast_show_dispatch", function () {
            $scope.position_popover("dispatch");
            $("select#dispatch-readreply").select2({
                placeholder: "选择处理人...",
                data: $scope.worker_list
            });
            $("select#dispatch-readonly").select2({
                placeholder: "选择查看人...",
                data: $scope.worker_list
            });
            $("#dispatch-deadline").datetimepicker({
                minDate: 0,
                lang: "zh-cn",
                i18n: {
                    "zh-cn": {
                        months: [
                            "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
                        ],
                        dayOfWeek: [
                            "日", "一", "二", "三", "四", "五", "六"
                        ]
                    }
                }
            });
            $scope.show_popover = true;
        });

        $scope.submit = function () {
            $http.post("/api/action/dispatcher/dispatch", {
                id: mailServices.selected_mail_id,
                readonly: JSON.stringify($("select#dispatch-readonly").val()),
                readreply: JSON.stringify($("select#dispatch-readreply").val()),
                deadline: $scope.deadline == "" ? new Date($scope.deadline).toISOString() : ""
            }).success(function (data, status, headers, config) {
                if (data.code == 0) {
                    $scope.load_mail_list();
                    $scope.show_popover = false;
                } else {
                    console.log(data);
                }
            }).error(function (data, status, headers, config) {
                console.log(data);
            });
        }
    }]);


SRFMailProControllers.controller("LabelPopoverController", ["$scope", "$http", "$cookies", "userServices", "mailServices",
    function ($scope, $http, $cookies, userServices, mailServices) {
        $scope.partial_load_status.popover_label = true;
        $scope.check_partial_load_status();

        $scope.$on("broadcast_show_label", function () {
            $scope.position_popover("label");
            $scope.show_popover = true;
        });
    }
]);

SRFMailProControllers.controller("ForwardPopoverController", ["$scope", "$http", "$cookies", "userServices", "mailServices",
    function ($scope, $http, $cookies, userServices, mailServices) {
        $scope.partial_load_status.popover_forward = true;
        $scope.check_partial_load_status();


        $http.get("/api/user/list_workers")
            .success(function (data) {
                $scope.forward_worker_list = data.workers;

            }).error(function (data, status, headers, config) {
                console.log(data);
            });


        $scope.$on("broadcast_show_forward", function () {
            $scope.position_popover("forward");


            $("select#select-worker").select2({
                placeholder: "选择处理人...",
                data: $scope.forward_worker_list
            });
            $scope.show_popover = true;
        });


        $scope.confirm_fw = function () {

            $http.post('/api/action/worker/redirect', {
                'id': $scope.selected_mail_id,
                'user': $("#select-worker").select2("val")
            }).success(function () {
                toastr.success('转发成功', '');
                $scope.load_mail_list();


            }).error(function () {
                toastr.error('转发失败，请重试', '');
            });

            $scope.show_popover = false;
        };

    }
]);

SRFMailProControllers.controller("RejectPopoverController", ["$scope", "$http", "$cookies", "userServices", "mailServices",
    function ($scope, $http, $cookies, userServices, mailServices) {
        $scope.partial_load_status.popover_reject = true;
        $scope.check_partial_load_status();

        $scope.$on("broadcast_show_reject", function () {
            $scope.position_popover("reject");
            $scope.show_popover = true;
        });

        $scope.review_refuse_confirm = function () {
            $scope.show_popover = false;
            $http.post("/api/action/reviewer/reject", {
                id: mailServices.selected_mail_id,
                message: $scope.review_comment_textarea
            }).success(function () {
                toastr.success('成功退回', '');
                $scope.load_mail_list();
            }).error(function () {
                toastr.error('请重试', '');
            });

        };
    }
]);
