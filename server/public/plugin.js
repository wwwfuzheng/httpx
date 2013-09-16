/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */
var pluginPopTpl = [
    '<div id="pluginPop" class="modal hide fade">',
        '<div class="modal-header">',
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>',
            '<h3 id="myModalLabel">${title}</h3>',
            '</div>',
            '<div class="modal-body">',
            '$${content}',
            '</div>',
            '<div class="modal-footer">',
            '<button class="btn" data-dismiss="modal" aria-hidden="true">取消</button>',
            '<button class="btn btn-primary J_Sure">确定</button>',
        '</div>',
    '</div>'].join('');

var abcImportTpl = [
    '<p>当前检测到ABC中有新应用变化，可以自动导入并生成规则的有：</p>',
    '<table class="table"><thead><th></th><th>应用</th><th>路径</th></thead><tbody>',
    '{@each data as value, key}',
    '<tr><td><input type="checkbox" value="${value}" data-app="${key}"></td><td>${key}</td><td>${value}</td></tr>',
    '{@/each}',
    '</tbody></table>'
].join('');

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
                            if($(this).attr('href') == '#') {
                                ev.preventDefault();
                                if($('#pluginPop')) {
                                    $('#pluginPop').remove();
                                }

                                if($(this).parents('li').attr('data-plugin') == 'abc') {
                                    $(juicer(pluginPopTpl, {
                                        title: $(this).parents('li').attr('data-plugin'),
                                        content: juicer(abcImportTpl, {
                                            data: $.parseJSON($(this).attr('data-json'))
                                        })
                                    })).appendTo(document.body);
                                    $('#pluginPop').modal();

                                    $('#pluginPop .J_Sure').click(function(ev){

                                        var postData = {};

                                        $('#pluginPop td input:checked').each(function(el){
                                            postData[$(el).attr('data-app')] = $(el).val();
                                        });

                                        $.post('plugin/importAbcPath', {
                                            importApp: JSON.stringify(postData)
                                        }, function(data){
                                            if(data.success) {
                                                location.reload();
                                            } else {
                                                alert(data.msg);
                                            }
                                        });
                                    });
                                }

                            }
                        });

                } else {
                    $('.loading').fadeOut();
                }
            }
        });

    }, 200);
});