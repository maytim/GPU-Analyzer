var filters = {};
var database = [];

//Function to handle multiple filters
function aggregateFilter(){
  var rows = $("#fbody").find("tr").hide();

  var filtered = [];

  for(f in filters){
    //Check if 'All' is checked
    if($('#'+f+'_all').prop('checked')){
      filtered.push(rows);
    }
    else{
      var filtering = undefined;
      $.each(filters[f], function(i, v){
        if(v){
          if( f === 'm'){
            var temp = rows.filter(function(){
              var model = $(this)[0].cells[1].textContent;
              return (model === i) ? 1: 0;
            });
          }
          else if( f === 'p'){
            var temp = rows.filter(function(){
              var price = parseInt($(this)[0].cells[2].textContent.replace("$",""));
              var keys = i.split('-',2);
              var min = keys[0];
              var max = keys[1];
              return (price < max && price >= min) ? 1: 0;
            });
          }
          else if(f === 'search' && typeof filters[f] !== 'undefined'){
            var r = new RegExp(v, 'i');
            var temp = rows.filter(function(){ return $(this).text().match(r); });
           }
          filtering = (!filtering) ? temp : filtering.add(temp);
        }
      });
      filtered.push(filtering);
    }
  }
  //Create final filter to show remaining rows
  var finalFilter;
  for( var i=0; i<filtered.length; i++){
    finalFilter = (!finalFilter) ? filtered[i] : filtered[i].filter(finalFilter);
  }
  if(finalFilter != null)
    finalFilter.show();
  else{
    rows.show();
  }
}

function generateTable(filter_data){
  //populate table
  var textToInsert = [];
  var i = 0;
  var length = database.length;
  for(var a=0; a<length; a++){
    //Generate entire table
    textToInsert[i++] = '<tr><td>';
    textToInsert[i++] = generateTableRow(a);
    textToInsert[i++] = '</td></tr>';

    //Get model data
    if(typeof filter_data !== 'undefined'){
      filter_data['models'].push( database[a]['GPU Name']);
    }
  }
  $("#fbody tr").remove();
  $("#fbody").append(textToInsert.join(''));

  //Sort model data
  if(typeof filter_data !== 'undefined'){
    filter_data['models'] = filter_data['models'].sort().filter(function(el,i,a){return i ==a.indexOf(el);});
  }

  textToInsert = null;
}
function generateTableRow(key){
  var item = database[key];
  return '<a href="/GPU-Analyzer/product?' + item['key'] + '">' + item['Name'] + '</a></td><td>' + item['GPU Name'] + '</td><td>' + item['Launch Price'];
}
function generateModelFilters(models){
  var textToInsert = [];
  var i = 0;
  var length = models.length;
  textToInsert[i++] = '<li><input type="checkbox" id="m_all" checked="checked" class="m_filter"/><label for="m_all">All</label></li>';
  for(var a=0; a<length; a++){
    textToInsert[i++] = '<li><input type="checkbox" id="m_'+a+'" m="'+models[a]+'" class="m_filter"/><label for="m_'+a+'">'+models[a]+'</label></li>';
  }
  $("#m-list").append(textToInsert.join(''));

  //Add click event listener to Model Filters
  $("#m_all").click(selectCheckboxAll("m"));

  for( var n=0; n<length; n++){
    $("#m_"+n).click(createModelFilter(n));
  }
}


function init() {
  $.getJSON("specification-data-2.json", {_: new Date().getTime()}, function(data){
    database = $.map(data, function(v){return v;});

    //Generate table
    var filter_data = {};
    filter_data['models'] = [];
    generateTable(filter_data);
    //Generate filters
    generateModelFilters(filter_data['models']);
  });
}

function createPriceFilter(n) {
  return function(){
    var min = parseInt($("#p_"+n).attr('p-min'));
    var max = parseInt($("#p_"+n).attr('p-max'));
    if( $("#p_"+n).is(':checked')){
      if( !filters['p'] )
        filters['p'] = {}
      filters['p'][(min+'-'+max)] = 1;

      //uncheck 'All'
      $("#p_all").prop('checked', false);
    }
    else{
      if($('.p_filter:checked').length == 0){
        //check 'All'
        $("#p_all").prop('checked', true);
      }
      if( !filters['p'] )
        filters['p'] = {}
      filters['p'][(min+'-'+max)] = 0;
    }
    aggregateFilter();
  };
}
function createModelFilter(n) {
  return function(){
    var m = $("#m_"+n).attr('m');
    if( $("#m_"+n).is(':checked')){
      if( !filters['m'] )
        filters['m'] = {}
      filters['m'][m] = 1;

      //uncheck 'All'
      $("#m_all").prop('checked', false);
    }
    else{
      if($('.m_filter:checked').length == 0){
        //check 'All'
        $("#m_all").prop('checked', true);
      }
      if( !filters['m'] )
        filters['m'] = {}
      filters['m'][m] = 0;
    }
    aggregateFilter();
  };
}

function selectCheckboxAll(name){
  return function(){
    //Uncheck all others
    $("."+name+"_filter:checked").prop('checked',false);
    //Make it checked
    $("#"+name+"_all").prop('checked',true);
    //Set all filters to false
    for(var key in filters[name]){
      filters[name][key] = 0;
    }
    //update the table filter
    aggregateFilter();
  };
}

$(document).ready(function(){
  init();

  for( var n=1; n<5; n++){
    $("#p_"+n).click(createPriceFilter(n));
  }

  $("#p_all").click(selectCheckboxAll("p"));

  $(".title").click(function(){
    var list = $("#"+$(this).attr('data-id')+"-list");
    list.toggle();
    if(list.css('display') === 'none'){
      $(this).removeClass('arrow-down').addClass('arrow-up');
    }
    else{
      $(this).removeClass('arrow-up').addClass('arrow-down');
    }
  });

  $('.custom-header').click(function(){
    var k = $(this).attr('data-type');
    var dir = $(this).attr('data-dir');
    $('.custom-header').removeClass('asc-header dsc-header');
    $(this).addClass(dir+'-header');
    $(this).attr('data-dir', (dir == 'asc') ? 'dsc' : 'asc');

    /// Need to update for database
    var sortfct = (dir === 'asc') ? function(a,b){return a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0;} : function(a,b){return a[k] < b[k] ? 1 : a[k] > b[k] ? -1 : 0;};
    database.sort(sortfct);
    generateTable();
    aggregateFilter();
  });

  $("#searchFilter").keyup(function(){
    if( !filters['search'] )
          filters['search'] = {};
    filters['search']['val'] = this.value;
    aggregateFilter();
  });
});
