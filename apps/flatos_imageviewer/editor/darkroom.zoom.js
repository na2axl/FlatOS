var zoomCount = 1;
(function() {
    'use strict';

    var Zoom = Darkroom.Transformation.extend({
        applyTransformation: function(canvas, image, next) {
            var xy = this.options.orientation;

            image.scale(1.1*zoomCount);
            zoomCount++;

            canvas.centerObject(image);
            image.setCoords();
            canvas.renderAll();

            next();
        }
    });

    Darkroom.plugins['zoom'] = Darkroom.Plugin.extend({

        initialize: function InitDarkroomRotatePlugin() {
            var buttonGroup = this.darkroom.toolbar.createButtonGroup();

            var zoompButton = buttonGroup.createButton({
                image: 'zoom-plus'
            });

            var zoommButton = buttonGroup.createButton({
                image: 'zoom-minus'
            });

            zoompButton.addEventListener('click', this.zoomPlus.bind(this));
            zoommButton.addEventListener('click', this.zoomMinus.bind(this));
        },

        zoomPlus: function zoomPlus() {
            this.zoom('plus');
        },

        zoomMinus: function zoomMinus() {
            this.zoom('minus');
        },

        zoom: function zoom(xy) {
            this.darkroom.applyTransformation(
                new Zoom({orientation: xy})
            );
        }

    });

})();