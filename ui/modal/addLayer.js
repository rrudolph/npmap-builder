$('head').append($('<link rel="stylesheet" type="text/css">').attr('href', 'ui/modal/addLayer.css'));

NPMap.builder.ui = NPMap.builder.ui || {};
NPMap.builder.ui.modal = NPMap.builder.ui.modal || {};
NPMap.builder.ui.modal.addLayer = (function() {
  var $arcGisServerRestlayers = $('#modal-addLayer-arcGisServerRest-layers'),
      $arcGisServerRestOpacity = $('#modal-addLayer-arcGisServerRest-opacity').slider(),
      $arcGisServerRestUrl = $('#modal-addLayer-arcGisServerRest-url').bind('change paste keyup', function() {
        var value = $(this).val();

        if (value.toLowerCase().indexOf('mapserver') === (value.length - 9) || value.toLowerCase().indexOf('featureserver') === (value.length - 13)) {
          $.ajax({
            dataType: 'json',
            success: function(response) {
              $arcGisServerRestlayers.find('option').remove();
              $.each(response.layers, function(i, layer) {
                $arcGisServerRestlayers.append($('<option>', {
                  value: layer.id
                }).text(layer.id + ': ' + layer.name));
              });
            },
            url: value + '?f=json&callback=?'
          });
        }
      }),
      $layerAttribution = $('#layerAttribution'),
      $layerDescription = $('#layerDescription'),
      $layerName = $('#modal-addLayer-layerName'),
      $modal = $('#modal-addLayer').modal().on('hidden.bs.modal', function() {
        // TODO: Clean up and reset form(s).
        // TODO: Pan content div up to 0.
      }).on('show.bs.modal shown.bs.modal', function() {
        $layerName.focus();
      }),
      $search = $('#modal-addLayer-search').typeahead([{
        header: '<h3 class="modal-addLayer-search-type">ArcGIS Online</h3>',
        limit: 10,
        prefetch: 'data/arcgisonline-search.json',
        valueKey: 'n'
      },{
        header: '<h3 class="modal-addLayer-search-type">ArcGIS Server</h3>',
        limit: 10,
        prefetch: 'data/arcgisserver-search.json',
        valueKey: 'n'
      },{
        header: '<h3 class="modal-addLayer-search-type">CartoDB</h3>',
        limit: 10,
        prefetch: 'data/cartodb-search.json',
        valueKey: 'n'
      },{
        header: '<h3 class="modal-addLayer-search-type">GitHub</h3>',
        limit: 10,
        prefetch: 'data/github-search.json',
        valueKey: 'n'
      },{
        header: '<h3 class="modal-addLayer-search-type">MapBox Hosting</h3>',
        limit: 10,
        prefetch: 'data/tilestream-search.json',
        valueKey: 'n'
      }]);

  $('#modal-addLayer .btn-primary').click(function() {
    NPMap.builder.ui.modal.addLayer._click();
  });
  $('[rel=tooltip]').tooltip();

  return {
    _click: function() {
      var config,
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
          var $layers = $('#ArcGisServerRest-layers'),
              $opacity = $('#ArcGisServerRest-opacity'),
              $url = $('#ArcGisServerRest-url'),
              layers = $layers.val(),
              opacity = $opacity.val(),
              url = $url.val();

          fields.push($opacity);
          fields.push($url);

          if (!opacity) {
            opacity = 100;
          } else {
            opacity = parseInt(opacity, 10);
          }

          opacity = (100 - opacity) / 100;

          if (!layers) {
            errors.push($layers);
          } else {
            layers = layers.join(',');
          }

          if (!url) {
            errors.push($url);
          }

          config = {
            "layers": layers,
            "opacity": opacity,
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
    }
  };
})();