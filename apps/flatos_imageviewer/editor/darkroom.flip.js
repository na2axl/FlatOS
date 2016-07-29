(function() {
    'use strict';

    var Flip = Darkroom.Transformation.extend({
        applyTransformation: function(canvas, image, next) {
            var xy = this.options.orientation;

            image[xy](-1);
            image.scale(-1);

            canvas.centerObject(image);
            image.setCoords();
            canvas.renderAll();

            next();
        }
    });

    Darkroom.plugins['flip'] = Darkroom.Plugin.extend({

        initialize: function InitDarkroomRotatePlugin() {
            var buttonGroup = this.darkroom.toolbar.createButtonGroup();

            var flipxButton = buttonGroup.createButton({
                image: 'flip-x'
            });

            var flipyButton = buttonGroup.createButton({
                image: 'flip-y'
            });

            flipxButton.addEventListener('click', this.flipX.bind(this));
            flipyButton.addEventListener('click', this.flipY.bind(this));
        },

        flipX: function flipX() {
            this.flip('setScaleX');
        },

        flipY: function flipY() {
            this.flip('setScaleY');
        },

        flip: function flip(xy) {
            this.darkroom.applyTransformation(
                new Flip({orientation: xy})
            );
        }

    });

})();