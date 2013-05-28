/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */
$(function(){
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
});