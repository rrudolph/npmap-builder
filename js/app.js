var NPMap = NPMap || {};

NPMap.builder = (function() {
  $(document).ready(function() {
    $('#map-description').editable();
    $('#map-title').editable();
    $('#modal-addDataLayer').on('hidden', function() {
      // TODO: Clear all invalid fields and reset forms.
    });
    $('#modal-addDataLayer').on('shown', function() {
      $('#layerName').focus();
    });
    $('#modal-viewConfig').on('shown', function() {
      var formatted = '',
          json = JSON.stringify(NPMap.config, null, 2).split('\n');

      $.each(json, function(i, v) {
        console.log(v);

        if (i !== 0 && i !== json.length - 1) {
          formatted += '        ' + v + '\n';
        } else {
          if (i === json.length - 1) {
            formatted += '        ' + v;
          } else {
            formatted += v + '\n';
          }
        }
      });

      $('#code').val('<!doctype html>\n<html>\n  <head>\n  </head>\n  <body>\n    <div id="map" style="height:500px;width:500px;"></div>\n    <script>\n      var NPMap = {\n        config: ' + formatted + '\n      };\n    </scr' + 'ipt>;\n  </body>\n</html>');
    });
    $('[rel=tooltip]').tooltip();
  });

  return {
    _handlers: {
      /**
       *
       */
      _layerTypeOnChange: function(value) {
        $.each($('#url div'), function(i, div) {
          var $div = $(div);

          if ($div.attr('id')) {
            if ($div.attr('id') === value) {
              $div.show();
            } else {
              $div.hide();
            }
          }
        });
      }
    },
    /**
     *
     */
    addLayer: function() {
      var $layerName = $('#layerName'),
          config,
          errors = [],
          name = $layerName.val();

      if (!name) {
        errors.push($layerName);
      }

      if (typeof NPMap.config.layers === 'undefined') {
        NPMap.config.layers = [];
      }

      if ($('#ArcGisServerRest').is(':visible')) {
        var $url = $('#ArcGisServerRest-url'),
            url = $url.val();

        if (!url) {
          errors.push($url);
        }

        config = {
          "type": "ArcGisServerRest",
          "url": url
        };
      } else if ($('#CartoDb').is(':visible')) {

      } else if ($('#Kml').is(':visible')) {

      } else if ($('#GeoJson').is(':visible')) {

      } else if ($('#TileStream').is(':visible')) {

      }

      if (errors.length) {
        $.each(errors, function(i, $el) {
          $el.parent().parent().addClass('error');
        });
      } else {
        var $layers = $('#layers');

        config.name = name;
        NPMap.config.layers.push(config);
        this.updateMap();
        $('#modal-addDataLayer').modal('hide');

        if (!$layers.is(':visible')) {
          $layers.prev().hide();
          $('#customize .content').css({
            padding: 0
          });
          $layers.show();
        }

        $layers.append($('<li><div style="background-color:#EFECE2;font-size:15px;font-weight:bold;padding:45px 0;position:absolute;text-align:center;width:35px;">A</div><div style="left:35px;height:74px;padding:18px 15px;position:absolute;right:0;"><span style="color:#44433A;display:block;font-size:13px;font-weight:bold;">' + name + '</span><span style="bottom:18px;display:block;height:20px;position:absolute;width:201px;"><img src="img/edit-layer.png" style="cursor:pointer;float:left;"><img src="img/delete-layer.png" style="cursor:pointer;float:right;margin-top:3px;"></span></div></li>'));
      }
    },
    /**
     *
     */
    updateMap: function() {
      $('iframe').attr('src', 'iframe.html?c=' + encodeURIComponent(JSON.stringify(NPMap.config)));
    }
  };
})();
NPMap.config = {
  "api": "leaflet",
  "div": "map"
};

NPMap.builder.updateMap();