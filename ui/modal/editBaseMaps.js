/* globals $, Builder, NPMap */

$('head').append($('<link rel="stylesheet">').attr('href', 'ui/modal/editBaseMaps.css'));

Builder.ui = Builder.ui || {};
Builder.ui.modal = Builder.ui.modal || {};
Builder.ui.modal.editBaseMaps = (function() {
  var baseMaps = document.getElementById('iframe-map').contentWindow.L.npmap.preset.baselayers,
      html = [];

  function getProvider(provider) {
    switch (provider) {
    case 'esri':
      return 'Esri';
    case 'mapbox':
      return 'MapBox';
    case 'nps':
      return 'National Park Service';
    case 'stamen':
      return 'Stamen';
    default:
      return provider;
    }
  }
  function setBaseMapsAndHide() {
    var baseLayers = [];

    $.each($('#modal-editBaseMaps div.basemap'), function(i, div) {
      var id = div.id,
        inputs = $(div).find('input');

      if ($(inputs[0]).prop('checked')) {
        if ($(inputs[1]).prop('checked')) {
          baseLayers.unshift(id);
        } else {
          baseLayers.push(id);
        }
      }
    });

    NPMap.baseLayers = baseLayers;
    Builder.updateMap();
    $('#modal-editBaseMaps').modal('hide');
  }
  function setHeight() {
    $('#modal-editBaseMaps .modal-body').css({
      height: $(document).height() - 200
    });
  }
  function update() {
    var active;

    $.each($('#modal-editBaseMaps div.basemap'), function(i, div) {
      var checked = false,
        id = div.id;

      if ($.inArray(id, NPMap.baseLayers) !== -1) {
        checked = true;
      }

      $($(div).find('input')[0]).prop('checked', checked);
    });

    for (var i = 0; i < NPMap.baseLayers.length; i++) {
      var baseLayer = NPMap.baseLayers[i];

      if (typeof baseLayer.visible === 'undefined' || baseLayer.visible === true) {
        active = baseLayer;
        break;
      }
    }

    $($('#' + active).find('input')[1]).prop('checked', true);
  }

  for (var provider in baseMaps) {
    if (provider !== 'openstreetmap') {
      var content = '',
        maps = baseMaps[provider],
        providerPretty = getProvider(provider);

      content += '<div class="well"><h5>' + providerPretty + '</h5><div class="row">';

      for (var map in maps) {
        if (map !== 'grayLabels' && map !== 'oceans') {
          var id = provider + '-' + map;

          content += '' +
            '<div id="' + id + '" class="basemap col-xs-4 col-sm-4 col-md-4 col-lg-4">' +
              '<div class="thumbnail">' +
                '<p>' + maps[map].name.replace(provider.toUpperCase() + ' ', '').replace(providerPretty + ' ', '') + '</p>' +
                '<img src="../../img/base-maps/' + id + '.png" alt="..." style="height:152px;width:152px;">' +
                '<div class="caption">' +
                  '<div class="checkbox-inline">' +
                    '<label style="font-weight:normal;margin-bottom:0;">' +
                      '<input type="checkbox">' +
                      ' Add to Map?' +
                    '</label>' +
                  '</div>' +
                  '<div class="radio-inline">' +
                    '<label style="font-weight:normal;margin-bottom:0;">' +
                      '<input type="radio" name="default-basemap">' +
                        ' Make default?' +
                    '</label>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
        }
      }

      content += '</div></div>';

      if (provider === 'nps') {
        html.unshift(content);
      } else {
        html.push(content);
      }
    }
  }

  $('#modal-editBaseMaps .btn-primary').on('click', setBaseMapsAndHide);
  $('#modal-editBaseMaps .modal-body').append(html.join(''));
  $('#modal-editBaseMaps').modal({
    backdrop: 'static'
  })
    .on('show.bs.modal', update);
  $('[rel=tooltip]').tooltip({
    animation: false
  });
  setHeight();
  update();
  $(window).resize(setHeight);

  return {};
})();
