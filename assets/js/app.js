var currentFocus = {};
var currentValue = {};
var realValue    = {};
var namePrefix   = 'column'

var constructParams = function() {
  var odds = []
  for (var e in realValue) {
    var param = {}
    var value = realValue[e].val();
    param[realValue[e].attr('name')] = value;
    var name = realValue[e].closest('.column').find('.name').val();
    if (name) {
      param['name'] = name;
    } else {
      param['name'] = namePrefix + '-' + e;
    }
    if (value) {
      odds.push(param);
    }
  }
  var params = {}
  var name = $('.input#name').val();
  if (name) {
    params['name'] = name;
  }
  params['odds'] = odds
  if (odds.length > 0) {
    window.history.replaceState(params, 'Odds Converter', '/?' + jQuery.param(params))  
  }
  return params;
}
var calculate = function() {
  odds = constructParams();
  $.getJSON('/odds', odds, function(data){
    for (var idx in data.odds) {
      var columnParent;
      if (data.odds[idx].name.startsWith(namePrefix)) {
        columnParent = $('.columns .column.odd').get().find(function(e) { return $(e).data('order') == data.odds[idx].name.split('-')[1] })
      } else {
        columnParent = $('.columns .column.odd').get().find(function(e) { return $(e).find('.name').val() == data.odds[idx].name })
      }
      $(columnParent).find('input.american').  val(data.odds[idx]['american']);
      $(columnParent).find('input.decimal').   val(data.odds[idx]['decimal'].toFixed(3));
      $(columnParent).find('input.fractional').val(data.odds[idx]['fractional']);
      $(columnParent).find('input.implied').   val(data.odds[idx]['implied'].toFixed(3));
      if (data.odds.length > 1) {
        $(columnParent).find('input.actual').    val(data.odds[idx]['actual'].toFixed(3));
      }
    }
    if (data.odds.length > 1) {
      $('.input.vig').val(data.vig.toFixed(3));
      $('.input.total').val(data.total_probability.toFixed(3));
    }
    for (var e in currentFocus) {
      currentValue[e] = currentFocus[e].val();
    }
  })
}
var addColumn = function() {
  var ele;
  ele = $('.columns .column.odd').last().clone(true);
  ele.find('.extra').remove();
  ele.find('.hidden').removeClass('hidden');
  ele.find('.input').val('');
  $('.columns.main').append(ele);
  ele.data('order', $('.columns .column.odd').get().length - 1)
}

$(function() {
  $('#form-multi input.input.value').on('focus', function(e) {
    currentParent = $(this).closest('.column').data('order');
    currentValue[currentParent] = $(this).val();
    currentFocus[currentParent] = $(this);
  })
  $('#form-multi input.input.value').on('blur', function(e) {
    var currentItem = $(this)
    currentParent = currentItem.closest('.column').data('order');
    newValue = currentItem.val();
    if (newValue && newValue != currentValue[currentParent]) {
      realValue[currentParent] = currentItem;
      calculate();
    } else {
      constructParams();
    }
  });
    
  $('#form-multi').on('submit', function(e) {
    e.preventDefault();
    var isChanged = false;
    for (var e in currentFocus) {
      newValue = currentFocus[e].val()
      isChanged = isChanged || (newValue && newValue != realValue[e]);
      if (newValue && newValue != realValue[e]) {
        realValue[e] = currentFocus[e];
      }
    }
    if (isChanged) {
      calculate();
    } else {
      constructParams();
    }
  })

  $('#reset').on('click', function(e) {
    $('.input.value').val('');
    $('.input.name').val('');
    window.history.replaceState({}, 'Odds Converter', '/')
  })
  $('#add').on('click', function(e) {
    addColumn();
  })
  $('.remove').on('click', function(e) {
    $(this).closest('.columns .column.odd').remove();
    $('.columns .column.odd').each(function(idx) {
      $(this).data('order', idx);
    })
  })

  // console.log(location.search);
  if (location.search) {
    $.getJSON('/odds' + location.search, function(data){
      console.log(data);
      if (data.odds.length > 1) {
        for(var i=0; i < data.odds.length - 2; i++){
          addColumn();
        }
      }
      for (var idx in data.odds) {
        // var columnParent;
        var columnParent = $('.columns .column.odd').get()[idx]
        if (!data.odds[idx].name.startsWith(namePrefix)) {
          $(columnParent).find('input.name').      val(data.odds[idx].name);
        }
        $(columnParent).find('input.american').  val(data.odds[idx].american);
        $(columnParent).find('input.decimal').   val(data.odds[idx].decimal.toFixed(3));
        $(columnParent).find('input.fractional').val(data.odds[idx].fractional);
        $(columnParent).find('input.implied').   val(data.odds[idx].implied.toFixed(3));
        if (data.odds.length > 1) {
          $(columnParent).find('input.actual').    val(data.odds[idx]['actual'].toFixed(3));
        }
        realValue[idx] = $(columnParent).find('input.american');
      }
      $('.input#name').val(data['name']);
      if (data.odds.length > 1) {
        $('.input.vig').val(data['vig'].toFixed(3));
        $('.input.total').val(data['total_probability'].toFixed(3));
      }
      for (var e in currentFocus) {
        currentValue[e] = currentFocus[e].val();
      }
    })
  }
})
