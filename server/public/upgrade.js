/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */
$(function(){
    $.post('api/getlastest', function(data){
        if(data.success) {
            if(data.current != data.cfg['dist-tags'].latest) {
                $('<a class="btn btn-info btn-small" id="J_UpdateTip" style="display:none;background-color:#8D46B0" href="https://github.com/czy88840616/avalon-node/blob/master/CHANGELOG.md" target="_blank">亲，有新版本可以升级哦 <button type="button" style="float:none;" class="close" data-dismiss="alert">×</button></a>')
                    .appendTo($('.nav')[0])
                    .fadeIn()
                    .one('mouseover', function(ev){
                        $.post('/api/updatechecktime');
                    });

                $('#J_UpdateTip').tooltip({
                    placement:"bottom",
                    title:"当前版本：" + data.current + "，最新版本："+ data.cfg['dist-tags'].latest
                });

                $('#J_UpdateTip .close').click(function(ev){
                    ev.preventDefault();
                    $('#J_UpdateTip').tooltip('hide');
                });
            } else {
                //如果相同版本，也要更新时间戳
                $.post('/api/updatechecktime');
            }
        }
    });
});