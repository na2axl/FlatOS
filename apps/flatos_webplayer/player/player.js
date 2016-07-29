(function($) {

    var common = conf = {};

    var timeOut;

    var formatTime = function (time) {
        var date = new Date(time * 1000);

        var formatted = zeropad(date.getMinutes())+':'+zeropad(date.getSeconds());

        return formatted;
    };

    common.createElement = function(tag, attributes, innerHTML) {
        try {
            var el = document.createElement(tag);
            for (var key in attributes) {
                if (!attributes.hasOwnProperty(key)) continue;
                if (key === 'css') {
                    common.css(el, attributes[key]);
                } else {
                    common.attr(el, key, attributes[key]);
                }
            }
            el.innerHTML = innerHTML || '';
            return el;
        } catch (e) {
            if (!$) throw e;
            return $('<' + tag + '>' + innerHTML + '</' + tag + '>').attr(attributes)[0];
        }
    };

    $.fn.mplayer = function(opts) {
        return this.each(function() {
            if (typeof opts === 'string') opts = {type: opts};
            var root = $(this);
            if (opts.type == 'audio') {
                var mp = common.createElement('div', {'class': 'fp-player'}, '<audio class="mp-engine"></audio>');
            }
            else if (opts.type == 'video') {
                var mp = common.createElement('div', {'class': 'fp-player'}, '<video class="mp-engine"></video>');
            }
            var ui = common.createElement('div', {'class': 'fp-ui'}, '\
                <img class="cover" />\
                <div class="waiting">\
                    <em></em>\
                    <em></em>\
                    <em></em>\
                </div>\
                <a class="fullscreen"></a>\
                <a class="unload"></a>\
                <p class="speed"></p>\
                <div class="controls">\
                    <a class="prev"></a>\
                    <a class="play"></a>\
                    <a class="next"></a>\
                    <a class="loop"></a>\
                    <a class="shuffle"></a>\
                    <div class="timeline">\
                        <div class="buffer"></div>\
                        <div class="progress"></div>\
                    </div>\
                    <div class="timeline-tooltip fp-tooltip"></div>\
                    <div class="volume">\
                        <a class="mute"></a>\
                        <div class="volumeslider">\
                            <div class="volumelevel"></div>\
                        </div>\
                    </div>\
                </div>\
                <div class="time">\
                    <em class="elapsed">00:00</em>\
                    <em class="remaining"></em>\
                    <em class="duration">00:00</em>\
                </div>\
                <div class="message"><h2></h2><p></p></div>'.replace(/class="/g, 'class="fp-'));
            root
                .empty()
                .html($(mp))
                .append($(ui))
                .addClass('is-mouseout')
                .hover(
                    function() {
                        clearTimeout(timeOut);
                        var $el = $(this);
                        $el.removeClass('is-mouseout').addClass('is-mouseover');
                        timeOut = setTimeout(function() {
                            $el.removeClass('is-mouseover').addClass('is-mouseout');
                        }, 5000);
                    },
                    function() {
                        clearTimeout(timeOut);
                        var $el = $(this);
                        $el.removeClass('is-mouseover').addClass('is-mouseout');
                    }
                )
                .mousemove(function() {
                    clearTimeout(timeOut);
                    var $el = $(this);
                    $el.removeClass('is-mouseout').addClass('is-mouseover');
                    timeOut = setTimeout(function() {
                        $el.removeClass('is-mouseover').addClass('is-mouseout');
                    }, 5000);
                })
                .click(function() {
                    clearTimeout(timeOut);
                    var $el = $(this);
                    $el.removeClass('is-mouseout').addClass('is-mouseover');
                    timeOut = setTimeout(function() {
                        $el.removeClass('is-mouseover').addClass('is-mouseout');
                    }, 5000);
                });
            var api  = initMPlayer(this, opts);
            root.data('mplayer', api);
        });
    };

    function initMPlayer(el, opts) {

        var engine = $(".mp-engine");
        var container = $(el);

        var api = {
            conf: $.extend({}, conf, opts),
            playing: false,
            disabled: false,
            finished: false,
            loading: false,
            muted: false,
            lastVolume: 1,
            paused: false,
            playlist: [],
            inPlaylist: false,
            ready: false,
            video: {
                width: 0,
                height: 0
            },

            _initEngine: function() {
                if (api.conf.type == 'video') {
                    api.video.width  = engine[0].videoWidth;
                    api.video.height = engine[0].videoHeight;
                }
                api._initEvents();
                if (api.conf.loop) {
                    container.find('.fp-loop').addClass('active');
                }
                if (api.conf.shuffle) {
                    container.find('.fp-shuffle').addClass('active');
                }
                if (api.conf.volume) {
                    api.volume(api.conf.volume);
                }
            },

    		_updatePlayingTime: function() {
    			var $timeCtn = container.find('.fp-time'),
    				$progress = container.find('.fp-progress'),
    				$count = $timeCtn.find('.fp-elapsed'),
    				$duration = $timeCtn.find('.fp-duration'),
    				$player = engine;

    			var currentTime = $player[0].currentTime,
    				duration = formatTime($player[0].duration),
    				count = formatTime(currentTime);

                if (api.playing) {
    				$progress.css('width', api.finishPercentage() + '%');
        			$count.html(count);
        			$duration.html(duration);
                }
    		},

    		_initEvents: function () {

                container.find('.fp-player').click(function() {
    				if (api.playing) {
    					api.pause();
    				} else {
    					api.play();
    				}
                });

                container.find('.fp-mute').click(function() {
                    api.mute();
                });
    			container.find('.fp-timeline')
                .mousedown(function(e) {
                    var goTo = function(e) {
                        parent = container.find('.fp-timeline').offset();
                        target = {top: e.pageY, left: e.pageX};
                        x = target.left - parent.left;
                        console.log(x);
                        wrapperWidth = container.find('.fp-timeline').width();
                        percent = x / wrapperWidth;
                        duration = engine[0].duration;
                        api.goTo(duration * percent);
                    };
                    goTo(e);
        			$(this).mousemove(goTo);
                })
    			.mouseup(function() {
                    $(this).off('mousemove');
                })
                .hover(function(e) {
                    var setX = function(e) {
                        parent = container.find('.fp-controls').offset();
                        target = {top: e.pageY, left: e.pageX};
                        x = target.left - parent.left - (container.find('.fp-timeline-tooltip').width() / 2);
                        wrapperWidth = container.find('.fp-timeline').width();
                        percent = (target.left - container.find('.fp-timeline').offset().left) / wrapperWidth;
                        duration = engine[0].duration;
                        container.find('.fp-timeline-tooltip').css('left', x).text(formatTime(duration * percent));
                    };
                    setX(e);
        			$(this).mousemove(setX);
                }, function() {
                    $(this).off('mousemove');
                });

    			container.find('.fp-volumeslider')
                .mousedown(function(e) {
                    var goTo = function(e) {
                        parent = container.find('.fp-volumeslider').offset();
                        target = {top: e.pageY, left: e.pageX};
                        x = target.left - parent.left;
                        wrapperWidth = container.find('.fp-volumeslider').width();
                        percent = x / wrapperWidth;
                        api.volume(percent);
                    };
                    goTo(e);
        			$(this).mousemove(goTo);
                })
    			.mouseup(function() {
                    $(this).off('mousemove');
                });

                container.find('.fp-prev').click(function() {
    				api.prev();
    			});
    			container.find('.fp-play').click(function() {
    				if (api.playing) {
    					api.pause();
    				} else {
    					api.play();
    				}
    			});
    			container.find('.fp-next').click(function() {
    				api.next();
    			});
    			container.find('.fp-loop').click(function() {
    				api.toggleLooping();
    			});
    			container.find('.fp-shuffle').click(function() {
    				api.toggleShuffle();
    			});

    			engine.on('ended', function() {
                    api.pause();
                    api.next();
    			});

                engine.on('timeupdate', function() {
    				api._updatePlayingTime();
    			});

    			engine.on('error', function(e) {
    				api.error('Error when trying to play the media file');
    			});
    		},

            load: function(audio, callback) {
                if (!api.disabled) {
                    api.loading = true;
                    engine[0].onloadeddata = function() {
                        api._initEngine();
                        if (api.conf.autoplay || api.playing) {
                            api.play();
                            engine[0].autoplay = true;
                        }
                        api.loading = false;
                        if ($.isFunction(callback)) {
                            callback();
                        }
                        api.ready = true;
                    };
                    engine[0].src = audio;
                }

                return api;
            },

            play: function() {
                engine[0].play();

                api.playing = true;

                container.addClass('is-playing');

                return api;
            },

    		pause: function () {
    			engine[0].pause();

                api.playing = false;

                container.removeClass('is-playing');

                return api;
    		},

            volume: function(level) {
                if (api.ready) {
                    api.muted = false;
                    level = Math.min(Math.max(level, 0), 1);
                    engine[0].volume = level;
                    api.conf.volume = level;
                    container.find('.fp-volumelevel').css('width', (level * 100)+'%');
                }

                return api;
            },

            mute: function() {
                if (!api.muted) {
                    api.lastVolume = engine[0].volume;
                    api.volume(0);
                    api.muted = true;
                }
                else {
                    api.volume(api.lastVolume);
                }

                return api;
            },

            showPlaylist: function() {
                if (api.inPlaylist) {
                    container.parent().children('.fp-playlist-items').animate({left: '-100%'});
                    container.animate({left: 0});
                    api.inPlaylist = false;
                }
                else {
                    container.parent().children('.fp-playlist-items').animate({left: 0});
                    container.animate({left: '100%'});
                    api.inPlaylist = true;
                }
            },

            toggleLooping: function() {
                if (api.conf.loop) {
                    api.conf.loop = false;
                }
                else {
                    api.conf.loop = true;
                }
                container.find('.fp-loop').toggleClass('active');
            },

            toggleShuffle: function() {
                if (api.conf.shuffle) {
                    api.conf.shuffle = false;
                }
                else {
                    api.conf.shuffle = true;
                }
                container.find('.fp-shuffle').toggleClass('active');
            },

            on: function(event, callback) {
                if ($.isFunction(callback)) {
                    engine.on(event, callback);
                }

                return api;
            },

            finishPercentage: function() {
                return (engine[0].currentTime / engine[0].duration) * 100;
            },

            setCover: function(url) {
                container.find('.fp-cover').attr('src', url);
            },

            goTo: function(time) {
                if (api.ready) {
                    engine[0].currentTime = time;
                }

                return api;
            }
        };

        return api;

    }

})(jQuery);