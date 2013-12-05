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
            '<button class="btn J_Cancel" data-dismiss="modal" aria-hidden="true">取消</button>',
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

var abcDirImportTpl = [
    '<form class="form-horizontal">',
    '<div class="control-group">',
        '<label class="control-label" for="inputEmail" style="width: 100px;color: #fff;">填写应用目录</label>',
        '<div class="controls" style="margin-left: 120px">',
            '<input type="text" class="J_AbcFile" style="margin-bottom: 10px;">',
            '<div class="alert alert-info">',
                '请填写使用abc打包并且包含abc.json文件的目录',
            '</div>',
        '</div>',
    '</div>',
    '</form>'
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

                                        var postData = [];

                                        $('#pluginPop td input:checked').each(function(el){
                                            postData[$(el).attr('data-app')] = $(el).val();
                                        });

                                        if($.isEmptyObject(postData)) {
                                            alert('未选择任何应用');
                                            return;
                                        }

                                        $.post('plugin/importAbcPath', {
                                            importApp: JSON.stringify(postData)
                                        }, function(data){
                                            if(data.success) {
                                                alert('导入成功，确定后将刷新页面');
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

    $('.J_PluginLists a').click(function(ev) {
        if($(this).parents('li').attr('data-plugin')) {
            ev.preventDefault();

            if($('#pluginPop')) {
                $('#pluginPop').remove();
            }

            $(juicer(pluginPopTpl, {
                title: $(this).parents('li').attr('data-plugin'),
                content: juicer(abcDirImportTpl, {})
            })).appendTo(document.body);

            $('#pluginPop .J_Sure').click(function(ev){
                var path = $('.J_AbcFile').val();
                if(/\S/.test(path)) {
                    $.post('/plugin/importOneAbcPath', {
                        path: path
                    },function(data){
                        if(data.success) {
                            alert('导入成功，创建的规则已经加到规则库，确定后将刷新页面');
                            location.reload();
                        } else {
                            alert(data.msg);
                        }
                    });
                } else {
                    alert('请填写一个使用abc打包并且包含abc.json文件的目录');
                }
            });


            $('#pluginPop').modal();
        }
    });
});