/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */

$('.navbar a, .subnav a').smoothScroll();

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

    $('#J_SolutionList input').iCheck({
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


    });
});