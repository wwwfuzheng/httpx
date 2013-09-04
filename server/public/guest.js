/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */

$(function(){
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
});