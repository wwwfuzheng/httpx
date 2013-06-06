/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */

$('.navbar a, .subnav a, #footer a').smoothScroll();

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

    $('#rulePool .rule').click(function(ev){
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
    });

    $('#rulePoolDetail .J_AddSolution').click(function(ev){
        ev.preventDefault();
        $('#addSolution .J_SelectNum').html($('#rulePool .rule-select').length);
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


});