<!DOCTYPE HTML>

<html>

    <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8" />
        <meta charset="utf-8" />
        <meta name="description" content="A full webos with a cool flat design." />
        <meta name="author" content="Axel Nana" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

        <title>FlatOS</title>

        <script type="text/javascript">
            if (!window.FlatOS) {
                window.FlatOS = {
                    Api: {},
                    System: {
                        Application: {}
                    },
                    UI: {},
                    Input: {},
                    Callback: {}
                };
            }
            if (!window.F) {
                window.F = {
                    System: {},
                    UI: {},
                    Input: {},
                    Cache: {}
                };
            }
        </script>

        <?php
        foreach ($cssIncludes['core'] as $css) {
            echo '<link rel="stylesheet" class="core-css" type="text/css" href="'.$css.'" />';
        }
        foreach ($cssIncludes['user'] as $css) {
            echo '<link rel="stylesheet" class="user-css" type="text/css" href="'.$css.'" />';
        }
        ?>
    </head>

    <body>

        <div id="interface-loader-wrapper" class="animated" style="display: none;"></div>

        <div id="desktop-wrapper"></div>

        <div id="notification-wrapper"></div>

        <?php
        foreach ($jsIncludes['core'] as $js) {
            echo '<script class="core-js" type="'.$js['mimetype'].'" src="'.$js['src'].'" '.$js['attr'].'></script>';
        }
        foreach ($jsIncludes['user'] as $js) {
            echo '<script class="user-js" type="text/javascript" src="'.$js.'"></script>';
        }
        ?>
    </body>

</html>