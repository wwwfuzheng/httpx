/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */

$('#footer a').smoothScroll();

$('.tips').popover();

$._messengerDefaults = {
    'maxMessages': 3
};

var ruleTpl = [
    '<div class="rule animated bounce" data-guid="${guid}" data-type="${type}">',
    '<div class="hd"><i class="{@if type==1}icon-folder-open-alt{@else if type==2}icon-link{@else if type==10}icon-list-ol{@else}icon-font{@/if}"></i> <strong title="${title}">${simpleTitle}</strong></div>',
    '<div class="bd">',
    '{@if isCombo}',
    '<p>共包含 <strong>${num}</strong> 个规则</p>',
    '{@else}',
    '<p>匹配到 <code>${pattern}</code></p>',
    '<p>替换为 <code>{@if target}${target}{@else}""{@/if}</code></p>',
    '{@/if}',
    '</div>',
    '{@if !isCombo}',
    '<i class="icon icon-edit"></i>',
    '{@/if}',
    '<i class="icon icon-trash"></i>',
    '<i class="icon icon-ok"></i>',
    '</div>'
].join('');

var solutionTpl = [
    '<table class="table table-hover" style="background-color: #2E3236;">',
        '<thead>',
            '<tr>',
                '<th class="enable">是否启用</th>',
                '<th class="title">规则名</th>',
                '<th>可用操作</th>',
            '</tr>',
        '</thead>',
        '<tbody></tbody>',
    '</table>'
].join('');

var solutionWrapTpl = [
    '<div class="well animated bounce" data-guid="${guid}">',
        '<h4>${title}</h4>',
        '<div class="alert alert-info">当前方案没有规则，可以从规则库中选择一些规则添加到这里</div>',
    '</div>'
].join('');

var solutionLineTpl = [
    '<tr data-guid="${guid}" class="animated flash">',
        '<td class="enable">',
            '<input type="checkbox" class="J_RuleEnable" checked>',
            '</td>',
            '<td class="title">${simpleTitle}</td>',
            '<td>',
                '<a href="#"><i class="icon-link J_LinkTo"></i></a> ',
                '<a href="#"><i class="icon-remove J_RemoveRule"></i></a>',
            '</td>',
        '</tr>'
].join('');

var PlaceHolder = {
    start: function(el, fn){
        el = $(el);
        $('#J_PlaceHolder').animate({
            height: '500px'
        },200, function(){
            el.show();
            $.smoothScroll({
                scrollTarget: el,
                afterScroll: function() {
                    el.spotlight({
                        color: '#fff'
                    });
                    fn && fn(el);
                }
            });
        });
    },
    reset: function(fn){
        $('#spotlight').remove();
        $('#J_PlaceHolder').animate({
            height: '70px'
        },200, fn);
    }
};

function newGuid(){
    var guid = "";

    for (var i = 1; i <= 32; i++){

        var n = Math.floor(Math.random()*16.0).toString(16);
        guid +=   n;
        if((i==8)||(i==12)||(i==16)||(i==20))
            guid += "-";
    }

    return guid;
}

function subString(str, len, hasDot) {
    if(!str) return '';
    var newLength = 0;
    var newStr = "";
    var chineseRegex = /[^\x00-\xff]/g;
    var singleChar = "";
    var strLength = str.replace(chineseRegex, "**").length;
    for (var i = 0; i < strLength; i++) {
        singleChar = str.charAt(i).toString();
        if (singleChar.match(chineseRegex) != null) {
            newLength += 2;
        }
        else {
            newLength++;
        }
        if (newLength > len) {
            break;
        }
        newStr += singleChar;
    }

    if (hasDot && strLength > len) {
        newStr += "...";
    }
    return newStr;
}

// Return a helper with preserved width of cells
var fixHelper = function(e, ui) {
    ui.children().each(function() {
        $(this).width($(this).width());
    });
    return ui;
};

$(function(){
    //0 普通字符串和正则 1 本地路径和文件 2 http的url 10 组合规则
    function getRuleType(s){
        return /http(s)?:\/\//.test(s) ? 2 : 0;
    }

    var sortable = function(el){
        //拖拽排序
        $(el).sortable({
            helper: fixHelper
        }).disableSelection()
            .on('sortupdate', function(ev, ui){
                var table = $(ev.target).parent(), guids = [];

                $(table).find('tr').each(function(idx, el){
                    guids.push($(el).attr('data-guid'));
                });

                $.post('/api/sortRule', {
                    t: new Date().getTime(),
                    rules: JSON.stringify(guids),
                    solutionId: $(table).parents('.well').attr('data-guid')
                }, function(data){
                    if(data.success) {
                        $.globalMessenger().post({
                            message: "规则重排序成功",
                            type: 'success'
                        });
                    } else {
                        $.globalMessenger().post({
                            message: "规则重排序失败",
                            type: 'error'
                        });
                    }
                });
            });
    };

    sortable($("#J_SolutionList tbody"));

    //合并规则排序
    $('#comboRule tbody').sortable({
        helper: fixHelper
    }).disableSelection()
        .on('sortupdate', function(ev, ui){
            $('#comboRule .seq').each(function(idx, el){
                if(idx == 0) {
                    $(el).html(idx+1 + ' <i class="icon-key" title="主规则"></i>');
                } else {
                    $(el).text(idx+1);
                }
            });
        });

    //解决方案输入框
    $('#J_NewSolutionName').on('focus', function(ev){
        $(this).animate({
            width: '356px'
        }, 500);
    }).on('blur', function(ev){
        if(!$(this).val()) {
            $(this).animate({
                width: '156px'
            }, 500);
        }
    });
    //添加解决方案
    $('#J_AddNewSolution').on('click', function(ev){
        var title = $.trim($('#J_NewSolutionName').val());

        if(!title) {
            $.globalMessenger().post({
                message: "方案的名字不能为空，随便填一下吧",
                type: 'error'
            });
            return;
        }

        $.post('api/addSolutionTitle', {
                t: new Date().getTime(),
                title: title
            },
            function(data){
                if(data.success) {
                    $.globalMessenger().post({
                        message: "自定义解决方案添加成功",
                        type: 'success'
                    });

                    $.smoothScroll({
                        offset: $('#J_SolutionList .well:last').offset().top - 200,
                        afterScroll: function(){
                            $('#J_SolutionList .span12').append(juicer(solutionWrapTpl, {
                                guid: data.data.guid,
                                title: data.data.title
                            }));

                            //添加到下拉中
                            $('#J_SolutionSwitch, #J_SolutionIds').append(juicer('<option value="${guid}">${title}</option>', {
                                guid: data.data.guid,
                                title: data.data.title
                            }));

                            //clean
                            $('#J_NewSolutionName').val('').width('156px');
                        }
                    });
                } else {
                    $.globalMessenger().post({
                        message: "自定义解决方案添加失败",
                        type: 'error'
                    });
                }
            });
    });

    //解决方案切换
    $('#J_SolutionSwitch').change(function(ev){
        $.post('api/switchSolution', {
            t: new Date().getTime(),
            guid: $('#J_SolutionSwitch').find('option:selected').val()
        }, function(data){
            if(data.success) {
                $.globalMessenger().post({
                    message: "当前使用的解决方案切换成功",
                    type: 'success'
                });
                //添加规则到解决方案这里也要改
                $("#J_SolutionIds").get(0).selectedIndex=$('#J_SolutionSwitch').get(0).selectedIndex+1;
            } else {
                $.globalMessenger().post({
                    message: "当前使用的解决方案切换失败",
                    type: 'error'
                });
            }
        });

    });

    // 切换代理环境 - 桐人
    $('#J_ProxyEnvTypeSwitch').change(function(ev){
        $.post('api/switchProxyEvnType', {
            t: new Date().getTime(),
            guid: $('#J_ProxyEnvTypeSwitch').find('option:selected').val()
        }, function(data){
            if(data.success) {
                $.globalMessenger().post({
                    message: "默认代理的环境切换成功",
                    type: 'success'
                });
            } else {
                $.globalMessenger().post({
                    message: "默认代理的环境切换失败",
                    type: 'error'
                });
            }
        });
    });
    // 切换输出编码 - 桐人
    $('#J_ProxyCharsetSwitch').change(function(ev){
        $.post('api/switchProxyCharset', {
            t: new Date().getTime(),
            guid: $('#J_ProxyCharsetSwitch').find('option:selected').val()
        }, function(data){
            if(data.success) {
                $.globalMessenger().post({
                    message: "默认输出编码切换成功",
                    type: 'success'
                });
            } else {
                $.globalMessenger().post({
                    message: "默认输出编码切换失败",
                    type: 'error'
                });
            }
        });
    });

    //规则启用取消
    $('#J_SolutionList .J_RuleEnable').iCheck({
        checkboxClass: 'icheckbox_polaris',
        radioClass: 'iradio_polaris',
        increaseArea: '-10' // optional
    });

    $('#J_SolutionList').on('click', '.J_RuleEnable', function(ev){
        $.post('api/enableRule', {
                t: new Date().getTime(),
                solutionId: $(ev.target).parents('.well').attr('data-guid'),
                guid: $(ev.target).parents('tr').attr('data-guid'),
                enable: !$(ev.target).parent().hasClass('checked')
            },
            function(data){
                if(data.success) {
                    $.globalMessenger().post({
                        message: "规则状态切换成功",
                        type: 'success'
                    });
                } else {
                    $.globalMessenger().post({
                        message: "规则状态切换失败",
                        type: 'error'
                    });
                }
            });
    });

    $('#J_SolutionList')
        .on('click', '.J_RemoveRule', function(ev){
            ev.preventDefault();

            $.post('api/removeRule', {
                    t: new Date().getTime(),
                    solutionId: $(ev.target).parents('.well').attr('data-guid'),
                    guid: $(ev.target).parents('tr').attr('data-guid')
                },
                function(data){
                    if(data.success) {
                        $.globalMessenger().post({
                            message: "移除规则成功",
                            type: 'success'
                        });

                        $(ev.target).parents('tr').fadeOut(function(){
                            $(this).remove();
                        });
                    } else {
                        $.globalMessenger().post({
                            message: "移除规则失败",
                            type: 'error'
                        });
                    }
                });
        }).on('click', '.J_LinkTo', function(ev){
            ev.preventDefault();

            var ruleId = $(ev.target).parents('tr').attr('data-guid');

            var rule;
            $('#rulePool .rule').each(function(idx, el){
                if($(el).attr('data-guid') === ruleId) {
                    rule = el;
                }
            });

            if(rule) {
                $.smoothScroll({
                    offset: $(rule).offset().top - 200,
                    beforeScroll: function(){
                        $(rule).removeClass('animated bounce');
                    },
                    afterScroll: function(){
                        $(rule).addClass('animated bounce');
                    }
                });
            }
        }).on('click', '.J_DelSolution', function(ev){
            ev.preventDefault();

            if(confirm('确定要删除场景么，场景被删除后规则依旧会被保留在规则库，等待后续添加使用？')) {
                $.post('api/delSolution', {
                        t: new Date().getTime(),
                        solutionId: $(ev.target).parents('.well').attr('data-guid')
                    },
                    function(data){
                        if(data.success) {
                            $.globalMessenger().post({
                                message: "删除场景成功",
                                type: 'success'
                            });

                            var guid = $(ev.target).parents('.well').attr('data-guid');


                            $(ev.target).parents('.well').fadeOut(function(){
                                $(this).remove();

                                $("#J_SolutionSwitch option[value='" + guid+"']").remove();
                                $("#J_SolutionIds option[value='" + guid+"']").remove();
                            });
                        } else {
                            $.globalMessenger().post({
                                message: "删除场景失败",
                                type: 'error'
                            });
                        }
                    });
            }
        });

    $('#rulePool')
        .on('click', '.rule', function(ev){
            //规则选择
            $(ev.currentTarget).toggleClass('rule-select');
            $('#rulePoolOperator').hide();

            if($('#rulePool .rule-select').length) {
                var srcObj;
                if($(ev.currentTarget).hasClass('rule-select')) {
                    srcObj = $(ev.currentTarget);
                } else {
                    srcObj = $('#rulePool .rule-select:last');
                }

                $('#rulePoolOperator').css({
                    left: srcObj.position().left + srcObj.width() +  5,
                    top: srcObj.position().top
                });

                $('#rulePoolOperator').fadeIn();
            } else {
                $('#rulePoolOperator').hide();
            }
        })
        .on('click', '.icon-trash', function(ev){
            //规则删除
            ev.stopPropagation();

            if(!confirm('如果规则删除，包含此规则的场景里的副本会一起删除哦，确定吗？')) {
                return;
            }

            var guid = $(ev.target).parents('.rule').attr('data-guid');

            $.post('api/delRule', {
                    t: new Date().getTime(),
                    guid: guid
                },
                function(data){
                    if(data.success) {
                        $.globalMessenger().post({
                            message: "规则删除成功，包含此规则的场景里的副本将一并移除",
                            type: 'success'
                        });

                        $(ev.target).parents('.rule').fadeOut(function(){
                            $(this).remove();
                        });

                        $('#J_SolutionList tr').filter(function(idx){
                            return $(this).attr('data-guid') === guid;
                        }).fadeOut(function(){
                            $(this).remove();
                        });

                    } else {
                        $.globalMessenger().post({
                            message: "规则删除失败，可能规则已被删除",
                            type: 'error'
                        });
                    }
                });
        })
        .on('click', '.icon-edit', function(ev){
            ev.stopPropagation();
            var parent = $(ev.target).parents('.rule');

            if(parent.attr('data-type') === '10') {
                $.post('api/getComboRules', {
                    t: new Date().getTime(),
                    guid: parent.attr('data-guid')
                }, function(data){
                    if(data.success) {
                        var tpl = [];
                        $.each(data.data.comboRule.groups, function(idx, guid){
                            tpl.push(juicer('<tr data-guid="${guid}"><td class="seq">${idx}  {@if idx == 1}<i class="icon-key" title="主规则"></i>{@/if}</td><td>${title}</td></tr>', {
                                idx: idx+1,
                                guid: guid,
                                title: data.data.rules[guid].title
                            }));
                        });
                        $('#comboRule tbody').html(tpl.join(''));
                        $('#comboRule table').attr('data-guid', parent.attr('data-guid'));

                        //set value
                        $('#comboRule .J_ComboRuleName').val(data.data.comboRule.title);
                        PlaceHolder.start('#comboRule');
                    } else {
                        $.globalMessenger().post({
                            message: "获取组合规则信息失败",
                            type: 'error'
                        });
                    }
                });

            } else {
                //规则编辑
                $('#editRule').attr('data-guid', parent.attr('data-guid'));
                $('#editRule .J_Pattern').val(parent.find('code:first').text());
                $('#editRule .J_Target').val(parent.find('code:last').text());
                $('#editRule .J_Title').val(parent.find('.hd strong').attr('title'));
                if(parent.attr('data-type') === '1') {
                    $('#editRule .J_IsLocalPath').attr('checked', 'checked');
                } else {
                    $('#editRule .J_IsLocalPath').removeAttr('checked');
                }
                PlaceHolder.start('#editRule');
            }
        })
        .on('mouseenter', '.rule',  function(ev){
            //组合规则匹配关联规则高亮
            var parent = $(ev.currentTarget);
            if(parent.attr('data-type') == '10') {
                var groups = parent.attr('data-groups').split(',');
                $('#rulePool .rule').each(function(idx, ruleEl){
                    if($.inArray($(ruleEl).attr('data-guid'), groups) != -1) {
                        $(ruleEl).addClass('related-rule');
                    }
                });
            }
        })
        .on('mouseleave', '.rule', function(ev){
            var parent = $(ev.currentTarget);
            if(parent.attr('data-type') == '10') {
                $('#rulePool .rule').removeClass('related-rule');
            }
        });

    //把规则添加到解决方案
    $('#rulePoolDetail .J_AddSolution').click(function(ev){
        ev.preventDefault();
        $('#addSolution .J_SelectNum').html($('#rulePool .rule-select').length);
        PlaceHolder.start('#addSolution');
    });

    $('#rulePoolDetail .J_ClearSelect').click(function(ev){
        ev.preventDefault();
        $('#rulePool .rule-select').toggleClass('rule-select');
    });

    $('#comboRule .J_ComboRuleName').on('focus', function(){
        $(this).animate({
            width: '356px'
        }, 500);
    }).on('blur', function(){
        if(!$(this).val()) {
            $(this).animate({
                width: '156px'
            }, 500);
        }
    });

    $('#rulePoolDetail .J_ComboRule').click(function(ev){
        ev.preventDefault();

        var tpl = [];
        $('#rulePool .rule-select').filter(function(idx, el) {
            return $(el).attr('data-type') != 10;
        }).each(function(idx, el){
            tpl.push(juicer('<tr data-guid="${guid}"><td class="seq">${idx} {@if idx == 1}<i class="icon-key" title="主规则"></i>{@/if}</td><td>${title}</td></tr>', {
                idx: idx+1,
                guid: $(el).attr('data-guid'),
                title: $(el).find('strong').attr('title')
            }));
        });
        $('#comboRule tbody').html(tpl.join(''));

        PlaceHolder.start('#comboRule');
    });

    //取消组合规则
    $('#comboRule .J_Cancel').click(function(ev){
        ev.preventDefault();

        $.smoothScroll({
            scrollTarget: '#rulePool',
            afterScroll: function() {
                $('#comboRule table').removeAttr('data-guid');
                $('#comboRule').css({
                    zIndex: 0,
                    position: 'static'
                }).hide();
                PlaceHolder.reset();
            }
        });
    });

    $('#comboRule .J_Save').click(function(ev){
        ev.preventDefault();

        var groups = [];
        $('#comboRule tbody tr').each(function(idx, el){
            groups.push($(el).attr('data-guid'));
        });

        if(!groups.length) {
            $.globalMessenger().post({
                message: "请添加一些规则再尝试组合",
                type: 'error'
            });
            return;
        }

        var rules = [{
            title: $.trim($('#comboRule .J_ComboRuleName').val() || '我的自定义组合规则'),
            groups: groups,
            type: 10,
            guid: newGuid()
        }];

        $.post('api/addRule', {
                t: new Date().getTime(),
                rules: JSON.stringify(rules)
            },
            function(data){
                if(data.success) {
                    var tpl = [];
                    $.each(rules, function(idx, rule){
                        tpl.push(juicer(ruleTpl, {
                            title: rule.title,
                            isCombo: true,
                            type : 10,
                            guid: rule.guid,
                            simpleTitle: subString(rule.title, 16, true),
                            num: rule.groups.length
                        }));
                    });

                    $.smoothScroll({
                        offset: $('#rulePool .rule:last').offset().top - 200,
                        afterScroll: function(){
                            $('#rulePoolDetail').append(tpl.join(''));
                            $('#comboRule table').removeAttr('data-guid');
                            //clean form
                            $('#comboRule .J_ComboRuleName').val('');
                            PlaceHolder.reset();
                            //规则选中取消
                            $('#rulePool .rule-select').removeClass('rule-select');
                            $('#rulePoolOperator').hide();
                            $('#comboRule').hide();

                            $.globalMessenger().post({
                                message: "组合规则添加成功",
                                type: 'success'
                            });
                        }
                    });
                } else {
                    $.globalMessenger().post({
                        message: "组合规则添加失败",
                        type: 'error'
                    });
                }
            });

    });

    //添加规则模板
    $('#addRule .J_AddRuleTpl').click(function(ev){
        ev.preventDefault();

        $('#addRule .rule-list-wrap').append($('#J_AddRuleTpl').val());

        $('#addRule .well:last').find('.close').bind('click', function(ev){
            ev.preventDefault();
            $(this).parents('.well').remove();
        });
    });

    //show add rule area
    $('#J_ShowAddRuleArea').click(function(ev){
        ev.preventDefault();

        PlaceHolder.start('#addRule');
    });

    $('#addRule .J_Cancel').click(function(ev){
        ev.preventDefault();

        $.smoothScroll({
            scrollTarget: '#rulePool',
            afterScroll: function(){
                $('#addRule').css({
                    zIndex: 0,
                    position: 'static'
                }).hide().find('form').get(0).reset();
                PlaceHolder.reset();
            }
        });
    });

    //添加规则
    $('#addRule .J_AddRuleBtn').click(function(ev){
        ev.preventDefault();

        var rules = [], tpl = [];

        $('#addRule .rule-list-wrap').find('.well').each(function(idx, el){
            if($(el).find('.J_Pattern').val()) {
                rules.push({
                    title: $.trim($(el).find('.J_Title').val() || '我的自定义规则'),
                    pattern: $.trim($(el).find('.J_Pattern').val()),
                    target: $.trim($(el).find('.J_Target').val()),
                    type: $(el).find('.J_IsLocalPath:checked').length ? 1: getRuleType($(el).find('.J_Target').val()),
                    guid: newGuid()
                });
            }
        });

        if(!rules.length) {
            $.globalMessenger().post({
                message: '请先填写一些规则再添加',
                type: 'error'
            });
            return;
        }

        $.globalMessenger().run({
            successMessage: '保存成功',
            errorMessage: '保存失败',
            progressMessage: '数据保存中...'
        }, {
            url: 'api/addRule',
            type: 'POST',
            data: {
                t: new Date().getTime(),
                rules: JSON.stringify(rules)
            },
            success: function(data){
                if(data.success) {
                    $.each(rules, function(idx, rule){
                        tpl.push(juicer(ruleTpl, {
                            title: rule.title,
                            isCombo: false,
                            pattern: rule.pattern,
                            target: rule.target,
                            type : rule.type,
                            guid: rule.guid,
                            simpleTitle: subString(rule.title, 16, true)
                        }));
                    });

                    $.smoothScroll({
                        offset: $('#rulePool .rule:last').offset().top - 200,
                        afterScroll: function(){
                            $('#rulePoolDetail').append(tpl.join(''));

                            //clean form
                            $('#addRule .form-horizontal').get(0).reset();

                            $('#addRule .error').removeClass('error');

                            $('#addRule .close').parents('.well').remove();
                            $('#addRule').hide();
                            PlaceHolder.reset();
                        }
                    });
                }
            }
        });

    });

    //添加规则表单校验
    $('#addRule, #editRule').on('blur', '.J_Pattern', function(ev) {
        if(!$(this).val()) {
            $(this).parents('.control-group').addClass('error');
        } else {
            $(this).parents('.control-group').removeClass('error');
        }
    });

    //编辑保存
    $('#editRule .J_EditRuleBtn').click(function(ev){
        ev.preventDefault();
        var editRule = {
            title: $.trim($('#editRule').find('.J_Title').val() || '我的自定义规则'),
            pattern: $('#editRule').find('.J_Pattern').val(),
            target: $('#editRule').find('.J_Target').val(),
            type: $('#editRule').find('.J_IsLocalPath:checked').length ? 1: getRuleType($('#editRule').find('.J_Target').val()),
            guid: $('#editRule').attr('data-guid')
        };

        $.post('api/editRule', {
                t: new Date().getTime(),
                rule: JSON.stringify(editRule)
            },
            function(data){
                if(data.success) {
                    $.globalMessenger().post({
                        message: "规则编辑成功",
                        type: 'success'
                    });


                    var editTargetEl = $.grep($('#rulePool .rule'), function(el){
                        return $(el).attr('data-guid') == editRule.guid;
                    });

                    $.smoothScroll({
                        offset: $(editTargetEl).offset().top - 200,
                        afterScroll: function(){
                            //find the guid el and replace
                            $(editTargetEl).replaceWith(juicer(ruleTpl, {
                                title: editRule.title,
                                isCombo: false,
                                pattern: editRule.pattern,
                                target: editRule.target,
                                type : editRule.type,
                                guid: editRule.guid,
                                simpleTitle: subString(editRule.title, 16, true)
                            }));

                            //clean form
                            $('#editRule .form-horizontal').get(0).reset();

                            $('#addRule .error').removeClass('error');

                            $('#editRule').hide();
                            PlaceHolder.reset();
                        }
                    });

                } else {
                    $.globalMessenger().post({
                        message: "规则编辑失败",
                        type: 'error'
                    });
                }
            });
    });

    //编辑取消
    $('#editRule .J_Cancel').click(function(ev){
        ev.preventDefault();

        $.smoothScroll({
            scrollTarget: '#rulePool',
            afterScroll: function(){
                $('#editRule').css({
                    zIndex: 0,
                    position: 'static'
                }).hide();
                PlaceHolder.reset();
            }
        });
    });

    //确定添加到解决方案
    $('#addSolution .J_Sure').click(function(ev){
        ev.preventDefault();

        //collect rule guid
        var guids = [], id, titles = {};
        $('#rulePool .rule-select').each(function(idx, rule){
            id = $(rule).attr('data-guid');
            if(id) {
                guids.push(id);
                titles[id] = $(rule).find('strong').attr('title');
            }
        });

        if(!guids.length) {
            $.globalMessenger().post({
                message: "请从规则库中选择规则后再添加",
                type: 'error'
            });

            return;
        }

        if(!$('#J_SolutionIds option:selected').length) {
            $.globalMessenger().post({
                message: "请选择一个解决方案",
                type: 'error'
            });

            return;
        }

        var solutionId = $('#J_SolutionIds option:selected').val();

        $.post('api/addSolution', {
                t: new Date().getTime(),
                guids: JSON.stringify(guids),
                solutionId: solutionId
            },
            function(data){
                if(data.success) {
                    $.globalMessenger().post({
                        message: data.msg,
                        type: 'success'
                    });

                    var tpl = [], solutionTarget;

                    $('#J_SolutionList .well').each(function(idx, el){
                        if($(el).attr('data-guid') === solutionId) {
                            solutionTarget = el; //.well
                        }
                    });

                    if(!$(solutionTarget).find('table').length) {
                        //不存在table的时候，需要创建
                        $(solutionTarget).append(juicer(solutionTpl, {}));
                        $(solutionTarget).find('.alert').remove();
                        sortable($(solutionTarget).find('tbody'));
                    }
                    //规则选中取消
                    $('#rulePool .rule-select').removeClass('rule-select');
                    $('#rulePoolOperator').hide();

                    $.smoothScroll({
                        scrollTarget: '#J_SolutionList',
                        afterScroll: function(){
                            PlaceHolder.reset();
                            $.each(data.data.guids, function(idx, guid) {
                                tpl.push(juicer(solutionLineTpl, {
                                    guid: guid,
                                    simpleTitle: subString(titles[guid], 20, true)
                                }));
                            });

                            //add html
                            $(solutionTarget).find('tbody').append(tpl.join(''));

                            $('#J_SolutionList .J_RuleEnable').iCheck({
                                checkboxClass: 'icheckbox_polaris',
                                radioClass: 'iradio_polaris',
                                increaseArea: '-10' // optional
                            });

                            $('#addSolution').hide();

                            setTimeout(function(){
                                $(solutionTarget).find('.animated').removeClass('animated flash');
                            }, 2000);
                        }
                    });

                } else {
                    $.globalMessenger().post({
                        message: data.msg || "添加解决方案失败",
                        type: 'error'
                    });
                }
            });
    });

    //添加到解决方案 返回按钮
    $('#addSolution .J_Cancel').click(function(ev){
        ev.preventDefault();
        $.smoothScroll({
            scrollTarget: '#rulePool',
            afterScroll: function(){
                $('#addSolution').css({
                    zIndex: 0,
                    position: 'static'
                }).hide();
                PlaceHolder.reset();
            }
        });
    });

    $('.J_QS').click(function(ev){
        ev.preventDefault();

        if(window.guideStart) {
            window.guideStart();
        } else {
            $.getScript('guide.js');
        }
    });
});