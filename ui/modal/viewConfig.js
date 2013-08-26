$('head').append($('<link rel="stylesheet" type="text/css">').attr('href', 'ui/modal/viewConfig.css'));

NPMap.builder.ui = NPMap.builder.ui || {};
NPMap.builder.ui.modal = NPMap.builder.ui.modal || {};
NPMap.builder.ui.modal.viewConfig = (function() {
  var $code = $('#modal-viewConfig-code'),
      $modal = $('#modal-viewConfig').modal().on('show.bs.modal shown.bs.modal', function() {
        var formatted = '',
            json = JSON.stringify(NPMap.config, null, 2).split('\n');

        $.each(json, function(i, v) {
          if (v !== null) {
            if (i !== 0 && i !== json.length - 1) {
              formatted += '        ' + v + '\n';
            } else {
              if (i === json.length - 1) {
                formatted += '        ' + v;
              } else {
                formatted += v + '\n';
              }
            }
          }
        });
        $code.val('<!doctype html>\n<html>\n  <head>\n  </head>\n  <body>\n    <div id="map" style="height:100%;width:100%;"></div>\n    <script>\n      var NPMap = {\n        config: ' + formatted + '\n      };\n    </scr' + 'ipt>;\n  </body>\n</html>');
      });

  $('[rel=tooltip]').tooltip();

  return {};
})();