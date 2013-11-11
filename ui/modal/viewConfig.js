/* globals $, Builder, NPMap */

$('head').append($('<link rel="stylesheet" type="text/css">').attr('href', 'ui/modal/viewConfig.css'));

Builder.ui = Builder.ui || {};
Builder.ui.modal = Builder.ui.modal || {};
Builder.ui.modal.viewConfig = (function() {
  var $code = $('#modal-viewConfig-code');

  function setHeight() {
    $('#modal-viewConfig .modal-body').css({
      height: $(document).height() - 200
    });
  }

  $('#modal-viewConfig').modal().on('show.bs.modal shown.bs.modal', function() {
    var formatted = '',
        json = JSON.stringify(NPMap.config, null, 2).split('\n');

    $.each(json, function(i, v) {
      if (v !== null) {
        if (i !== 0 && i !== json.length - 1) {
          formatted += v + '\n';
        } else {
          if (i === json.length - 1) {
            formatted +=  v;
          } else {
            formatted += v + '\n';
          }
        }
      }
    });
    $code.val('var NPMap = ' + formatted + ';');
    $('#modal-viewConfig-code').on('click', function() {
      $(this).select();
    }).select();
  });
  $('[rel=tooltip]').tooltip({
    animation: false
  });
  setHeight();
  $(window).resize(setHeight);

  return {};
})();
