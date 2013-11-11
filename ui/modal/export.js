/* globals $, Builder */

Builder.ui = Builder.ui || {};
Builder.ui.modal = Builder.ui.modal || {};
Builder.ui.modal.export = (function() {
  function setHeight() {
    $('#modal-export .modal-body').css({
      height: $(document).height() - 200
    });
  }

  $('#modal-export').modal();
  $('[rel=tooltip]').tooltip({
    animation: false
  });
  setHeight();
  $(window).resize(setHeight);

  return {};
})();
