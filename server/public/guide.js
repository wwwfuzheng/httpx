/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */

function guideStart(){
    bootstro.start('.bootstro', {
        nextButtonText: '下一步',
        prevButtonText: '上一步',
        finishButtonText: '我明白了，开始用吧',
        stopOnBackdropClick: false,
        stopOnEsc: false,
        onStep: function(ev){
            if(ev.idx == 4) {
                var srcObj = $('#rulePool .rule:last').addClass('rule-select');
                $('#rulePoolOperator').css({
                    left: srcObj.position().left + srcObj.width() +  5,
                    top: srcObj.position().top
                });
                $('#rulePoolOperator').show();
            } else if(ev.idx == 5 || ev.idx == 3) {
                $('#rulePool .rule-select').removeClass('rule-select');
                $('#rulePoolOperator').hide();
            }
        },
        onExit: function(ev){
            $.post('api/setHelpStatus');
        }
    });
}
$(document).ready(function(){
    $('.brand').addClass('bootstro').attr({
        'data-bootstro-title':"我叫Arrow",
        'data-bootstro-content':"Arrow作为一个新版的assets代理工具，有着许多功能，这里介绍了基本的使用方法。",
        'data-bootstro-placement':"bottom",
        'data-bootstro-step':"0"
    });

    $('#rulePool').addClass('bootstro').attr({
        'data-bootstro-title':"规则库",
        'data-bootstro-content':"就像一个大容器存放着各种规则，它的功能仅仅只是存放和管理。",
        'data-bootstro-placement':"top",
        'data-bootstro-step':"1"
    });

    $('#J_ShowAddRuleArea').addClass('bootstro').attr({
        'data-bootstro-content':"点这个按钮就可以添加规则了。",
        'data-bootstro-placement':"left",
        'data-bootstro-step':"2"
    });

    $('#rulePool .rule:first').addClass('bootstro').attr({
        'data-bootstro-content':"鼠标移动上去就可以看到隐藏的操作啦(编辑和删除)。",
        'data-bootstro-placement':"top",
        'data-bootstro-step':"3"
    });

    $('#rulePool .rule:last').addClass('bootstro').attr({
        'data-bootstro-content':"而选中规则之后则可以添加到任意场景。",
        'data-bootstro-placement':"top",
        'data-bootstro-step':"4"
    });

    $('#J_SolutionList').addClass('bootstro').attr({
        'data-bootstro-title':"场景",
        'data-bootstro-content':"从规则库中挑选需要的规则就变成了场景，我们可以想象成\“一次项目，一次日常或者任意需要新开一个集合的情况\”。",
        'data-bootstro-placement':"top",
        'data-bootstro-step':"5"
    });

    $('#J_SolutionList .well:first').addClass('bootstro').attr({
        'data-bootstro-content':"默认会有一个全局场景，全局场景会在所有的自定义场景生效，不过优先级低于自定义场景，您也可以只使用全局场景。",
        'data-bootstro-placement':"top",
        'data-bootstro-step':"6"
    });

    $('#J_SolutionList .icheckbox_polaris:first').addClass('bootstro').attr({
        'data-bootstro-content':"在这里可以切换规则的是否启用。",
        'data-bootstro-placement':"top",
        'data-bootstro-step':"7"
    });

    $('#J_SolutionList .J_RemoveRule:first').addClass('bootstro').attr({
        'data-bootstro-content':"点击这里可以方便的从场景移除规则，放心，规则库中的这条规则不会被删除，类似于\"快捷方式\"。",
        'data-bootstro-placement':"top",
        'data-bootstro-step':"8"
    });

    $('#dashboard .alert-info').addClass('bootstro').attr({
        'data-bootstro-content':"在这里指明了当前使用的场景，同时可以进行切换。",
        'data-bootstro-placement':"bottom",
        'data-bootstro-step':"9"
    });

    $('#dashboard .J_AddNewSolution').addClass('bootstro').attr({
        'data-bootstro-content':"如果场景不够，这里可以新建一个场景。",
        'data-bootstro-placement':"bottom",
        'data-bootstro-step':"10"
    });

    $('.nav>li:last').addClass('bootstro').attr({
        'data-bootstro-content':"QuickStart教程就到这里，开始去添加第一个规则吧。如果想重复观看，入口在这里，可以重复点击查看。",
        'data-bootstro-placement':"bottom",
        'data-bootstro-step':"11"
    });

    guideStart();
});