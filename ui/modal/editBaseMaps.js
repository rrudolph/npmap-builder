/* globals $, Builder, NPMap */

$('head').append($('<link rel="stylesheet">').attr('href', 'ui/modal/editBaseMaps.css'));

Builder.ui = Builder.ui || {};
Builder.ui.modal = Builder.ui.modal || {};
Builder.ui.modal.editBaseMaps = (function() {
  var baseMaps = document.getElementById('iframe-map').contentWindow.L.npmap.preset.baselayers,
      html = '';

  function changeDefault(button) {

  }
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
  function setHeight() {
    $('#modal-editBaseMaps .modal-body').css({
      height: $(document).height() - 200
    });
  }
  function update() {
    $.each($('#modal-editBaseMaps div'), function(i, div) {
      var id = div.id;

      if ($.inArray(id, NPMap.baseLayers) !== -1) {
        console.log(id);
      }
    });
  }

  for (var provider in baseMaps) {
    if (provider !== 'openstreetmap') {
      var maps = baseMaps[provider],
        providerPretty = getProvider(provider);

      html += '<div class="well"><h5>' + providerPretty + '</h5><div class="row">';

      for (var map in maps) {
        if (map !== 'grayLabels' && map !== 'oceans') {
          var id = provider + '-' + map;

          html += '' +
            '<div id="' + id + '" class="col-xs-4 col-sm-4 col-md-4 col-lg-4">' +
              '<div class="thumbnail">' +
                '<p>' + maps[map].name.replace(provider.toUpperCase() + ' ', '').replace(providerPretty + ' ', '') + '</p>' +
                '<img src="../../img/base-maps/' + id + '.png" alt="...">' +
                '<div class="caption" style="text-align:center;">' +
                  '<button id="add-' + id + '" type="button" class="btn btn-default" data-toggle="button">Add</button>&nbsp;' +
                  '<button id="default-' + id + '" type="button" class="btn btn-default" data-toggle="button">Default</button>' +
                '</div>' +
              '</div>' +
            '</div>';
        }
      }

      html += '</div></div>';
    }
  }

  $('#modal-editBaseMaps .modal-body').append(html);
  $('#modal-editBaseMaps').modal().on('shown.bs.modal', update);
  $('[rel=tooltip]').tooltip({
    animation: false
  });
  setHeight();
  update();
  $(window).resize(setHeight);

  return {};
})();
