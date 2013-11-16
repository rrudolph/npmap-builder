/* globals $, Builder */

$('head').append($('<link rel="stylesheet">').attr('href', 'ui/modal/addBaseMaps.css'));

Builder.ui = Builder.ui || {};
Builder.ui.modal = Builder.ui.modal || {};
Builder.ui.modal.addBaseMaps = (function() {
  var baseMaps = document.getElementById('iframe-map').contentWindow.L.npmap.preset.layers,
      html = '';

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
    $('#modal-addBaseMaps .modal-body').css({
      height: $(document).height() - 200
    });
  }

  for (var provider in baseMaps) {
    if (provider !== 'openstreetmap') {
      var count = 0,
        maps = baseMaps[provider],
        providerPretty = getProvider(provider);

      html += '<div class="well"><h5>' + providerPretty + '</h5><div class="row">';

      for (var map in maps) {
        html += '' +
          '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">' +
            '<div class="thumbnail">' +
              '<p>' + maps[map].name.replace(providerPretty + ' ', '') + '</p>' +
              //'<img src="../../img/base-maps/' + provider + '-' + map + '.png" alt="...">' +
              '<img src="http://placehold.it/300x300">' +
              '<div class="caption" style="text-align:center;">' +
                '<button type="button" class="btn btn-default" data-toggle="button">Add</button>&nbsp;' +
                '<button type="button" class="btn btn-default" data-toggle="button">Default</button>' +
              '</div>' +
            '</div>' +
          '</div>';
        count++;
      }

      html += '</div></div>';
    }
  }

  $('#modal-addBaseMaps .modal-body').append(html);
  $('#modal-addBaseMaps').modal().on('show.bs.modal shown.bs.modal', function() {
    console.log(config);
  });
  $('[rel=tooltip]').tooltip({
    animation: false
  });
  setHeight();
  $(window).resize(setHeight);

  return {};
})();
