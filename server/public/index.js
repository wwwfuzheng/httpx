/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */

$('.navbar a, .subnav a, #footer a').smoothScroll();

var ruleTpl = [
    '<div class="rule animated bounce" data-guid="${guid}">',
    '<div class="hd"><i class="${ruleCls}"></i> <strong>${title}</strong></div>',
    '<div class="bd">',
    '{@if isCombo}',
    '<p>共包含 <strong>${num}</strong> 个规则</p>',
    '{@else}',
    '<p>匹配到 <code>${pattern}</code></p>',
    '<p>替换为 <code>${target}</code></p>',
    '{@/if}',
    '</div>',
    '<i class="icon icon-edit"></i>',
    '<i class="icon icon-trash"></i>',
    '<i class="icon icon-ok"></i>',
    '</div>'
].join('');

var allHideEl = '#editRule, #comboRule, #addSolution';

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

$(function(){

    var $win = $(window),
        $body = $('body'),
        $nav = $('.subnav'),
        navHeight = $('.navbar').first().height(),
        subnavHeight = $('.subnav').first().height(),
        subnavTop = $('.subnav').length && $('.subnav').offset().top - navHeight,
        marginTop = parseInt($body.css('margin-top'), 10),
        isFixed = 0;

    processScroll();

    $win.on('scroll', processScroll);

    function processScroll() {
        var i, scrollTop = $win.scrollTop();

        if (scrollTop >= subnavTop && !isFixed) {
            isFixed = 1;
            $nav.addClass('subnav-fixed');
            $body.css('margin-top', marginTop + subnavHeight + 'px');
        } else if (scrollTop <= subnavTop && isFixed) {
            isFixed = 0;
            $nav.removeClass('subnav-fixed');
            $body.css('margin-top', marginTop + 'px');
        }
    }

    //0 普通字符串和正则 1 本地路径和文件 2 http的url 10 组合规则
    function getRuleType(s){
        return /http(s)?:\/\//.test(s) ? 2 : 0;
    }

    $('#J_SolutionList .J_RuleEnable').iCheck({
        checkboxClass: 'icheckbox_futurico',
        radioClass: 'iradio_futurico',
        increaseArea: '20%' // optional
    });

    var ruleTypeId = '#J_StringText, #J_LocalText, #J_UrlText';

    var selectBox = $("#J_RuleType").selectBoxIt({
        theme: "bootstrap",
        copyClasses: 'container'
    }).on('change', function(ev){
        $(ruleTypeId).hide();
        $(ruleTypeId.split(',')[$(this).val()]).show();
    });

    $('#rulePool')
        .on('click', '.rule', function(ev){
            //规则选择
            $(ev.currentTarget).toggleClass('rule-select');
            $('#rulePoolOperator').hide();

            if($('#rulePool .rule-select').length) {
                var srcObj = $(ev.currentTarget).position();

                $('#rulePoolOperator').css({
                    left: srcObj.left + $(ev.currentTarget).width() + 5,
                    top: srcObj.top
                });
                $('#rulePoolOperator').fadeIn();
            } else {
                $('#rulePoolOperator').hide();
            }
        })
        .on('click', '.icon-trash', function(ev){
            //规则删除
            ev.stopPropagation();
            $.post('api/delRule', {
                    guid: $(ev.target).parents('.rule').attr('data-guid')
                },
                function(data){
                    if(data.success) {
                        $.globalMessenger().post({
                            message: "规则删除成功",
                            type: 'success'
                        });

                        $(ev.target).parents('.rule').fadeOut(function(){
                            $(this).remove();
                        });
                    } else {
                        $.globalMessenger().post({
                            message: "规则删除失败",
                            type: 'error'
                        });
                    }
                });
        })
        .on('click', '.icon-edit', function(ev){
            ev.stopPropagation();
            var parent = $(ev.target).parents('.rule');

            //规则编辑
            $('#editRule').show();
            $('#editRule').attr('data-guid', parent.attr('data-guid'));
            $('#editRule .J_Pattern').val(parent.find('code:first').text());
            $('#editRule .J_Target').val(parent.find('code:last').text());
            $('#editRule .J_Title').val(parent.find('.hd strong').text());
            $('#editRule .J_IsLocalPath').attr('checked', parent.find('.J_IsLocalPath:checked').length ? 'checked': '');

            $.smoothScroll({
                scrollTarget: '#editRule'
            });
        });

    $('#rulePoolDetail .J_AddSolution').click(function(ev){
        ev.preventDefault();
        $('#addSolution .J_SelectNum').html($('#rulePool .rule-select').length);
        $('#addSolution').show();
        $.smoothScroll({
            scrollTarget: '#addSolution'
        });
    });

    $('#rulePoolDetail .J_ClearSelect').click(function(ev){
        ev.preventDefault();
        $('#rulePool .rule-select').toggleClass('rule-select');
    });

    $('#rulePoolDetail .J_ComboRule').click(function(ev){
        ev.preventDefault();
        $.smoothScroll({
            scrollTarget: '#comboRule'
        });
    });

    //添加到解决方案 返回按钮
    $('#addSolution .J_Cancel').click(function(ev){
        ev.preventDefault();
        $.smoothScroll({
            scrollTarget: '#rulePool'
        });
    });

    //拖拽
    $("#comboRule .rule-name").draggable({
        cursor: "move",
        revert: "invalid",
        helper: "clone",
        opacity: 0.7,
        stop: function(){
            $("#comboRule .step").each(function(idx, el){
                if($('.rule-name', el).length) {
                    $(el).addClass( "merge-active");
                } else {
//                    $(el).removeClass( "merge-active");
                }
            });
        }
//        containment: "#comboRule"
    });

    $("#comboRule .step").droppable({
        hoverClass: "merge-active",
        drop: function( event, ui ) {
            var self = this;

            $( self ).addClass( "merge-active").removeClass('empty');

            $(ui.draggable).fadeOut(function(){
                $(this).appendTo(self).fadeIn();

                $("#comboRule .step").each(function(idx, el){
                    if($('.rule-name', el).length) {
//                        $(el).addClass( "merge-active");
                    } else {
                        $(el).removeClass( "merge-active");
                    }
                });
            });
        }
    });

    $('#comboRule .J_Reset').click(function(ev){
        ev.preventDefault();

        $( "#comboRule .rule-name").fadeOut(function(){
            $(this).appendTo($( "#comboRule .rule-list")).fadeIn();
        });

        $('#comboRule .merge-active').removeClass('merge-active');
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

    //添加规则
    $('#addRule .J_AddRuleBtn').click(function(ev){
        ev.preventDefault();

        var rules = [], tpl = [];

        $('#addRule .rule-list-wrap').find('.well').each(function(idx, el){
            if($(el).find('.J_Pattern').val()) {
                rules.push({
                    title: $(el).find('.J_Title').val(),
                    pattern: $(el).find('.J_Pattern').val(),
                    target: $(el).find('.J_Target').val(),
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
                            ruleCls: rule.type == 1 ? 'icon-folder-open-alt': rule.type == 2? 'icon-link': 'icon-font',
                            guid: rule.guid
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
            title: $('#editRule').find('.J_Title').val(),
            pattern: $('#editRule').find('.J_Pattern').val(),
            target: $('#editRule').find('.J_Target').val(),
            type: $('#editRule').find('.J_IsLocalPath:checked').length ? 1: getRuleType($(el).find('.J_Target').val()),
            guid: $('#editRule').attr('data-guid')
        };

        $.post('api/editRule', {
                rule: JSON.stringify(editRule)
            },
            function(data){
                if(data.success) {
                    $.globalMessenger().post({
                        message: "规则编辑成功",
                        type: 'success'
                    });

                    //find the guid el and replace
                    juicer(ruleTpl, {
                        title: rule.title,
                        isCombo: false,
                        pattern: rule.pattern,
                        target: rule.target,
                        type : rule.type,
                        ruleCls: rule.type == 1 ? 'icon-folder-open-alt': rule.type == 2? 'icon-link': 'icon-font',
                        guid: rule.guid
                    })
                } else {
                    $.globalMessenger().post({
                        message: "规则编辑失败",
                        type: 'error'
                    });
                }
            });
    });

    //编辑取消
    $('#editRule .J_EditCancel').click(function(ev){
        ev.preventDefault();

        $.smoothScroll({
            scrollTarget: '#rulePool',
            afterScroll: function(){
                $('#editRule').hide();
            }
        });
    });
});