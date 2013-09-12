/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */
$(function(){
    setTimeout(function(){
        $('.loading').show();

        $.post('plugin/loadPlugin', function(data){
            if(data.success) {
                if(data.data.length) {
                    var tpl = [];

                    $.each(data.data, function(idx, plugin){
                        tpl.push('<li data-plugin="' +plugin.name+ '">');
                        tpl.push(plugin.data);
                        tpl.push('<i class="icon-remove icon-white"></i>');
                        tpl.push('</li>');
                    });

                    $('.update-area .dropdown-menu').html(tpl.join(''));

                    $('.loading').fadeOut(function(){
                        $('.num').html(data.data.length);
                        data.data.length && $('.num-area').show();
                    });

                    $('.update-area .dropdown-menu')
                        .delegate('i', 'click', function(ev){
                            ev.stopPropagation();
                            var target = $(this).parent();
                            var pluginName = target.attr('data-plugin');
                            $.post('plugin/updateCheckTime', {
                                name : pluginName
                            }, function(data){
                                if(data.success) {
                                    target.fadeOut(function(){
                                        $(this).remove();
                                        $('.update-area .num').html(parseInt($('.update-area .num').html()) -1 );
                                    });
                                } else {
                                    alert(data.msg);
                                }
                            });
                        })
                        .delegate('a', 'click', function(ev){

                        });

                } else {
                    $('.loading').fadeOut();
                }
            }
        });

    }, 200);
});