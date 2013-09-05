/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */

$(function(){
    $('#debug').on('click', function(ev){
        $.post('/api/debugUrl', {
            url: $('#debugValue').val()
        }, function(data){
            if(data.success) {
                var format = [];

                $.each(data.msg, function(idx, text){
                    format.push('<div>');
                    format.push(text.replace(/\t/g, ''));
                    format.push('</div>');
                });
                $('#result').html(format.join(''))
            }
        });
    });
});