+function ($) {

    FlatOS.Input.Mouse = function (options) {

        this.options = options || {
            disabled: false
        };

    };

    FlatOS.Input.Mouse.prototype.setOption = function (opt, val) {
        this.options[opt] = val;
    };

    FlatOS.Input.Mouse.prototype.buttonDown = function (id, el, callback) {
        $(el).on('mousedown.flatos.'+id, callback);
    };

    FlatOS.Input.Mouse.prototype.buttonDownOnce = function (id, el, callback) {
        $(el).one('mousedown.flatos.'+id, callback);
    };

    FlatOS.Input.Mouse.prototype.unbindButtonDown = function (id, el) {
        $(el).unbind('mousedown.flatos.'+id);
    };

    FlatOS.Input.Mouse.prototype.buttonUp = function (id, el, callback) {
        $(el).on('mouseup.flatos.'+id, callback);
    };

    FlatOS.Input.Mouse.prototype.buttonUpOnce = function (id, el, callback) {
        $(el).one('mouseup.flatos.'+id, callback);
    };

    FlatOS.Input.Mouse.prototype.unbindButtonUp = function (id, el) {
        $(el).unbind('mouseup.flatos.'+id);
    };

    FlatOS.Input.Mouse.prototype.leftClick = function (id, el, callback) {
        $(el).on('click.flatos.'+id, callback);
    };

    FlatOS.Input.Mouse.prototype.leftClickOnce = function (id, el, callback) {
        $(el).one('click.flatos.'+id, callback);
    };

    FlatOS.Input.Mouse.prototype.unbindLeftClick = function (id, el) {
        $(el).unbind('click.flatos.'+id);
    };

    FlatOS.Input.Mouse.prototype.rightClick = function (id, el, callback) {
        $(el).on('contextmenu.flatos.'+id, function (e) {
            if (e.button === 2) {
                e.preventDefault();
                e.stopPropagation();
                callback(e);
            }
        });
    };

    FlatOS.Input.Mouse.prototype.rightClickOnce = function (id, el, callback) {
        $(el).one('contextmenu.flatos.'+id, function (e) {
            if (e.button === 2) {
                e.preventDefault();
                e.stopPropagation();
                callback(e);
            }
        });
    };

    FlatOS.Input.Mouse.prototype.unbindRightClick = function (id, el) {
        $(el).unbind('contextmenu.flatos.'+id);
    };

    FlatOS.Input.Mouse.prototype.doubleClick = function (id, el, callback) {
        $(el).on('dblclick.flatos.'+id, callback);
    };

    FlatOS.Input.Mouse.prototype.doubleClickOnce = function (id, el, callback) {
        $(el).one('dblclick.flatos.'+id, callback);
    };

    FlatOS.Input.Mouse.prototype.unbindDoubleClick = function (id, el) {
        $(el).unbind('dblclick.flatos.'+id);
    };

    FlatOS.Input.Mouse.prototype.contextualMenu = function (el, menu) {

        var $ul = $(menu),
            i   = 0;

        if (typeof menu === 'object') {
            $ul = $('<ul></ul>');
            for (var group in menu) {
                i++;
                for (var m in menu[group]) {
                    var $li = $('<li><a>'+menu[group][m].name+'</a></li>');
                    if (menu[group][m].disabled) {
                        $li.addClass('disabled');
                    }
                    if (menu[group][m].icon) {
                        $li.children('a').before('<img src="'+menu[group][m].icon+'" />');
                    }
                    if (menu[group][m].title) {
                        $li.addClass('title');
                    }
                    if ($.isFunction(menu[group][m].callback)) {
                        $li.mousedown(menu[group][m].callback);
                    }
                    $li.appendTo($ul);
                }
                $ul.append('<li class="separator"></li>');
            }
            $ul.find('li.separator').eq(i-1).remove();
        }

        this.element = $ul
            .addClass('flatos-contextual-menu')
            .addClass('animated');

        var that = this;

        this.rightClick('contextualMenu', el, function (e) {

            if (that.options.disabled) {
                return false;
            }

            // Hide the menu
            var clickFn = function () {
                that.element.removeClass('fadeIn');
                that.element.addClass('fadeOut');
                setTimeout(function () {
                    that.element.detach();
                }, 500);
            };

            // Now you're sure the contextmenu will be opened
            var y = e.pageY;
            var x = e.pageX;

            that.element
                .hide()
                .appendTo('body')
                .removeClass('fadeOut')
                .addClass('fadeIn')
                .show();

            var maxY = y + that.element.height();
            var maxX = x + that.element.width();

            if (maxY > $(window).height()) { // Si le curseur est en bas de page, on remonte le menu contextuel
                y -= that.element.height();
            }

            if (maxX > $(window).width()) { // Si le curseur est trop a droite, on le decale a gauche
                x -= that.element.width();
            }

            // Afficher le menu
            that.element.hide().css({
                top: y,
                left: x
            }).removeClass('fadeOut').addClass('fadeIn').show();

            // Hover events
            that.element.find('a').hover(function() {
                that.element.find('li.hover').removeClass('hover');
                $(this).parent().addClass('hover');
            },
            function() {
                that.element.find('li.hover').removeClass('hover');
            });

            // When items are selected
            var itemSelect = function (event) {
                clickFn();
                event.preventDefault();
            };
            that.element.find('li:not(.disabled) a').each(function () {
                $a = $(this);
                $a.unbind('click').click(itemSelect);
            });

            // Hide bindings
            setTimeout(function () { // Delay for Mozilla
                $(document).one('mousedown', function () {that.element.detach();});
            }, 0);

            e.preventDefault();

        });
    };

}(jQuery);