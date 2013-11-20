// TODO: Add default baseLayer here. This should be done separate of NPMap.js.



var NPMap = {
  'div': 'map'
};

var Builder = (function() {
  var
    $buttonAddAnotherLayer,
    $iframe = $('#iframe-map'),
    $modalAddBaseMaps,
    $modalAddLayer,
    $modalConfirm,
    $modalExport,
    $modalViewConfig,
    $stepSection = $('section .step'),
    $ul = $('#layers'),
    //accordionHeightSet = false,
    descriptionSet = false,
    descriptionZ = null,
    stepLis,
    titleSet = false,
    titleZ = null;

  /**
   * Changes the step.
   * @param {Number} from
   * @param {Number} to
   */
  function goToStep(from, to) {
    $($stepSection[from]).hide();
    $($stepSection[to]).show();
    $(stepLis[from]).removeClass('active');
    $(stepLis[to]).addClass('active');

    /*
    if (to === 1 && !accordionHeightSet) {
      setAccordionHeight('#accordion-step-2');
      accordionHeightSet = true;
    }
    */
  }
  /**
   * Loads a UI module.
   * @param {String} module
   * @param {Function} callback (Optional)
   */
  function loadModule(module, callback) {
    module = module.replace('Builder.', '').replace(/\./g,'/');

    $.ajax({
      dataType: 'html',
      success: function (html) {
        $('body').append(html);
        $.getScript(module + '.js', function() {
          if (callback) {
            callback();
          }
        });
      },
      url: module + '.html'
    });
  }
  /**
   * Sets a height for each of an accordion's child panels.
   * @param {String} selector
   */
  function setAccordionHeight(selector) {
    var $accordion = $(selector),
      outerHeight = $accordion.outerHeight();

    if (outerHeight) {
      var panels = $accordion.find('.panel'),
        headerHeight = panels.length * 37;

      $.each(panels, function(i, panel) {
        var $child = $(panel).find('.panel-collapse');
        $($child.children()[0]).height(outerHeight - headerHeight - 30 - 5);
      });
    }
  }

  $(document).ready(function() {
    $('#button-addAnotherLayer, #button-addLayer').on('click', function() {
      if ($modalAddLayer) {
        $modalAddLayer.modal('show');
      } else {
        loadModule('Builder.ui.modal.addLayer', function() {
          $modalAddLayer = $('#modal-addLayer');
        });
      }
    });
    $('#button-addBaseMaps').on('click', function() {
      if ($modalAddBaseMaps) {
        $modalAddBaseMaps.modal('show');
      } else {
        loadModule('Builder.ui.modal.addBaseMaps', function() {
          $modalAddBaseMaps = $('#modal-addBaseMaps');
        });
      }
    });
    $('#button-export').on('click', function() {
      if ($modalExport) {
        $modalExport.modal('show');
      } else {
        loadModule('Builder.ui.modal.export', function() {
          $modalExport = $('#modal-export');
        });
      }
    });
    $('#button-saveMap').on('click', function() {
      // TODO: Check for required fields and then save map to service. http://npmap_builder:321redliub_pampn@162.243.77.34/builder/
      var newNPMap = {'userJson' : $.extend(true, {}, NPMap)};
      newNPMap.mapName = $('.title a').text();
      newNPMap.isPublic = true;
      newNPMap.isShared = true;
      newNPMap.userJson.description = $('.description a').text();
      //console.log(newNPMap);
      var serverUrl = 'http://npmap_builder:321redliub_pampn@162.243.77.34/builder';
      $.ajax({
        type: 'POST',
        xhrFields: { withCredentials: true }, 
        url: serverUrl,
        data: JSON.stringify(newNPMap),
        processData: false,
        contentType: false,
        success: function(data) {
          console.log('success:', data);
        },
        error: function(data) {
          console.log('error', data);
        }
      });
    });
    $('#button-viewConfig').on('click', function() {
      if ($modalViewConfig) {
        $modalViewConfig.modal('show');
      } else {
        loadModule('Builder.ui.modal.viewConfig', function() {
          $modalViewConfig = $('#modal-viewConfig');
        });
      }
    });

    $buttonAddAnotherLayer = $('#button-addAnotherLayer');
    $modalConfirm = $('#modal-confirm');
    stepLis = $('#steps li');

    $.each(stepLis, function(i, li) {
      $(li.childNodes[0]).on('click', function() {
        var currentIndex = -1;

        for (var j = 0; j < stepLis.length; j++) {
          if ($(stepLis[j]).hasClass('active')) {
            currentIndex = j;
            break;
          }
        }

        if (currentIndex !== i) {
          goToStep(currentIndex, i);
        }
      });
    });
    $($('section .step .btn-primary')[0]).on('click', function() {
      goToStep(0, 1);
    });
    $($('section .step .btn-primary')[1]).on('click', function() {
      goToStep(1, 2);
    });
    $('.dd').nestable({
      handleClass: 'letter',
      listNodeName: 'ul'
    }).on('change', function() {
      var overlays = [];

      $.each($ul.children(), function(i, li) {
        var from = parseInt($(li).attr('data-id'), 10);

        if (from !== i) {
          overlays.splice(i, 0, NPMap.overlays[from]);
        }

        $(li).attr('data-id', i.toString());
        li.childNodes[0].innerHTML = Builder._abcs[i];
      });

      if (overlays.length) {
        NPMap.overlays = overlays.reverse();
        Builder.updateMap();
      }

      Builder._refreshLayersUl();
    });
    $('#metadata .description a').editable({
      animation: false,
      container: '#metadata span:first-child',
      emptytext: 'Add a description to give your map context.',
      validate: function(value) {
        if ($.trim(value) === '') {
          return 'Please enter a description for your map.';
        }
      }
    }).on('hidden', function() {
      var next = $(this).next();

      if (!descriptionSet) {
        $('#mask').remove();
        next.css({
          'z-index': descriptionZ
        });
        $(next.find('button')[1]).css({
          display: 'block'
        });
        descriptionSet = true;
      }
    }).on('shown', function() {
      var next = $(this).parent().next();

      if (!descriptionSet) {
        descriptionZ = next.css('z-index');
        next.css({
          'z-index': 1031
        });
        $(next.find('button')[1]).css({
          display: 'none'
        });
      }

      next.find('textarea').css({
        'resize': 'none'
      });
    });
    $('#metadata .title a').editable({
      animation: false,
      emptytext: 'Untitled Map',
      validate: function(value) {
        if ($.trim(value) === '') {
          return 'Please enter a title for your map.';
        }
      }
    }).on('hidden', function() {
      var description = $('#metadata .description a').html(),
          next = $(this).next();

      if (!description || description === 'Add a description to give your map context.') {
        $('#metadata .description a').editable('toggle');
      }

      if (!titleSet) {
        next.css({
          'z-index': titleZ
        });
        $(next.find('button')[1]).css({
          display: 'block'
        });
        titleSet = true;
      }
    }).on('shown', function() {
      var next = $(this).next();

      if (!titleSet) {
        titleZ = next.css('z-index');
        next.css({
          'z-index': 1031
        });
        $(next.find('button')[1]).css({
          display: 'none'
        });
      }

      next.find('.editable-clear-x').remove();
      next.find('input').css({
        'padding-right': '10px'
      });
    });
    $('[rel=tooltip]').tooltip();
    $('#accordion-step-1').on('shown.bs.collapse', function() {
      setAccordionHeight('#accordion-step-1');
    });
    $('#set-dimensions-and-zoom .btn-block').on('click', function() {
      // Use map object to get center and zoom, then update spans and map and refresh.
    });
    $('#set-zoom').slider({
      center: 4,
      max: 19,
      min: 0,
      value: [0, 19]
    }).on('slideStop', function(e) {
      NPMap.maxZoom = e.value[1];
      NPMap.minZoom = e.value[0];
      Builder.updateMap();
    });
    setAccordionHeight('#accordion-step-1');
    $(window).resize(function() {
      setAccordionHeight('#accordion-step-1');
    });
    setTimeout(function() {
      $('#metadata .title a').editable('toggle');
    }, 200);
  });

  return {
    // PRIVATE: ABCs for the layer labels.
    _abcs: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
    // PRIVATE: HTML element handlers.
    _handlers: {
      /**
       *
       */
      layerRemoveOnClick: function(el) {
        Builder.showConfirm('Yes, remove the layer', 'Once the layer is removed, you cannot get it back.', 'Are you sure?', function() {
          Builder.removeLayerLi(el);
          Builder.removeLayer($(el).parent().prev()[0].innerHTML);
        });
        return false;
      }
    },
    /**
     *
     */
    _refreshLayersUl: function() {
      var previous = $ul.parent().prev();

      if ($ul.children().length === 0) {
        $buttonAddAnotherLayer.hide();
        previous.show();
      } else {
        $buttonAddAnotherLayer.show();
        previous.hide();
      }
    },
    /**
     *
     */
    removeLayer: function(name) {
      NPMap.overlays = $.grep(NPMap.overlays, function(layer) {
        return layer.name !== name;
      });
      this.updateMap();
    },
    /**
     *
     */
    removeLayerLi: function(el) {
      $(el).parent().parent().parent().remove();
      this._refreshLayersUl();
    },
    /**
     *
     */
    showConfirm: function(button, content, title, callback) {
      $($modalConfirm.find('.btn-primary')[0]).html(button).on('click', function() {
        $modalConfirm.modal('hide');
        callback();
      });
      $($modalConfirm.find('.modal-body')[0]).html(content);
      $($modalConfirm.find('h4')[0]).html(title);
      $modalConfirm.modal('show');
    },
    /**
     *
     */
    updateMap: function(callback) {
      var npmap = document.getElementById('iframe-map').contentWindow.NPMap;

      if (npmap) {
        var map = npmap.config.L;

        // TODO: This isn't hooked up in NPMap.js yet.
        NPMap.hooks = {
          init: function(callback) {
            map.setCenter(map.getCenter());
            map.setZoom(map.getZoom());
            callback();
          }
        };
      }

      $iframe.attr('src', 'iframe.html?c=' + encodeURIComponent(JSON.stringify(NPMap)));
      var interval = setInterval(function() {
        var npmap = document.getElementById('iframe-map').contentWindow.NPMap;

        if (npmap && npmap.config && npmap.config.center) {
          clearInterval(interval);
          config = npmap.config;

          if (callback) {
            callback(npmap.config);
          }
        }
      }, 100);
    }
  };
})();
Builder.updateMap(function(config) {
  // TODO: Grab details if this map is being loaded and populate necessary fields.
  NPMap.center = {
    lat: config.center.lat,
    lng: config.center.lng
  };
  NPMap.zoom = config.zoom;
  $('#set-dimensions-and-zoom .lat').html(NPMap.center.lat);
  $('#set-dimensions-and-zoom .lng').html(NPMap.center.lng);
  $('#set-dimensions-and-zoom .zoom').html(NPMap.zoom);
});
