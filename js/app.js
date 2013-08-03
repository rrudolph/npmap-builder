var NPMap = NPMap || {};

NPMap.builder = (function() {
  var $buttonAddAnotherLayer,
      $modalAddLayer,
      $modalConfirm,
      $modalViewConfig,
      abcs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  $(document).ready(function() {
    $buttonAddAnotherLayer = $('#button-addAnotherLayer');
    $modalAddLayer = $('#modal-addLayer');
    $modalConfirm = $('#modal-confirm');
    $modalViewConfig = $('modal-viewConfig');

    $buttonAddAnotherLayer.on('click', function() {
      $('#modal-addLayer').modal('show');
    });
    $modalAddLayer.on('hidden', function() {
      // TODO: Clear all invalid fields and reset forms.
    }).on('shown', function() {
      $('#layerName').focus();
    });
    $modalViewConfig.on('shown', function() {
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

      $('#code').val('<!doctype html>\n<html>\n  <head>\n  </head>\n  <body>\n    <div id="map" style="height:500px;width:500px;"></div>\n    <script>\n      var NPMap = {\n        config: ' + formatted + '\n      };\n    </scr' + 'ipt>;\n  </body>\n</html>');
    });
    $('#metadata .description a').editable();
    $('#metadata .title a').editable();
    $('[rel=tooltip]').tooltip();
  });

  return {
    _handlers: {
      /**
       *
       */
      layerRemoveOnClick: function(el) {
        NPMap.builder.showConfirm('Yes, remove the layer', 'Once the layer is removed, you cannot get it back.', 'Are you sure?', function() {
          NPMap.builder.removeLayerLi(el);
          NPMap.builder.removeLayer($(el).parent().prev()[0].innerHTML);
        });
        return false;
      },
      /**
       *
       */
      layerTypeOnChange: function(value) {
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
    _refreshLayersUl: function() {
      var $ul = $('#layers');

      if ($ul.children().length === 0) {
        $buttonAddAnotherLayer.hide();
        $ul.prev().css('padding', '15px 18px').show();
      } else {
        $buttonAddAnotherLayer.show();
        $ul.prev().css('padding', '0').hide();
      }
    },
    /**
     *
     */
    addLayer: function() {
      var $layerAttribution = $('#layerAttribution'),
          $layerDescription = $('#layerDescription'),
          $layerName = $('#layerName'),
          config,
          errors = [],
          fields = [$layerAttribution, $layerDescription, $layerName],
          layerAttribution = $layerAttribution.val(),
          layerDescription = $layerDescription.val(),
          layerName = $layerName.val();

      if (!layerName) {
        errors.push($layerName);
      }

      if (typeof NPMap.config.layers === 'undefined') {
        NPMap.config.layers = [];
      }

      if ($('#ArcGisServerRest').is(':visible')) {
        (function() {
          var $url = $('#ArcGisServerRest-url'),
              url = $url.val();

          fields.push($url);

          if (!url) {
            errors.push($url);
          }

          config = {
            "type": "ArcGisServerRest",
            "url": url
          };
        })();
      } else if ($('#CartoDb').is(':visible')) {
        (function() {
          var $table = $('#CartoDb-table'),
              table = $table.val(),
              $user = $('#CartoDb-user'),
              user = $user.val();

          fields.push($table);
          fields.push($user);

          if (!table) {
            errors.push($table);
          }

          if (!user) {
            errors.push($user);
          }

          config = {
            "table": table,
            "type": "CartoDb",
            "user": user
          };
        })();
      } else if ($('#Kml').is(':visible')) {
        (function() {
          var $url = $('#Kml-url'),
              url = $url.val();

          fields.push($url);

          if (!url) {
            errors.push($url);
          }

          config = {
            "type": "Kml",
            "url": url
          };
        })();
      } else if ($('#GeoJson').is(':visible')) {
        (function() {
          var $url = $('#GeoJson-url'),
              url = $url.val();

          fields.push($url);

          if (!url) {
            errors.push($url);
          }

          config = {
            "type": "GeoJson",
            "url": url
          };
        })();
      } else if ($('#TileStream').is(':visible')) {
        (function() {
          var $id = $('#TileStream-id'),
              id = $id.val();

          fields.push($id);

          if (!id) {
            errors.push($id);
          }

          config = {
            "id": id,
            "type": "TileStream"
          };
        })();
      }

      if (errors.length) {
        $.each(errors, function(i, $el) {
          $el.parent().parent().addClass('error');
        });
      } else {
        var $layers = $('#layers');

        config.attribution = layerAttribution || null,
        config.description = layerDescription || null,
        config.name = layerName;

        NPMap.config.layers.push(config);
        this.updateMap();
        $('#modal-addLayer').modal('hide');

        if (!$layers.is(':visible')) {
          $layers.prev().hide();
          $('#customize .content').css({
            padding: 0
          });
          $layers.show();
        }

        // TODO: Extend this out so it is called every time the modal is hidden.
        $.each(fields, function(i, field) {
          $(field).val('');
        });
        $layers.append($('<li><div style="background-color:#EFECE2;cursor:move;font-size:15px;font-weight:bold;padding:45px 0;position:absolute;text-align:center;width:35px;">' + abcs[$layers.children().length] + '</div><div style="left:35px;height:74px;padding:18px 15px;position:absolute;right:0;"><span style="color:#44433A;display:block;font-size:13px;font-weight:bold;">' + layerName + '</span><span style="bottom:18px;display:block;height:20px;position:absolute;width:201px;"><img src="img/edit-layer.png" style="cursor:pointer;float:left;"><button style="background-color:transparent;border:none;float:right;" onclick="NPMap.builder._handlers.layerRemoveOnClick(this);"><img src="img/remove-layer.png" style="cursor:pointer;float:right;margin-top:3px;"></button></span></div></li>'));
        this._refreshLayersUl();
      }
    },
    /**
     *
     */
    removeLayer: function(name) {
      NPMap.config.layers = $.grep(NPMap.config.layers, function(layer) {
        return layer.name !== name;
      });
      this.updateMap();
    },
    removeLayerLi: function(el) {
      $(el).parent().parent().parent().remove();
      this._refreshLayersUl();
    },
    showConfirm: function(button, content, title, callback) {
      $($modalConfirm.find('.btn-primary')[0]).html(button).on('click', function() {
        $modalConfirm.modal('hide');
        callback();
      });
      $($modalConfirm.find('.modal-body')[0]).html(content);
      $($modalConfirm.find('h3')[0]).html(title);
      $modalConfirm.modal('show');
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