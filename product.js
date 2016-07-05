$.extend($.fn.dataTableExt.oSort, {
  "price-custom-asc": function(a,b){
    a = parsePriceCustomCompare(a, 99999);
    b = parsePriceCustomCompare(b, 99999);

    return (a==b) ? 0 : ((a<b) ? -1 : 1);
  },
  "price-custom-desc": function(a,b){
    a = parsePriceCustomCompare(a, 0);
    b = parsePriceCustomCompare(b, 0);

    return (a==b) ? 0 : ((a<b) ? 1 : -1);
  }
});

$(document).ready(function(){
  var key = location.search.substr(1);
  $.getJSON("specification-data-3.json", {_: new Date().getTime()}, function(data){
    var object = data[key];
    $("#spec-table").append(generateSpecTable(object));

    //console.log(object);
    $("#image").attr('src',object['Image']);

    var textToInsert = [];
    var i = 0;
    var length = object['Retail Boards'].length;
    for(var a=0; a<length; a++){
      //Generate entire table
      textToInsert[i++] = generateVariantRow(object['Retail Boards'][a]);
    }

    $("#variant-tbody").append(textToInsert.join(''));
    $("#variant-table").DataTable({
       "bLengthChange": false,
       "bFilter": false,
       "language": {
         "paginate": {
           "previous": "<",
           "next": ">"
         }
       },
       columnDefs: [
         {targets: 0, type:'price-custom'}
       ]
    });
  });
});

function generateSpecTable(item){
  return '<thead><tr><th colspan="2">' + item['Name'] + ' Specifications' + '</th></tr></thead>' + '<tbody><tr><td>Release Date</td><td>' + item['Released'] + '</td></tr>' + '<tr><td>Performance</td><td>' + '-Insert Performance Data Here-' + '</td></tr>' + '<tr><td>Dimensions</td><td>' + item['Length'] + '</td></tr>' + '<tr><td>Clock Speed</td><td>' + item['GPU Clock'] + '</td></tr>' + '<tr><td>Video Memory</td><td>' + item['Memory Size'] + '</td></tr></tbody>';
}

function generateVariantRow(item){
  var link ='#';
  var price = 'Unavailable';
  if(item['Amazon']){
    link = item['Amazon']['link'];
    price = item['Amazon']['price'];
  }
  return '<tr><td><a href="' + link + '">' + price + '</a></td><td>' + item['name'] + '</td><td>' + item['GPU Clock'] + '</td><td>' + item['Memory Clock'] + '</td><td>' + item['Other Changes'] + '</td></tr>';
}

function parsePriceCustomCompare(a, alt){
  var text = $.parseHTML(a)[0].innerText.replace(/[$,,]/g,'');

  if(isNaN(text)){
    return parseInt(alt);
  }
  else{
    return parseInt(text);
  }
}
