$(function () {
    $("#jqGrid").jqGrid({
        url: baseURL + 'app/financequestionandanswer/list',
        datatype: "json",
        colModel: [			
			{ label: '序号', name: 'id', index: 'id', width: 50, key: true },
			{ label: '问题', name: 'title', index: 'title', width: 80 },
			{ label: '答案', name: 'content', index: 'content', width: 80 },
			{ label: '顺序', name: 'displayOrder', index: 'display_order', width: 80 },
            { label: '状态', name: 'isDelete', index: 'is_delete', width: 80,
                formatter: function (value, options, row) {
                    return value == 0 ? "上线" : "下线"
                }
            },
            { label: '上线时间', name: 'onlineTime', index: 'online_time', width: 80 },
            { label: '备注', name: 'remark', index: 'remark', width: 80 }
        ],
		viewrecords: true,
        height: 385,
        rowNum: 10,
		rowList : [10,30,50],
        rownumbers: true, 
        rownumWidth: 25, 
        autowidth:true,
        multiselect: true,
        pager: "#jqGridPager",
        jsonReader : {
            root: "page.list",
            page: "page.currPage",
            total: "page.totalPage",
            records: "page.totalCount"
        },
        prmNames : {
            page:"page", 
            rows:"limit", 
            order: "order"
        },
        gridComplete:function(){
        	//隐藏grid底部滚动条
        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
        }
    });
});

var vm = new Vue({
	el:'#financeApp',
	data:{
        messageTitle:"",
		showList: true,
		title: null,
		financeQuestionAndAnswer: {}
	},
	methods: {
        loadAll: function () {
            //调用的后台接口
            let url = baseURL + 'app/financequestionandanswer/getSelectList';
            //从后台获取到对象数组
            axios.get(url).then((response) => {
                //在这里为这个数组中每一个对象加一个value字段, 因为autocomplete只识别value字段并在下拉列中显示
                if(null != response)
            {vm.restaurants = response.data;}
        }).catch((error) => {
                console.log(error);
        });
        },
        querySearchAsync(queryString, cb) {
            var restaurants = vm.restaurants;
            var results = queryString ? restaurants.filter(vm.createStateFilter(queryString)) : restaurants;
            cb(results);
        },
        createStateFilter(queryString) {
            return (state) =>{return (state.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);};
        },
        handleSelect(item) {
            vm.messageTitle = item.value;
        },
		query: function () {
			vm.reload();
		},
		add: function(){
			vm.showList = false;
			vm.title = "新增Q&A";
			vm.financeQuestionAndAnswer = {};
            $("#div_showLogo img").remove();
            var inputText = "<img class=\'layui-upload-img\' id=\'showLogo\' style=\'height:80px;width:80px;\'>";
            $('#div_showLogo').append(inputText);
		},
		update: function (event) {
			var id = getSelectedRow();
			if(id == null){
				return ;
			}
			vm.showList = false;
            vm.title = "修改Q&A";
            
            vm.getInfo(id)
		},
		saveOrUpdate: function (event) {
			var url = vm.financeQuestionAndAnswer.id == null ? "app/financequestionandanswer/save" : "app/financequestionandanswer/update";
			$.ajax({
				type: "POST",
			    url: baseURL + url,
                contentType: "application/json",
			    data: JSON.stringify(vm.financeQuestionAndAnswer),
			    success: function(r){
			    	if(r.code === 0){
						alert('操作成功', function(index){
							vm.reload();
						});
					}else{
						alert(r.msg);
					}
				}
			});
		},
		del: function (event) {
			var ids = getSelectedRows();
			if(ids == null){
				return ;
			}
			
			confirm('确定要删除选中的记录？', function(){
				$.ajax({
					type: "POST",
				    url: baseURL + "app/financequestionandanswer/delete",
                    contentType: "application/json",
				    data: JSON.stringify(ids),
				    success: function(r){
						if(r.code == 0){
							alert('操作成功', function(index){
								$("#jqGrid").trigger("reloadGrid");
							});
						}else{
							alert(r.msg);
						}
					}
				});
			});
		},
        tapebelow: function (event) {
            var ids = getSelectedRows();
            if (ids == null) {
                return;
            }
            confirm('确定要上线选中的记录？', function () {
                $.ajax({
                    type: "POST",
                    url: baseURL + "app/financequestionandanswer/tapeout",
                    contentType: "application/json",
                    data: JSON.stringify(ids),
                    success: function (r) {
                        if (r.code == 0) {
                            alert('操作成功', function (index) {
                                $("#jqGrid").trigger("reloadGrid");
                            });
                        } else {
                            alert(r.msg);
                        }
                    }
                });
            });
        },
        below: function (event) {
            var ids = getSelectedRows();
            if (ids == null) {
                return;
            }
            confirm('确定要下线选中的记录？', function () {
                $.ajax({
                    type: "POST",
                    url: baseURL + "app/financequestionandanswer/tapebelow",
                    contentType: "application/json",
                    data: JSON.stringify(ids),
                    success: function (r) {
                        if (r.code == 0) {
                            alert('操作成功', function (index) {
                                $("#jqGrid").trigger("reloadGrid");
                            });
                        } else {
                            alert(r.msg);
                        }
                    }
                });
            });
        },
        getInfo: function(id){
			$.get(baseURL + "app/financequestionandanswer/info/"+id, function(r){
                vm.financeQuestionAndAnswer = r.financeQuestionAndAnswer;
            });
		},
		reload: function (event) {
			vm.showList = true;
			var page = $("#jqGrid").jqGrid('getGridParam','page');
			$("#jqGrid").jqGrid('setGridParam',{
                postData: {
                    'messageTitle': vm.messageTitle
                },
                page:1
            }).trigger("reloadGrid");
		}
	}
});